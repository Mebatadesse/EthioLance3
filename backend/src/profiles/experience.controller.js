
const {
    getExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
} = require("./experience.service");

const getMyExperiences = async (req, res) => {
    const experiences = await getExperiences(req.user.userId);

    return res.status(200).json({
        success: true,
        experiences,
    });
};

const createMyExperience = async (req, res) => {
    const experience = await createExperience(
        req.user.userId,
        req.body
    );

    if (!experience) {
        return res.status(404).json({
            success: false,
            message: "Freelancer profile not found",
        });
    }

    return res.status(201).json({
        success: true,
        message: "Experience added successfully",
        experience,
    });
};

const updateMyExperience = async (req, res) => {
    const experienceId = Number(req.params.id);

    if (!Number.isInteger(experienceId) || experienceId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid experience ID",
        });
    }

    const experience = await updateExperience(
        req.user.userId,
        experienceId,
        req.body
    );

    if (!experience) {
        return res.status(404).json({
            success: false,
            message: "Experience not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Experience updated successfully",
        experience,
    });
};

const deleteMyExperience = async (req, res) => {
    const experienceId = Number(req.params.id);

    if (!Number.isInteger(experienceId) || experienceId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid experience ID",
        });
    }

    const experience = await deleteExperience(
        req.user.userId,
        experienceId
    );

    if (!experience) {
        return res.status(404).json({
            success: false,
            message: "Experience not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Experience deleted successfully",
    });
};

module.exports = {
    getMyExperiences,
    createMyExperience,
    updateMyExperience,
    deleteMyExperience,
};
