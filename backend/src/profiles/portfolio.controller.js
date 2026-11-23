
const {
    getPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
} = require("./portfolio.service");

const getMyPortfolio = async (req, res) => {
    const portfolioItems = await getPortfolioItems(req.user.userId);

    return res.status(200).json({
        success: true,
        portfolioItems,
    });
};

const createMyPortfolioItem = async (req, res) => {
    const portfolioItem = await createPortfolioItem(
        req.user.userId,
        req.body
    );

    if (!portfolioItem) {
        return res.status(404).json({
            success: false,
            message: "Freelancer profile not found",
        });
    }

    return res.status(201).json({
        success: true,
        message: "Portfolio item added successfully",
        portfolioItem,
    });
};

const updateMyPortfolioItem = async (req, res) => {
    const portfolioId = Number(req.params.id);

    if (!Number.isInteger(portfolioId) || portfolioId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid portfolio ID",
        });
    }

    const portfolioItem = await updatePortfolioItem(
        req.user.userId,
        portfolioId,
        req.body
    );

    if (!portfolioItem) {
        return res.status(404).json({
            success: false,
            message: "Portfolio item not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Portfolio item updated successfully",
        portfolioItem,
    });
};

const deleteMyPortfolioItem = async (req, res) => {
    const portfolioId = Number(req.params.id);

    if (!Number.isInteger(portfolioId) || portfolioId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid portfolio ID",
        });
    }

    const portfolioItem = await deletePortfolioItem(
        req.user.userId,
        portfolioId
    );

    if (!portfolioItem) {
        return res.status(404).json({
            success: false,
            message: "Portfolio item not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Portfolio item deleted successfully",
    });
};

module.exports = {
    getMyPortfolio,
    createMyPortfolioItem,
    updateMyPortfolioItem,
    deleteMyPortfolioItem,
};
