
const {
    getEducations,
    createEducation,
    updateEducation,
    deleteEducation,
} = require("./education.service");

const getMyEducations = async (req, res) => {
    const educations = await getEducations(req.user.userId);

    return res.status(200).json({
        success: true,
        educations,
    });
};

const createMyEducation = async (req, res) => {
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
};

const updateMyEducation = async (req, res) => {
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
};

const deleteMyEducation = async (req, res) => {
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
};

module.exports = {
    getMyEducations,
    createMyEducation,
    updateMyEducation,
    deleteMyEducation,
};
