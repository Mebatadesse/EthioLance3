const prisma = require("../config/prisma");

const getEducations = async (userId) => {
    return await prisma.freelancerEducation.findMany({
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

const createEducation = async (userId, educationData) => {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!freelancerProfile) {
        return null;
    }

    const {
        institution,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        description,
    } = educationData;

    return await prisma.freelancerEducation.create({
        data: {
            freelancerProfileId: freelancerProfile.id,
            institution,
            degree,
            fieldOfStudy,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            description,
        },
    });
}; 

const updateEducation = async (userId, educationId, educationData) => {
    const existingEducation = await prisma.freelancerEducation.findFirst({
        where: {
            id: educationId,
            freelancerProfile: {
                userId,
            },
        },
    });

    if (!existingEducation) {
        return null;
    }

    const {
        institution,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        description,
    } = educationData;

    const data = {};

    if (institution !== undefined) data.institution = institution;
    if (degree !== undefined) data.degree = degree;
    if (fieldOfStudy !== undefined) data.fieldOfStudy = fieldOfStudy;
    if (description !== undefined) data.description = description;

    if (startDate !== undefined) {
        data.startDate = startDate ? new Date(startDate) : null;
    }

    if (endDate !== undefined) {
        data.endDate = endDate ? new Date(endDate) : null;
    }

    return await prisma.freelancerEducation.update({
        where: {
            id: educationId,
        },
        data,
    });
};

const deleteEducation = async (userId, educationId) => {
    const existingEducation = await prisma.freelancerEducation.findFirst({
        where: {
            id: educationId,
            freelancerProfile: {
                userId,
            },
        },
    });

    if (!existingEducation) {
        return null;
    }

    return await prisma.freelancerEducation.delete({
        where: {
            id: educationId,
        },
    });
};

module.exports = {
    getEducations,
    createEducation,
    updateEducation,
    deleteEducation,
}