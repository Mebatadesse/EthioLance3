const crypto = require("crypto");
const prisma = require("../../config/prisma");
const { OAuth2Client } = require("google-auth-library");

const { hashPassword, comparePassword, generateOtp, hashOtp } = require("./auth.service");
const { generateToken } = require("./jwt.service");
const { sendOtpEmail, sendPasswordResetEmail } = require("./otp.service");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



const register = async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;

    // 1. Validate role
    const allowedRoles = ["CLIENT", "FREELANCER"];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Role must be CLIENT or FREELANCER",
        });
    }

    // 2. Check whether email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Email is already registered",
        });
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 4. Create unverified user
    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            isVerified: false,
        },
    });

    try {
        // 5. Generate and hash OTP
        const otp = generateOtp();
        const otpHash = hashOtp(otp);

        // 6. Set OTP expiration (5 minutes)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // 7. Save OTP in database
        await prisma.registrationOtp.create({
            data: {
                userId: user.id,
                otpHash,
                expiresAt,
            },
        });

        // 8. Send OTP to user's email
        await sendOtpEmail(email, otp);

    } catch (error) {
        // 9. Clean up the unverified user
        try {
            await prisma.user.delete({
                where: { id: user.id },
            });
        } catch (cleanupError) {
            console.error("Registration cleanup failed:", cleanupError);
        }

        // 10. Forward the original error to centralized middleware
        throw error;
    }

    // 11. Return success
    return res.status(201).json({
        success: true,
        requiresOtp: true,
        message: "Registration successful. Please verify your email.",
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
    });
};



const verifyRegistrationOtp = async (req, res) => {
    const { email, otp } = req.body;

    // 1. Validate input
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

    // 2. Find the user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    if (user.isVerified) {
        return res.status(400).json({
            success: false,
            message: "Email is already verified",
        });
    }

    // 3. Find registration OTP
    const registrationOtp = await prisma.registrationOtp.findUnique({
        where: { userId: user.id },
    });

    if (!registrationOtp || registrationOtp.consumedAt) {
        return res.status(400).json({
            success: false,
            message: "Invalid or already used OTP",
        });
    }

    // 4. Check expiration
    if (registrationOtp.expiresAt < new Date()) {
        return res.status(400).json({
            success: false,
            message: "OTP has expired",
        });
    }

    // 5. Check maximum attempts
    if (registrationOtp.attempts >= 5) {
        return res.status(429).json({
            success: false,
            message: "Too many attempts. Please request a new OTP.",
        });
    }

    // 6. Compare OTP
    const isOtpCorrect = hashOtp(String(otp)) === registrationOtp.otpHash;

    if (!isOtpCorrect) {
        const result = await prisma.registrationOtp.updateMany({
            where: {
                id: registrationOtp.id,
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
                message: "OTP expired or maximum attempts exceeded",
            });
        }

        return res.status(400).json({
            success: false,
            message: "Incorrect verification code",
        });
    }

    // 7. Consume OTP and verify email atomically
    const verifiedUser = await prisma.$transaction(async (tx) => {
        const consumedOtp = await tx.registrationOtp.updateMany({
            where: {
                id: registrationOtp.id,
                consumedAt: null,
                attempts: { lt: 5 },
                expiresAt: { gt: new Date() },
            },
            data: {
                consumedAt: new Date(),
            },
        });

        if (consumedOtp.count === 0) {
            return null;
        }

        return await tx.user.update({
            where: { id: user.id },
            data: { isVerified: true },
        });
    });

    if (!verifiedUser) {
        return res.status(400).json({
            success: false,
            message: "OTP is invalid, expired, or already used",
        });
    }

    // 8. Return success
    return res.status(200).json({
        success: true,
        message: "Email verified successfully. You can now log in.",
        user: {
            id: verifiedUser.id,
            firstName: verifiedUser.firstName,
            lastName: verifiedUser.lastName,
            email: verifiedUser.email,
            role: verifiedUser.role,
            isVerified: verifiedUser.isVerified,
        },
    });
};

