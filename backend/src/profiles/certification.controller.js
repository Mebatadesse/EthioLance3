
const {
    getCertifications,
    createCertification,
    updateCertification,
    deleteCertification,
} = require("./certification.service");

const getMyCertifications = async (req, res) => {
    const certifications = await getCertifications(req.user.userId);

    return res.status(200).json({
        success: true,
        certifications,
    });
};

const createMyCertification = async (req, res) => {
    const certification = await createCertification(
        req.user.userId,
        req.body
    );

    if (!certification) {
        return res.status(404).json({
            success: false,
            message: "Freelancer profile not found",
        });
    }

    return res.status(201).json({
        success: true,
        message: "Certification added successfully",
        certification,
    });
};

const updateMyCertification = async (req, res) => {
    const certificationId = Number(req.params.id);

    if (!Number.isInteger(certificationId) || certificationId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid certification ID",
        });
    }

    const certification = await updateCertification(
        req.user.userId,
        certificationId,
        req.body
    );

    if (!certification) {
        return res.status(404).json({
            success: false,
            message: "Certification not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Certification updated successfully",
        certification,
    });
};

const deleteMyCertification = async (req, res) => {
    const certificationId = Number(req.params.id);

    if (!Number.isInteger(certificationId) || certificationId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid certification ID",
        });
    }

    const certification = await deleteCertification(
        req.user.userId,
        certificationId
    );

    if (!certification) {
        return res.status(404).json({
            success: false,
            message: "Certification not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Certification deleted successfully",
    });
};

module.exports = {
    getMyCertifications,
    createMyCertification,
    updateMyCertification,
    deleteMyCertification,
};
