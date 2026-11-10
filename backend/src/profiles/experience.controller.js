const { getExperiences, createExperience, updateExperience, deleteExperience } = require("./experience.service");

const getMyExperiences = async (req, res) => {
    try {
        const experiences = await getExperiences(req.user.userId);

        return res.status(200).json({
            success: true,
            experiences,
        });

    } catch (error) {
        console.error("GET EXPERIENCES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve experiences",
        });
    }
};

const createMyExperience = async (req, res) => {
    try {
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

    } catch (error) {
        console.error("CREATE EXPERIENCE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add experience",
        });
    }
};

const updateMyExperience = async (req, res) => {
    try {
        const experienceId = Number(req.params.id);

        if(!Number.isInteger(experienceId) || experienceId <= 0) {
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
            experience
        });

    } catch (error) {
        console.error("UPDATE EXPERIENCE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update experience",
        });
    }
};

const deleteMyExperience = async (req, res) => {
    try {
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

    } catch (error) {
        console.error("DELETE EXPERIENCE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete experience",
        });
    }
};

module.exports = {
    getMyExperiences,
    createMyExperience,
    updateMyExperience,
    deleteMyExperience,
};