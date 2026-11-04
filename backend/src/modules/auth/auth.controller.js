const prisma = require("../../config/prisma");
const { hashPassword, comparePassword } = require("./auth.service");
const { generateToken } = require("./jwt.service");

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
        where: {
            email,
        },
    });

    if (!user) {
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
};

module.exports = {
    register, 
    login,
};