const prisma = require("../../config/prisma");

const getMyProfile = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.userId,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isVerified: true,
            createdAt: true,
        },
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    return res.status(200).json({
        success: true, 
        user, 
    });
};

const updateProfile = async (req, res) => {
    const { firstName, lastName, phone } = req.body;

    const user = await prisma.user.update({
        where: {
            id: req.user.userId,
        },
        data: {
            firstName,
            lastName,
            phone,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
        },
    });

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
};

const getMyDevices = async (req, res) => {
    const devices = await prisma.trustedDevice.findMany({
        where: {
            userId: req.user.userId,
        },
        select: {
            id: true,
            deviceName: true,
            trustedAt: true,
            lastUsedAt: true,
        },
        orderBy: {
            lastUsedAt: "desc",
        },
    });

    return res.status(200).json({
        success: true,
        devices,
    });
};

const revokeDevice = async (req, res) => {
    const deviceId = Number(req.params.id);

    if(!Number.isInteger(deviceId) || deviceId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid device ID",
        });
    }

    const result = await prisma.trustedDevice.deleteMany({
        where: {
            id: deviceId,
            userId: req.user.userId,
        },
    });

    if (result.count === 0) {
        return res.status(404).json({
            success: false,
            message: "Trusted device not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Trusted device revoked successfully",
    });
};

const revokeAllDevices = async (req, res) => {
    const [result] = await prisma.$transaction([
        prisma.trustedDevice.deleteMany({
            where: {
                userId: req.user.userId,
            },
        }),

        prisma.user.update({
            where: {
                id: req.user.userId,
            },
            data: {
                tokenVersion: {
                    increment: 1,
                },
            },
        }),
    ]);

    return res.status(200).json({
        success: true,
        message: "All trusted devices revoked successfully. Please log in again.",
        revokedCount: result.count,
    });
};

module.exports = {
    getMyProfile,
    updateProfile,
    getMyDevices,
    revokeDevice,
    revokeAllDevices,
}