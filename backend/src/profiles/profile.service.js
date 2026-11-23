const prisma = require("../config/prisma");

const getFreelancerProfile = async (userId) => {
    return await prisma.freelancerProfile.findUnique({
        where: {
            userId,
        },
        include: {
            experiences: true,
            educations: true,
            certifications: true,
            portfolioItems: true,
        },
    });
};

const createFreelancerProfile = async (userId, profileData) => {
    const {
        headline,
        bio,
        location,
        hourlyRate,
        profileImageUrl,
        skills,
    } = profileData;

    try {
        return await prisma.freelancerProfile.create({
            data: {
                userId,
                headline,
                bio,
                location,
                hourlyRate,
                profileImageUrl,
                skills,
            },
        });
    } catch (error) {
        if (error.code === "P2002") {
            const conflictError = new Error("Freelancer profile already exists");
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error;
    }
};

const updateFreelancerProfile = async (userId, profileData) => {
    const { headline, bio, location, hourlyRate, profileImageUrl, skills } = profileData;

    try {
        return await prisma.freelancerProfile.update({
            where: {
                userId,
            },
            data: {
                headline,
                bio,
                location,
                hourlyRate,
                profileImageUrl,
                skills,
            },
        });
    } catch (error) {
        if (error.code === "P2025") {
            const notFoundError = new Error("Freelancer profile not found");
            notFoundError.statusCode = 404;
            throw notFoundError;
        }

        throw error;
    }
};

const getClientProfile = async (userId) => {
    return await prisma.clientProfile.findUnique({
        where: {
            userId,
        },
    });
};

const createClientProfile = async (userId, profileData) => {
    const {
        companyName,
        location,
        website,
        bio,
        profileImageUrl,
    } = profileData;

    try {
        return await prisma.clientProfile.create({
            data: {
                userId,
                companyName,
                location,
                website,
                bio,
                profileImageUrl,
            },
        });
    } catch (error) {
        if (error.code === "P2002") {
            const conflictError = new Error("Client profile already exists");
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error;
    }
};

const updateClientProfile = async (userId, profileData) => {
    const {
        companyName,
        location,
        website,
        bio,
        profileImageUrl,
    } = profileData;

    try {
        return await prisma.clientProfile.update({
            where: {
                userId,
            },
            data: {
                companyName,
                location,
                website,
                bio,
                profileImageUrl,
            },
        });
    } catch (error) {
        if (error.code === "P2025") {
            const notFoundError = new Error("Client profile not found");
            notFoundError.statusCode = 404;
            throw notFoundError;
        }

        throw error;
    }
};

module.exports = {
    getFreelancerProfile,
    createFreelancerProfile,
    updateFreelancerProfile,
    getClientProfile,
    createClientProfile,
    updateClientProfile,
};