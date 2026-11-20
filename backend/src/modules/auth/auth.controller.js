const crypto = require("crypto");
const prisma = require("../../config/prisma");
const { OAuth2Client } = require("google-auth-library");

const { hashPassword, comparePassword, generateOtp, hashOtp } = require("./auth.service");
const { generateToken } = require("./jwt.service");
const { sendOtpEmail } = require("./otp.service");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
    // Getting information from req.body
    const { firstName, lastName, email, password, role } = req.body;

    const allowedRoles = ["CLIENT", "FREELANCER"];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Role must be CLIENT or FREELANCER",
        });
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Email is already registered",
        });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
        }
    });

    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
    });
};


const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.password) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const isPasswordCorrect = await comparePassword(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    // Check whether this device is already trusted
    const trustedDeviceToken = req.cookies.trustedDevice;

    if (trustedDeviceToken) {
        const deviceId = hashOtp(trustedDeviceToken);

        const trustedDevice = await prisma.trustedDevice.findUnique({
            where: {
                userId_deviceId: {
                    userId: user.id,
                    deviceId,
                },
            },
        });

        if (trustedDevice) {
            await prisma.trustedDevice.update({
                where: { id: trustedDevice.id },
                data: { lastUsedAt: new Date() },
            });

            const token = generateToken(user);

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
            });
        }
    }

    // Generate a temporary device token and OTP
    const deviceToken = req.cookies.pendingDevice ||
        crypto.randomBytes(32).toString("hex");
    const deviceId = hashOtp(deviceToken);

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    // Remove previous unused OTPs for this device
    await prisma.loginOtp.deleteMany({
        where: {
            userId: user.id,
            deviceId,
            consumedAt: null,
        },
    });

    // Save the hashed OTP
    await prisma.loginOtp.create({
        data: {
            userId: user.id,
            deviceId,
            otpHash,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
    });

    // Keep the temporary device token in an HTTP-only cookie
    res.cookie("pendingDevice", deviceToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000,
    });

    try {
        await sendOtpEmail(user.email, otp);

        return res.status(200).json({
            success: true,
            requiresOtp: true,
            message: "Verification code sent to your email",
        });
    } catch (error) {
        await prisma.loginOtp.deleteMany({
            where: { 
                userId: user.id, 
                deviceId,
                consumedAt: null,
            },
        });

        res.clearCookie("pendingDevice");

        console.error("OTP email error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to send verification code",
        });
    }
};