const resendRegistrationOtp = async (req, res) => {
    const { email } = req.body;

    // 1. Validate email
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    // 3. Check verification status
    if (user.isVerified) {
        return res.status(400).json({
            success: false,
            message: "Email is already verified",
        });
    }

    // 4. Check 60-second resend cooldown
    const existingOtp = await prisma.registrationOtp.findUnique({
        where: { userId: user.id },
    });

    if (existingOtp) {
        const timeSinceLastOtp =
            Date.now() - existingOtp.createdAt.getTime();

        const cooldown = 60 * 1000;

        if (timeSinceLastOtp < cooldown) {
            const remainingSeconds = Math.ceil(
                (cooldown - timeSinceLastOtp) / 1000
            );

            return res.status(429).json({
                success: false,
                message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
            });
        }
    }

    // 5. Generate a new OTP
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 6. Create or replace the previous OTP
    await prisma.registrationOtp.upsert({
        where: { userId: user.id },
        update: {
            otpHash,
            expiresAt,
            attempts: 0,
            consumedAt: null,
            createdAt: new Date(),
        },
        create: {
            userId: user.id,
            otpHash,
            expiresAt,
        },
    });

    // 7. Send new OTP
    await sendOtpEmail(email, otp);

    // 8. Return success
    return res.status(200).json({
        success: true,
        message: "A new verification code has been sent to your email",
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

    // Check 60-second resend cooldown
    const existingOtp = await prisma.loginOtp.findFirst({
        where: {
            userId: user.id,
            deviceId,
            consumedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (existingOtp) {
        const timeSinceLastOtp = Date.now() - existingOtp.createdAt.getTime();
        const cooldown = 60 * 1000;

        if (timeSinceLastOtp < cooldown) {
            const remainingSeconds = Math.ceil(
                (cooldown - timeSinceLastOtp) / 1000
            );

            return res.status(429).json({
                success: false,
                message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
            });
        }
    }

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
    } catch (error) {
        try {
            await prisma.loginOtp.deleteMany({
                where: {
                    userId: user.id,
                    deviceId,
                    consumedAt: null,
                },
            });
        } catch (cleanupError) {
            console.error("Login OTP cleanup failed:", cleanupError);
        }

        res.clearCookie("pendingDevice");

        throw error;
    }

    return res.status(200).json({
        success: true,
        requiresOtp: true,
        message: "Verification code sent to your email",
    });
};


const resendLoginOtp = async (req, res) => {
    const { email } = req.body;

    // 1. Validate email
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || !user.password || !user.isVerified) {
        return res.status(400).json({
            success: false,
            message: "Invalid login verification request",
        });
    }

    // 3. Get the pending device cookie
    const deviceToken = req.cookies.pendingDevice;

    if (!deviceToken) {
        return res.status(401).json({
            success: false,
            message: "Verification session expired. Please log in again.",
        });
    }

    const deviceId = hashOtp(deviceToken);

    // 4. Find the existing unused login OTP
    const existingOtp = await prisma.loginOtp.findFirst({
        where: {
            userId: user.id,
            deviceId,
            consumedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!existingOtp) {
        return res.status(400).json({
            success: false,
            message: "No pending verification found. Please log in again.",
        });
    }

    // 5. Check 60-second cooldown
    const timeSinceLastOtp =
        Date.now() - existingOtp.createdAt.getTime();

    const cooldown = 60 * 1000;

    if (timeSinceLastOtp < cooldown) {
        const remainingSeconds = Math.ceil(
            (cooldown - timeSinceLastOtp) / 1000
        );

        return res.status(429).json({
            success: false,
            message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
        });
    }

    // 6. Generate a new OTP
    const otp = generateOtp();

    // 7. Replace the existing OTP
    await prisma.loginOtp.update({
        where: { id: existingOtp.id },
        data: {
            otpHash: hashOtp(otp),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            attempts: 0,
            createdAt: new Date(),
        },
    });

    // 8. Send OTP
    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
        success: true,
        message: "A new login verification code has been sent to your email.",
    });
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
    const { idToken, role } = req.body;

    if (!idToken) {
        return res.status(400).json({
            success: false,
            message: "Google ID token is required",
        });
    }

    let ticket;

    // Verify Google ID token
    try {
        ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
    } catch (error) {
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

    // Generate JWT and log the user in directly
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
};




const forgotPassword = async (req, res) => {
    const { email } = req.body;

    // 1. Validate email
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
        throw new Error("FRONTEND_URL is not configured");
    }

    // 2. Find the user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // 3. Return a generic response if user doesn't exist
    // Also skip accounts that are not verified or have no password
    if (!user || !user.isVerified || !user.password) {
        return res.status(200).json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent.",
        });
    }

    // 4. Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 5. Hash the token before saving it
    const tokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // 6. Set token expiration to 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 7. Save or replace the user's reset token
    await prisma.passwordResetToken.upsert({
        where: { userId: user.id },
        update: {
            tokenHash,
            expiresAt,
            usedAt: null,
            createdAt: new Date(),
        },
        create: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });

    const resetLink =
        `${frontendUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

    // 9. Send the reset link by email
    await sendPasswordResetEmail(user.email, resetLink);

    // 10. Return success
    return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
    });
};

const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // 1. Validate input
    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Reset token and new password are required",
        });
    }

    // 2. Validate password length
    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long",
        });
    }

    // 3. Hash the received token
    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // 4. Find the reset token
    const resetRecord = await prisma.passwordResetToken.findFirst({
        where: { tokenHash },
    });

    // 5. Check whether token exists or was already used
    if (!resetRecord || resetRecord.usedAt) {
        return res.status(400).json({
            success: false,
            message: "Invalid or already used reset link",
        });
    }

    // 6. Check token expiration
    if (resetRecord.expiresAt < new Date()) {
        return res.status(400).json({
            success: false,
            message: "Password reset link has expired. Please request a new one.",
        });
    }

    // 7. Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // 8. Update password and consume token atomically
    const result = await prisma.$transaction(async (tx) => {
        const consumedToken = await tx.passwordResetToken.updateMany({
            where: {
                id: resetRecord.id,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            data: {
                usedAt: new Date(),
            },
        });

        if (consumedToken.count === 0) {
            return false;
        }

        await tx.user.update({
            where: { id: resetRecord.userId },
            data: {
                password: hashedPassword,
                tokenVersion: { increment: 1 },
            },
        });

        return true;
    });

    if (!result) {
        return res.status(400).json({
            success: false,
            message: "Reset link is invalid, expired, or already used",
        });
    }

    // 9. Return success
    return res.status(200).json({
        success: true,
        message: "Password reset successfully. You can now log in.",
    });
};


const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // 1. Validate input
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Current password and new password are required",
        });
    }

    // 2. Validate new password
    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 8 characters long",
        });
    }

    // 3. Find the logged-in user
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.userId,
        },
    });

    if (!user || !user.password) {
        return res.status(404).json({
            success: false,
            message: "User not found or password is not set",
        });
    }

    // 4. Verify current password
    const isPasswordCorrect = await comparePassword(
        currentPassword,
        user.password
    );

    if (!isPasswordCorrect) {
        return res.status(400).json({
            success: false,
            message: "Current password is incorrect",
        });
    }

    // 5. Prevent using the same password
    const isSamePassword = await comparePassword(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        return res.status(400).json({
            success: false,
            message: "New password must be different from your current password",
        });
    }

    // 6. Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // 7. Update password and invalidate existing sessions
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            password: hashedPassword,
            tokenVersion: {
                increment: 1,
            },
        },
    });

    // 8. Return success
    return res.status(200).json({
        success: true,
        message: "Password changed successfully. Please log in again.",
    });
};

module.exports = {
    register, 
    verifyRegistrationOtp,
    resendRegistrationOtp,
    login,
    resendLoginOtp,
    verifyOtp,
    googleLogin,
    forgotPassword,
    resetPassword,
    changePassword,
};