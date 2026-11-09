const {
    getPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
} = require("./portfolio.service");

const getMyPortfolio = async (req, res) => {
    try {
        const portfolioItems = await getPortfolioItems(req.user.userId);

        return res.status(200).json({
            success: true,
            portfolioItems,
        });
    } catch (error) {
        console.error("GET PORTFOLIO ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve portfolio items",
        });
    }
};

const createMyPortfolioItem = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("CREATE PORTFOLIO ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add portfolio item",
        });
    }
};

const updateMyPortfolioItem = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("UPDATE PORTFOLIO ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update portfolio item",
        });
    }
};

const deleteMyPortfolioItem = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("DELETE PORTFOLIO ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete portfolio item",
        });
    }
};

module.exports = {
    getMyPortfolio,
    createMyPortfolioItem,
    updateMyPortfolioItem,
    deleteMyPortfolioItem,
};