const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required",
        });
    }

    if (!/^\d{6}$/.test(String(otp))) {
        return res.status(400).json({
            success: false,
            message: "OTP must be a 6-digit number",
        });
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid verification request",
        });
    }

    const deviceToken = req.cookies.pendingDevice;

    if (!deviceToken) {
        return res.status(401).json({
            success: false,
            message: "Verification session expired. Please log in again.",
        });
    }

    const deviceId = hashOtp(deviceToken);

    const loginOtp = await prisma.loginOtp.findFirst({
        where: {
            userId: user.id,
            deviceId,
            consumedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!loginOtp) {
        return res.status(400).json({
            success: false,
            message: "Invalid or expired OTP",
        });
    }

    if (loginOtp.expiresAt < new Date()) {
        return res.status(400).json({
            success: false,
            message: "OTP has expired. Please log in again.",
        });
    }

    if (loginOtp.attempts >= 5) {
        return res.status(429).json({
            success: false,
            message: "Too many attempts. Please log in again.",
        });
    }

    const isOtpCorrect = hashOtp(otp) === loginOtp.otpHash;

    if (!isOtpCorrect) {
        const result = await prisma.loginOtp.updateMany({
            where: {
                id: loginOtp.id,
                consumedAt: null,
                attempts: { lt: 5 },
                expiresAt: { gt: new Date() },
            },
            data: {
                attempts: { increment: 1 },
            },
        });
    
        if (result.count === 0) {
            return res.status(429).json({
                success: false,
                message: "OTP is expired, already used, or attempts exceeded. Please log in again.",
            });
        }
    
        return res.status(400).json({
            success: false,
            message: "Incorrect verification code",
        });
    }

    // Atomically mark OTP as used
const consumedOtp = await prisma.loginOtp.updateMany({
    where: {
        id: loginOtp.id,
        consumedAt: null,
        attempts: { lt: 5 },
        expiresAt: { gt: new Date() },
    },
    data: {
        consumedAt: new Date(),
    },
});

if (consumedOtp.count === 0) {
    return res.status(400).json({
        success: false,
        message: "OTP is invalid, expired, or already used. Please log in again.",
    });
}

    // Save this device as trusted
    await prisma.trustedDevice.upsert({
        where: {
            userId_deviceId: {
                userId: user.id,
                deviceId,
            },
        },
        update: {
            lastUsedAt: new Date(),
        },
        create: {
            userId: user.id,
            deviceId,
            deviceName: "Trusted Browser",
        },
    });

    // Set trusted-device cookie
    res.cookie("trustedDevice", deviceToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.clearCookie("pendingDevice");

    const token = generateToken(user);

    return res.status(200).json({
        success: true,
        message: "OTP verified. Login successful.",
        token,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
    });
};


const googleLogin = async (req, res) => {
    try {
        const { idToken, role } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "Google ID token is required",
            });
        }

        let ticket;

        try {
            ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (error) {
            console.error("GOOGLE TOKEN VERIFICATION ERROR:", error.message);

            return res.status(401).json({
                success: false,
                message: "Invalid or expired Google ID token",
            });
        }

        const payload = ticket.getPayload();

        if (
            !payload ||
            !payload.sub ||
            !payload.email ||
            payload.email_verified !== true
        ) {
            return res.status(401).json({
                success: false,
                message: "Google account email is not verified",
            });
        }

        const {
            sub: googleId,
            email,
            given_name,
            family_name,
        } = payload;

        let user = await prisma.user.findUnique({
            where: { googleId },
        });

        if (!user) {
            user = await prisma.user.findUnique({
                where: { email },
            });
        }

        if (user) {
            if (user.googleId && user.googleId !== googleId) {
                return res.status(409).json({
                    success: false,
                    message: "This email is linked to another Google account",
                });
            }

            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId,
                        isVerified: true,
                    },
                });
            }
        }

        if (!user) {
            const allowedRoles = ["CLIENT", "FREELANCER"];

            if (!allowedRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: "Role must be CLIENT or FREELANCER",
                });
            }

            user = await prisma.user.create({
                data: {
                    firstName: given_name || "Google",
                    lastName: family_name || "User",
                    email,
                    googleId,
                    password: null,
                    role,
                    isVerified: true,
                },
            });
        }

        const trustedDeviceToken = req.cookies?.trustedDevice;

        if (trustedDeviceToken) {
            const deviceId = hashOtp(trustedDeviceToken);

            const trustedDevice = await prisma.trustedDevice.findUnique({
                where: {
                    userId_deviceId: {
                        userId: user.id,
                        deviceId,
                    },
                },
            });

            if (trustedDevice) {
                await prisma.trustedDevice.update({
                    where: { id: trustedDevice.id },
                    data: {
                        lastUsedAt: new Date(),
                    },
                });

                const token = generateToken(user);

                return res.status(200).json({
                    success: true,
                    message: "Google login successful",
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                    },
                });
            }
        }

        const deviceToken = req.cookies?.pendingDevice ||
            crypto.randomBytes(32).toString("hex");

        const deviceId = hashOtp(deviceToken);

        const otp = generateOtp();
        const otpHash = hashOtp(otp);

        await prisma.loginOtp.deleteMany({
            where: {
                userId: user.id,
                deviceId,
                consumedAt: null,
            },
        });

        await prisma.loginOtp.create({
            data: {
                userId: user.id,
                deviceId,
                otpHash,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        res.cookie("pendingDevice", deviceToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60 * 1000,
        });

        try {
            await sendOtpEmail(user.email, otp);

            return res.status(200).json({
                success: true,
                requiresOtp: true,
                message: "Verification code sent to your email",
            });
        } catch (error) {
            await prisma.loginOtp.deleteMany({
                where: {
                    userId: user.id,
                    deviceId,
                    consumedAt: null,
                },
            });

            res.clearCookie("pendingDevice");

            console.error("Google OTP email error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to send verification code",
            });
        }

    } catch (error) {
        console.error("GOOGLE LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Google authentication failed",
        });
    }
};

module.exports = {
    register, 
    login,
    verifyOtp,
    googleLogin,
};