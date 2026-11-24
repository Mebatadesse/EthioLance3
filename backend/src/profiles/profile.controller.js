const { getFreelancerProfile, createFreelancerProfile, updateFreelancerProfile, 
        getClientProfile, createClientProfile, updateClientProfile} = require("./profile.service");

const getMyFreelancerProfile = async (req, res) => {
    const profile = await getFreelancerProfile(req.user.userId);

    if (!profile) {
        return res.status(404).json({
            success: false,
            message: "Freelancer profile not found",
        });
    }

    return res.status(200).json({
        success: true,
        profile,
    });
};

const createMyFreelancerProfile = async (req, res) => {
    const existingProfile = await getFreelancerProfile(req.user.userId);

    if (existingProfile) {
        return res.status(409).json({
            success: false,
            message: "Freelancer profile already exists",
        });
    }

    const profile = await createFreelancerProfile(
        req.user.userId,
        req.body,
        req.file
    );

    return res.status(201).json({
        success: true,
        message: "Freelancer profile created successfully",
        profile,
    });
};

const updateMyFreelancerProfile = async (req, res) => {
    const profile = await updateFreelancerProfile(
        req.user.userId,
        req.body,
        req.file
    );

    return res.status(200).json({
        success: true,
        message: "Freelancer profile updated successfully",
        profile,
    });
};

const getMyClientProfile = async (req, res) => {
    const profile = await getClientProfile(req.user.userId);

    if (!profile) {
        return res.status(404).json({
            success: false,
            message: "Client profile not found",
        });
    }

    return res.status(200).json({
        success: true,
        profile,
    });
};

const createMyClientProfile = async (req, res) => {
    const existingProfile = await getClientProfile(req.user.userId);

    if (existingProfile) {
        return res.status(409).json({
            success: false,
            message: "Client profile already exists",
        });
    }

    const profile = await createClientProfile(
        req.user.userId,
        req.body,
        req.file
    );

    return res.status(201).json({
        success: true,
        message: "Client profile created successfully",
        profile,
    });
};

const updateMyClientProfile = async (req, res) => {
    const profile = await updateClientProfile(
        req.user.userId,
        req.body,
        req.file
    );

    return res.status(200).json({
        success: true,
        message: "Client profile updated successfully",
        profile,
    });
};

module.exports = {
    getMyFreelancerProfile,
    createMyFreelancerProfile,
    updateMyFreelancerProfile,
    getMyClientProfile,
    createMyClientProfile,
    updateMyClientProfile,
};