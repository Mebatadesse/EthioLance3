const { getEducations, createEducation, updateEducation, deleteEducation } = require("./education.service");

const getMyEducations = async (req, res) => {
    try {
        const educations = await getEducations(req.user.userId);

        return res.status(200).json({
            success: true,
            educations,
        });

    } catch (error) {
        console.error("GET EDUCATIONS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve education records",
        });
    }
};

const createMyEducation = async (req, res) => {
    try {
        const education = await createEducation(
            req.user.userId,
            req.body
        );

        if (!education) {
            return res.status(404).json({
                success: false,
                message: "Freelancer profile not found",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Education added successfully",
            education,
        });

    } catch (error) {
        console.error("CREATE EDUCATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add education",
        });
    }
};

const updateMyEducation = async (req, res) => {
    try {
        const educationId = Number(req.params.id);

        if (!Number.isInteger(educationId) || educationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid education ID",
            });
        }

        const education = await updateEducation(
            req.user.userId,
            educationId,
            req.body
        );

        if (!education) {
            return res.status(404).json({
                success: false,
                message: "Education record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Education updated successfully",
            education,
        });

    } catch (error) {
        console.error("UPDATE EDUCATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update education",
        });
    }
};

const deleteMyEducation = async (req, res) => {
    try {
        const educationId = Number(req.params.id);

        if (!Number.isInteger(educationId) || educationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid education ID",
            });
        }

        const education = await deleteEducation(
            req.user.userId,
            educationId
        );

        if (!education) {
            return res.status(404).json({
                success: false,
                message: "Education record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Education deleted successfully",
        });

    } catch (error) {
        console.error("DELETE EDUCATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete education",
        });
    }
};

module.exports = {
    getMyEducations,
    createMyEducation,
    updateMyEducation,
    deleteMyEducation,
};