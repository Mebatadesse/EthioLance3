
const prisma = require("../config/prisma");
const crypto = require("crypto");
const {
    uploadFile,
    deleteFile,
    getSignedUrl,
} = require("../services/storage.service");

const BUCKET = "portfolio-files";

const getFileExtension = (mimetype) => {
    const extensions = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/pdf": "pdf",
        "audio/mpeg": "mp3",
        "video/mp4": "mp4",
    };

    return extensions[mimetype];
};

// GET all portfolio items
const getPortfolioItems = async (userId) => {
    const items = await prisma.portfolioItem.findMany({
        where: {
            freelancerProfile: { userId },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return Promise.all(
        items.map(async (item) => {
            const { fileUrl, ...portfolioItem } = item;

            return {
                ...portfolioItem,
                fileDownloadUrl: fileUrl
                    ? await getSignedUrl(BUCKET, fileUrl)
                    : null,
            };
        })
    );
};

// CREATE a portfolio item
const createPortfolioItem = async (userId, portfolioData, file) => {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: { userId },
    });

    if (!freelancerProfile) return null;

    const {
        title,
        description,
        projectUrl,
        technologies,
    } = portfolioData;

    if (typeof title !== "string" || !title.trim()) {
        const error = new Error("Portfolio title is required");
        error.statusCode = 400;
        throw error;
    }

    if (technologies !== undefined && !Array.isArray(technologies)) {
        const error = new Error("Technologies must be an array");
        error.statusCode = 400;
        throw error;
    }

    let uploadedFilePath = null;

    if (file) {
        const extension = getFileExtension(file.mimetype);

        if (!extension) {
            const error = new Error("Unsupported portfolio file type");
            error.statusCode = 400;
            throw error;
        }

        uploadedFilePath = await uploadFile(
            BUCKET,
            `${userId}/portfolio/${crypto.randomUUID()}.${extension}`,
            file
        );
    }

    try {
        return await prisma.portfolioItem.create({
            data: {
                freelancerProfileId: freelancerProfile.id,
                title: title.trim(),
                description,
                projectUrl,
                fileUrl: uploadedFilePath,
                technologies: technologies || [],
            },
        });
    } catch (error) {
        if (uploadedFilePath) {
            await deleteFile(BUCKET, uploadedFilePath);
        }
        throw error;
    }
};

// UPDATE a portfolio item
const updatePortfolioItem = async (
    userId,
    portfolioId,
    portfolioData,
    file
) => {
    const existingPortfolio = await prisma.portfolioItem.findFirst({
        where: {
            id: portfolioId,
            freelancerProfile: { userId },
        },
    });

    if (!existingPortfolio) return null;

    const {
        title,
        description,
        projectUrl,
        technologies,
    } = portfolioData;

    const data = {};

    if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
            const error = new Error("Portfolio title is required");
            error.statusCode = 400;
            throw error;
        }
        data.title = title.trim();
    }

    if (description !== undefined) data.description = description;
    if (projectUrl !== undefined) data.projectUrl = projectUrl;

    if (technologies !== undefined) {
        if (!Array.isArray(technologies)) {
            const error = new Error("Technologies must be an array");
            error.statusCode = 400;
            throw error;
        }
        data.technologies = technologies;
    }

    if (Object.keys(data).length === 0 && !file) {
        const error = new Error("No portfolio information provided");
        error.statusCode = 400;
        throw error;
    }

    let uploadedFilePath = null;

    if (file) {
        const extension = getFileExtension(file.mimetype);

        if (!extension) {
            const error = new Error("Unsupported portfolio file type");
            error.statusCode = 400;
            throw error;
        }

        uploadedFilePath = await uploadFile(
            BUCKET,
            `${userId}/portfolio/${crypto.randomUUID()}.${extension}`,
            file
        );

        data.fileUrl = uploadedFilePath;
    }

    let updatedPortfolio;

    try {
        updatedPortfolio = await prisma.portfolioItem.update({
            where: { id: portfolioId },
            data,
        });
    } catch (error) {
        if (uploadedFilePath) {
            await deleteFile(BUCKET, uploadedFilePath);
        }
        throw error;
    }

    if (uploadedFilePath && existingPortfolio.fileUrl) {
        await deleteFile(BUCKET, existingPortfolio.fileUrl);
    }

    return updatedPortfolio;
};

// DELETE a portfolio item
const deletePortfolioItem = async (userId, portfolioId) => {
    const existingPortfolio = await prisma.portfolioItem.findFirst({
        where: {
            id: portfolioId,
            freelancerProfile: { userId },
        },
    });

    if (!existingPortfolio) return null;

    await prisma.portfolioItem.delete({
        where: { id: portfolioId },
    });

    if (existingPortfolio.fileUrl) {
        await deleteFile(BUCKET, existingPortfolio.fileUrl);
    }

    return existingPortfolio;
};

module.exports = {
    getPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
};
