
const prisma = require("../config/prisma");

// Validate optional dates
const parseOptionalDate = (value, fieldName) => {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        const error = new Error(`${fieldName} must be a valid date`);
        error.statusCode = 400;
        throw error;
    }

    return date;
};

const validateDateRange = (startDate, endDate) => {
    if (startDate && endDate && startDate > endDate) {
        const error = new Error(
            "Start date cannot be later than end date"
        );
        error.statusCode = 400;
        throw error;
    }
};

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

    // Institution is required
    if (typeof institution !== "string" || !institution.trim()) {
        const error = new Error("Institution is required");
        error.statusCode = 400;
        throw error;
    }

    const parsedStartDate = parseOptionalDate(startDate, "Start date");
    const parsedEndDate = parseOptionalDate(endDate, "End date");

    validateDateRange(parsedStartDate, parsedEndDate);

    return await prisma.freelancerEducation.create({
        data: {
            freelancerProfileId: freelancerProfile.id,
            institution: institution.trim(),
            degree,
            fieldOfStudy,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
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

    if (institution !== undefined) {
        if (typeof institution !== "string" || !institution.trim()) {
            const error = new Error("Institution cannot be empty");
            error.statusCode = 400;
            throw error;
        }

        data.institution = institution.trim();
    }

    if (degree !== undefined) data.degree = degree;
    if (fieldOfStudy !== undefined) data.fieldOfStudy = fieldOfStudy;
    if (description !== undefined) data.description = description;

    // Preserve existing dates when they are not included in the update
    const parsedStartDate =
        startDate !== undefined
            ? parseOptionalDate(startDate, "Start date")
            : existingEducation.startDate;

    const parsedEndDate =
        endDate !== undefined
            ? parseOptionalDate(endDate, "End date")
            : existingEducation.endDate;

    validateDateRange(parsedStartDate, parsedEndDate);

    if (startDate !== undefined) {
        data.startDate = parsedStartDate;
    }

    if (endDate !== undefined) {
        data.endDate = parsedEndDate;
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
};
