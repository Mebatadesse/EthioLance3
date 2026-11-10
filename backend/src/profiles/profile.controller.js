const { getFreelancerProfile, createFreelancerProfile, updateFreelancerProfile, 
        getClientProfile, createClientProfile, updateClientProfile} = require("./profile.service");

const getMyFreelancerProfile = async (req, res) => {
    try {
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
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve freelancer profile",
        });
    }
};

const createMyFreelancerProfile = async (req, res) => {
    try {
        const existingProfile = await getFreelancerProfile(req.user.userId);

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Freelancer profile already exists",
            });
        }

        const profile = await createFreelancerProfile(
            req.user.userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Freelancer profile created successfully",
            profile,
        });

    } catch (error) {
        console.error("CREATE FREELANCER PROFILE ERROR:", error);
    
        return res.status(500).json({
            success: false,
            message: "Failed to create freelancer profile",
        });
    }
};

const updateMyFreelancerProfile = async (req, res) => {
    try{
        const profile = await updateFreelancerProfile(
            req.user.userId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Freelancer profile updated successfully",
            profile,
        });
    } catch (error) {
        console.error("UPDATE FREELANCER PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update freelancer profile",
        });
    }
};

const getMyClientProfile = async (req, res) => {
    try {
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
    } catch (error) {
        console.error("GET CLIENT PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve client profile",
        });
    }
};

const createMyClientProfile = async (req, res) => {
    try {
        const existingProfile = await getClientProfile(req.user.userId);

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Client profile already exists",
            });
        }

        const profile = await createClientProfile(
            req.user.userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Client profile created successfully",
            profile,
        });
    } catch (error) {
        console.error("CREATE CLIENT PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create client profile",
        });
    }
};

const updateMyClientProfile = async (req, res) => {
    try {
        const profile = await updateClientProfile(
            req.user.userId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Client profile updated successfully",
            profile,
        });
    } catch (error) {
        console.error("UPDATE CLIENT PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update client profile",
        });
    }
};

module.exports = {
    getMyFreelancerProfile,
    createMyFreelancerProfile,
    updateMyFreelancerProfile,
    getMyClientProfile,
    createMyClientProfile,
    updateMyClientProfile,
};