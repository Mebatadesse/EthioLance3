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
    };

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

module.exports = {
    getMyProfile,
    updateProfile,
}