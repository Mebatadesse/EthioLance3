const prisma = require("../config/prisma");

const getCertifications = async (userId) => {
    return await prisma.freelancerCertification.findMany({
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

const createCertification = async (userId, certificationData) => {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!freelancerProfile) {
        return null;
    }

    const {
        name,
        issuingOrganization,
        issueDate,
        expiryDate,
        credentialId,
        credentialUrl,
    } = certificationData;

    return await prisma.freelancerCertification.create({
        data: {
            freelancerProfileId: freelancerProfile.id,
            name,
            issuingOrganization,
            issueDate: issueDate ? new Date(issueDate) : null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            credentialId,
            credentialUrl,
        },
    });
};

const updateCertification = async (userId, certificationId, certificationData) => {
    const existingCertification = await prisma.freelancerCertification.findFirst({
        where: {
            id: certificationId,
            freelancerProfile: {
                userId,
            },
        },
    });

    if (!existingCertification) {
        return null;
    }

    const {
        name,
        issuingOrganization,
        issueDate,
        expiryDate,
        credentialId,
        credentialUrl,
    } = certificationData;

    const data = {};

    if (name !== undefined) data.name = name;
    if (issuingOrganization !== undefined) data.issuingOrganization = issuingOrganization;
    if (credentialId !== undefined) data.credentialId = credentialId;
    if (credentialUrl !== undefined) data.credentialUrl = credentialUrl;

    if (issueDate !== undefined) {
        data.issueDate = issueDate ? new Date(issueDate) : null;
    }

    if (expiryDate !== undefined) {
        data.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    return await prisma.freelancerCertification.update({
        where: {
            id: certificationId,
        },
        data,
    });
};

const deleteCertification = async (userId, certificationId) => {
    const existingCertification = await prisma.freelancerCertification.findFirst({
        where: {
            id: certificationId,
            freelancerProfile: {
                userId,
            },
        },
    });

    if (!existingCertification) {
        return null;
    }

    return await prisma.freelancerCertification.delete({
        where: {
            id: certificationId,
        },
    });
};

module.exports = {
    getCertifications,
    createCertification,
    updateCertification,
    deleteCertification,
};