
const crypto = require("crypto");
const prisma = require("../config/prisma");
const {
    uploadFile,
    deleteFile,
    getSignedUrl,
} = require("../services/storage.service");

const CERTIFICATE_BUCKET = "certificates";

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

// Validate date range
const validateDateRange = (issueDate, expiryDate) => {
    if (issueDate && expiryDate && issueDate > expiryDate) {
        const error = new Error(
            "Expiration date cannot be earlier than issue date"
        );
        error.statusCode = 400;
        throw error;
    }
};

// Generate a unique path for each certificate
const generateCertificatePath = (userId) =>
    `${userId}/certifications/${crypto.randomUUID()}.pdf`;

// Get certifications with temporary signed URLs
const getCertifications = async (userId) => {
    const certifications = await prisma.freelancerCertification.findMany({
        where: {
            freelancerProfile: { userId },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return Promise.all(
        certifications.map(async (certification) => ({
            ...certification,
            certificateDownloadUrl: certification.certificateUrl
                ? await getSignedUrl(
                    CERTIFICATE_BUCKET,
                    certification.certificateUrl
                )
                : null,
        }))
    );
};

// Create certification
const createCertification = async (userId, certificationData, file) => {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: { userId },
    });

    console.log("Authenticated user ID:", userId);
console.log("Freelancer profile:", freelancerProfile);

    if (!freelancerProfile) return null;

    const {
        name,
        issuingOrganization,
        issueDate,
        expiryDate,
        description,
        credentialId,
        credentialUrl,
    } = certificationData;

    if (typeof name !== "string" || !name.trim()) {
        const error = new Error("Certification name is required");
        error.statusCode = 400;
        throw error;
    }

    if (
        typeof issuingOrganization !== "string" ||
        !issuingOrganization.trim()
    ) {
        const error = new Error("Issuing organization is required");
        error.statusCode = 400;
        throw error;
    }

    const parsedIssueDate = parseOptionalDate(issueDate, "Issue date");
    const parsedExpiryDate = parseOptionalDate(expiryDate, "Expiration date");

    validateDateRange(parsedIssueDate, parsedExpiryDate);

    let certificatePath = null;

    if (file) {
        certificatePath = generateCertificatePath(userId);
        await uploadFile(CERTIFICATE_BUCKET, certificatePath, file);
    }

    try {
        return await prisma.freelancerCertification.create({
            data: {
                freelancerProfileId: freelancerProfile.id,
                name: name.trim(),
                issuingOrganization: issuingOrganization.trim(),
                issueDate: parsedIssueDate,
                expiryDate: parsedExpiryDate,
                description,
                credentialId,
                credentialUrl,
                certificateUrl: certificatePath,
            },
        });
    } catch (error) {
        if (certificatePath) {
            await deleteFile(CERTIFICATE_BUCKET, certificatePath);
        }
        throw error;
    }
};

// Update certification
const updateCertification = async (
    userId,
    certificationId,
    certificationData,
    file
) => {
    const existingCertification =
        await prisma.freelancerCertification.findFirst({
            where: {
                id: certificationId,
                freelancerProfile: { userId },
            },
        });

    if (!existingCertification) return null;

    const {
        name,
        issuingOrganization,
        issueDate,
        expiryDate,
        description,
        credentialId,
        credentialUrl,
    } = certificationData;

    const data = {};

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            const error = new Error("Certification name cannot be empty");
            error.statusCode = 400;
            throw error;
        }
        data.name = name.trim();
    }

    if (issuingOrganization !== undefined) {
        if (
            typeof issuingOrganization !== "string" ||
            !issuingOrganization.trim()
        ) {
            const error = new Error("Issuing organization cannot be empty");
            error.statusCode = 400;
            throw error;
        }
        data.issuingOrganization = issuingOrganization.trim();
    }

    if (description !== undefined) data.description = description;
    if (credentialId !== undefined) data.credentialId = credentialId;
    if (credentialUrl !== undefined) data.credentialUrl = credentialUrl;

    const parsedIssueDate =
        issueDate !== undefined
            ? parseOptionalDate(issueDate, "Issue date")
            : existingCertification.issueDate;

    const parsedExpiryDate =
        expiryDate !== undefined
            ? parseOptionalDate(expiryDate, "Expiration date")
            : existingCertification.expiryDate;

    validateDateRange(parsedIssueDate, parsedExpiryDate);

    if (issueDate !== undefined) data.issueDate = parsedIssueDate;
    if (expiryDate !== undefined) data.expiryDate = parsedExpiryDate;

    if (Object.keys(data).length === 0 && !file) {
        const error = new Error("No certification information provided");
        error.statusCode = 400;
        throw error;
    }

    let newCertificatePath = null;

    if (file) {
        newCertificatePath = generateCertificatePath(userId);
        await uploadFile(CERTIFICATE_BUCKET, newCertificatePath, file);
        data.certificateUrl = newCertificatePath;
    }

    let updatedCertification;

    try {
        updatedCertification = await prisma.freelancerCertification.update({
            where: { id: certificationId },
            data,
        });
    } catch (error) {
        if (newCertificatePath) {
            await deleteFile(CERTIFICATE_BUCKET, newCertificatePath);
        }
        throw error;
    }

    // Delete the previous PDF only after the database update succeeds
    if (newCertificatePath && existingCertification.certificateUrl) {
        await deleteFile(
            CERTIFICATE_BUCKET,
            existingCertification.certificateUrl
        );
    }

    return updatedCertification;
};

// Delete certification
const deleteCertification = async (userId, certificationId) => {
    const existingCertification =
        await prisma.freelancerCertification.findFirst({
            where: {
                id: certificationId,
                freelancerProfile: { userId },
            },
        });

    if (!existingCertification) return null;

    const deletedCertification =
        await prisma.freelancerCertification.delete({
            where: { id: certificationId },
        });

    if (existingCertification.certificateUrl) {
        await deleteFile(
            CERTIFICATE_BUCKET,
            existingCertification.certificateUrl
        );
    }

    return deletedCertification;
};

module.exports = {
    getCertifications,
    createCertification,
    updateCertification,
    deleteCertification,
};
