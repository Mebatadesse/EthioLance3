const prisma = require("../config/prisma");

const getExperiences = async (userId) => {
    return await prisma.freelancerExperience.findMany({
        where: {
            freelancerProfile: {
                userId,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const createExperience = async (userId, experienceData) => {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!freelancerProfile) {
        return null;
    }

    const { jobTitle, company, location, description, startDate, endDate, isCurrent} = experienceData;

    return await prisma.freelancerExperience.create({
        data: {
            freelancerProfileId: freelancerProfile.id,
            jobTitle,
            company,
            location,
            description,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            isCurrent,
        },
    });
};

const updateExperience = async (userId, experienceId, experienceData) => {
    const existingExperience = await prisma.freelancerExperience.findFirst({
        where: {
            id: experienceId,
            freelancerProfile: {
                userId,
            },
        },
    });

    if (!existingExperience) {
        return null;
    }

    const {
        jobTitle,
        company,
        location,
        description,
        startDate,
        endDate,
        isCurrent,
    } = experienceData;

    const data = {};

    if (jobTitle !== undefined) data.jobTitle = jobTitle;
    if (company !== undefined) data.company = company;
    if (location !== undefined) data.location = location;
    if (description !== undefined) data.description = description;

    if (startDate !== undefined) {
        data.startDate = startDate ? new Date(startDate) : null;
    }

    if (endDate !== undefined) {
        data.endDate = endDate ? new Date(endDate) : null;
    }

    if (isCurrent !== undefined) data.isCurrent = isCurrent;

    return await prisma.freelancerExperience.update({
        where: {
            id: experienceId,
        },
        data,
    });
}; 

const deleteExperience = async (userId, experienceId) => {
    const existingExperience = await prisma.freelancerExperience.findFirst({
        where: {
            id: experienceId,
            freelancerProfile: {
                userId,
            },
        },
    });

    if (!existingExperience) {
        return null;
    }

    return await prisma.freelancerExperience.delete({
        where: {
            id: experienceId,
        },
    });
};

module.exports = {
    getExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
};