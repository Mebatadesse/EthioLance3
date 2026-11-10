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
        headline,  bio, location, hourlyRate, profileImageUrl, skills,  
    } = profileData;

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
};

const updateFreelancerProfile = async (userId, profileData) => {
    const { headline, bio, location, hourlyRate, skills, } = profileData;

    return await prisma.freelancerProfile.update({
        where: {
            userId,
        },
        data: {
            headline,
            bio,
            location,
            hourlyRate,
            skills,
        },
    });
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
};

const updateClientProfile = async (userId, profileData) => {
    const {
        companyName,
        location,
        website,
        bio,
        profileImageUrl,
    } = profileData;

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
};

module.exports = {
    getFreelancerProfile,
    createFreelancerProfile,
    updateFreelancerProfile,
    getClientProfile,
    createClientProfile,
    updateClientProfile,
};