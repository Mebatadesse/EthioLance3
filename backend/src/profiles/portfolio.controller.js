
const {
    getPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
} = require("./portfolio.service");

// GET my portfolio
const getMyPortfolio = async (req, res) => {
    const portfolioItems = await getPortfolioItems(req.user.userId);

    return res.status(200).json({
        success: true,
        portfolioItems,
    });
};

// Convert technologies from form-data string to array
const parseTechnologies = (technologies) => {
    if (technologies === undefined) return undefined;

    if (Array.isArray(technologies)) return technologies;

    try {
        const parsed = JSON.parse(technologies);

        if (!Array.isArray(parsed)) {
            throw new Error("Technologies must be an array");
        }

        return parsed;
    } catch {
        const error = new Error(
            "Technologies must be a valid JSON array"
        );
        error.statusCode = 400;
        throw error;
    }
};

// CREATE portfolio item
const createMyPortfolioItem = async (req, res) => {
    const portfolioData = {
        ...req.body,
        technologies: parseTechnologies(req.body.technologies),
    };

    const portfolioItem = await createPortfolioItem(
        req.user.userId,
        portfolioData,
        req.file
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

// UPDATE portfolio item
const updateMyPortfolioItem = async (req, res) => {
    const portfolioId = Number(req.params.id);

    if (!Number.isInteger(portfolioId) || portfolioId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid portfolio ID",
        });
    }

    const portfolioData = {
        ...req.body,
        technologies: parseTechnologies(req.body.technologies),
    };

    const portfolioItem = await updatePortfolioItem(
        req.user.userId,
        portfolioId,
        portfolioData,
        req.file
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

// DELETE portfolio item
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
