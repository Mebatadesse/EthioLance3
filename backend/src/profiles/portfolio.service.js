const prisma = require("../config/prisma");

// GET all portfolio items
const getPortfolioItems = async (userId) => {
    return await prisma.portfolioItem.findMany({
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

// CREATE a portfolio item
const createPortfolioItem = async (userId, portfolioData) => {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
        where: {
            userId,
        },
    });

    if (!freelancerProfile) {
        return null;
    }

    const {
        title,
        description,
        projectUrl,
        imageUrl,
        technologies,
    } = portfolioData;

    return await prisma.portfolioItem.create({
        data: {
            freelancerProfileId: freelancerProfile.id,
            title,
            description,
            projectUrl,
            imageUrl,
            technologies,
        },
    });
};

// UPDATE a portfolio item
const updatePortfolioItem = async (userId, portfolioId, portfolioData) => {
    const existingPortfolio = await prisma.portfolioItem.findFirst({
        where: {
            id: portfolioId,
            freelancerProfile: {
                userId,
            },
        },
    });

    if (!existingPortfolio) {
        return null;
    }

    const {
        title,
        description,
        projectUrl,
        imageUrl,
        technologies,
    } = portfolioData;

    const data = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (projectUrl !== undefined) data.projectUrl = projectUrl;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (technologies !== undefined) data.technologies = technologies;

    return await prisma.portfolioItem.update({
        where: {
            id: portfolioId,
        },
        data,
    });
};

// DELETE a portfolio item
const deletePortfolioItem = async (userId, portfolioId) => {
    const existingPortfolio = await prisma.portfolioItem.findFirst({
        where: {
            id: portfolioId,
            freelancerProfile: {
                userId,
            },
        },
    });

    if (!existingPortfolio) {
        return null;
    }

    return await prisma.portfolioItem.delete({
        where: {
            id: portfolioId,
        },
    });
};

module.exports = {
    getPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
};