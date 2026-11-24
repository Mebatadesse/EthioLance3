const prisma = require("../config/prisma");

const {
    uploadFile,
    deleteFile,
    getPublicUrl,
} = require("../services/storage.service");

const PROFILE_IMAGE_BUCKET = "profile-images";


const getFreelancerProfile = async (userId) => {
    const profile = await prisma.freelancerProfile.findUnique({
        where: {
            userId,
        },
        include: {
            experiences: true,
            educations: true,
            certifications: true,
            portfolioItems: true,
        },
    });

    if (!profile) {
        return null;
    }

    return {
        ...profile,
        profileImageUrl: profile.profileImageUrl
            ? getPublicUrl(PROFILE_IMAGE_BUCKET, profile.profileImageUrl)
            : null,
    };
};

const createFreelancerProfile = async (userId, profileData, file) => {
    const {
        headline,
        bio,
        location,
        hourlyRate,
        skills,
    } = profileData;

    const parsedSkills = Array.isArray(skills)
        ? skills
        : typeof skills === "string"
            ? skills.split(",").map(skill => skill.trim()).filter(Boolean)
            : [];

    const parsedHourlyRate = hourlyRate === undefined || hourlyRate === ""
        ? null
        : Number(hourlyRate);

    let imagePath = null;

    try {
        // Upload profile image if provided
        if (file) {
            const safeFileName = file.originalname.replace(
                /[^a-zA-Z0-9.-]/g,
                "_"
            );

            const filePath = `freelancers/${userId}/${Date.now()}-${safeFileName}`;

            imagePath = await uploadFile(
                PROFILE_IMAGE_BUCKET,
                filePath,
                file
            );
        }

        const profile = await prisma.freelancerProfile.create({
            data: {
                userId,
                headline,
                bio,
                location,
                hourlyRate: parsedHourlyRate,
                skills: parsedSkills,
                profileImageUrl: imagePath,
            },
        });

        return {
            ...profile,
            profileImageUrl: imagePath
                ? getPublicUrl(PROFILE_IMAGE_BUCKET, imagePath)
                : null,
        };

    } catch (error) {

        // Clean up uploaded image if profile creation fails
        if (imagePath) {
            try {
                await deleteFile(PROFILE_IMAGE_BUCKET, imagePath);
            } catch (cleanupError) {
                console.error(
                    "Failed to delete uploaded profile image:",
                    cleanupError
                );
            }
        }

        if (error.code === "P2002") {
            const conflictError = new Error(
                "Freelancer profile already exists"
            );
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error;
    }
};


const updateFreelancerProfile = async (userId, profileData, file) => {
    const {
        headline,
        bio,
        location,
        hourlyRate,
        skills,
    } = profileData;

    const parsedSkills = skills === undefined
        ? undefined
        : Array.isArray(skills)
            ? skills
            : typeof skills === "string"
                ? skills.split(",").map(skill => skill.trim()).filter(Boolean)
                : [];

    const parsedHourlyRate = hourlyRate === undefined
        ? undefined
        : hourlyRate === ""
            ? null
            : Number(hourlyRate);

    let newImagePath = null;

    try {
        const existingProfile = await prisma.freelancerProfile.findUnique({
            where: { userId },
        });

        if (!existingProfile) {
            const notFoundError = new Error("Freelancer profile not found");
            notFoundError.statusCode = 404;
            throw notFoundError;
        }

        // Upload new image if provided
        if (file) {
            const safeFileName = file.originalname.replace(
                /[^a-zA-Z0-9.-]/g,
                "_"
            );

            const filePath = `freelancers/${userId}/${Date.now()}-${safeFileName}`;

            newImagePath = await uploadFile(
                PROFILE_IMAGE_BUCKET,
                filePath,
                file
            );
        }

        const profile = await prisma.freelancerProfile.update({
            where: { userId },
            data: {
                headline,
                bio,
                location,
                ...(parsedHourlyRate !== undefined && {
                    hourlyRate: parsedHourlyRate,
                }),
                ...(parsedSkills !== undefined && {
                    skills: parsedSkills,
                }),
                ...(newImagePath && {
                    profileImageUrl: newImagePath,
                }),
            },
        });

        // Delete old image only after database update succeeds
        if (newImagePath && existingProfile.profileImageUrl) {
            try {
                await deleteFile(
                    PROFILE_IMAGE_BUCKET,
                    existingProfile.profileImageUrl
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to delete old profile image:",
                    cleanupError
                );
            }
        }

        return {
            ...profile,
            profileImageUrl: profile.profileImageUrl
                ? getPublicUrl(
                    PROFILE_IMAGE_BUCKET,
                    profile.profileImageUrl
                )
                : null,
        };

    } catch (error) {

        // Clean up new image if the update fails
        if (newImagePath) {
            try {
                await deleteFile(PROFILE_IMAGE_BUCKET, newImagePath);
            } catch (cleanupError) {
                console.error(
                    "Failed to delete new profile image:",
                    cleanupError
                );
            }
        }

        if (error.code === "P2025") {
            const notFoundError = new Error("Freelancer profile not found");
            notFoundError.statusCode = 404;
            throw notFoundError;
        }

        throw error;
    }
};

const getClientProfile = async (userId) => {
    const profile = await prisma.clientProfile.findUnique({
        where: {
            userId,
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                },
            },
        },
    });

    if (!profile) {
        return null;
    }

    return {
        ...profile,
        profileImageUrl: profile.profileImageUrl
            ? getPublicUrl(PROFILE_IMAGE_BUCKET, profile.profileImageUrl)
            : null,
    };
};


const createClientProfile = async (userId, profileData, file) => {
    const {
        companyName,
        location,
        website,
        bio,
        phone,
    } = profileData;

        // Validate website URL if provided
    if (website !== undefined && website.trim() !== "") {
        try {
            const url = new URL(website);

            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error();
            }
        } catch {
            const validationError = new Error(
                "Please provide a valid website URL"
            );
            validationError.statusCode = 400;
            throw validationError;
        }
    }

    let imagePath = null;

    try {
        // Upload profile image if provided
        if (file) {
            const safeFileName = file.originalname.replace(
                /[^a-zA-Z0-9.-]/g,
                "_"
            );

            const filePath = `clients/${userId}/${Date.now()}-${safeFileName}`;

            imagePath = await uploadFile(
                PROFILE_IMAGE_BUCKET,
                filePath,
                file
            );
        }

        const profile = await prisma.$transaction(async (tx) => {

            // Update user's phone number if provided
            if (phone !== undefined) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        phone: phone.trim() || null,
                    },
                });
            }

            // Create client profile
            return await tx.clientProfile.create({
                data: {
                    userId,
                    companyName,
                    location,
                    website,
                    bio,
                    profileImageUrl: imagePath,
                },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            });
        });

        return {
            ...profile,
            profileImageUrl: imagePath
                ? getPublicUrl(PROFILE_IMAGE_BUCKET, imagePath)
                : null,
        };

    } catch (error) {

        // Clean up uploaded image if profile creation fails
        if (imagePath) {
            try {
                await deleteFile(PROFILE_IMAGE_BUCKET, imagePath);
            } catch (cleanupError) {
                console.error(
                    "Failed to delete uploaded profile image:",
                    cleanupError
                );
            }
        }

        if (error.code === "P2002") {
            const target = String(error.meta?.target || "").toLowerCase();

            const conflictError = new Error(
                target.includes("phone")
                    ? "Phone number is already in use"
                    : "Client profile already exists"
            );

            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error;
    }
};

const updateClientProfile = async (userId, profileData, file) => {
    const {
        companyName,
        location,
        website,
        bio,
        phone,
    } = profileData;

      // Validate website URL if provided
    if (website !== undefined && website.trim() !== "") {
        try {
            const url = new URL(website);
   
            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error();
            }
        } catch {
            const validationError = new Error(
                "Please provide a valid website URL"
            );
            validationError.statusCode = 400;
            throw validationError;
        }
    }

    let newImagePath = null;

    try {
        const existingProfile = await prisma.clientProfile.findUnique({
            where: { userId },
        });

        if (!existingProfile) {
            const notFoundError = new Error("Client profile not found");
            notFoundError.statusCode = 404;
            throw notFoundError;
        }

        // Upload new image if provided
        if (file) {
            const safeFileName = file.originalname.replace(
                /[^a-zA-Z0-9.-]/g,
                "_"
            );

            const filePath = `clients/${userId}/${Date.now()}-${safeFileName}`;

            newImagePath = await uploadFile(
                PROFILE_IMAGE_BUCKET,
                filePath,
                file
            );
        }

        const profile = await prisma.$transaction(async (tx) => {

            // Update user's phone number if provided
            if (phone !== undefined) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        phone: phone.trim() || null,
                    },
                });
            }

            // Update client profile
            return await tx.clientProfile.update({
                where: { userId },
                data: {
                    companyName,
                    location,
                    website,
                    bio,
                    ...(newImagePath && {
                        profileImageUrl: newImagePath,
                    }),
                },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            });
        });

        // Delete previous image only after database update succeeds
        if (newImagePath && existingProfile.profileImageUrl) {
            try {
                await deleteFile(
                    PROFILE_IMAGE_BUCKET,
                    existingProfile.profileImageUrl
                );
            } catch (cleanupError) {
                console.error(
                    "Failed to delete old profile image:",
                    cleanupError
                );
            }
        }

        return {
            ...profile,
            profileImageUrl: profile.profileImageUrl
                ? getPublicUrl(
                    PROFILE_IMAGE_BUCKET,
                    profile.profileImageUrl
                )
                : null,
        };

    } catch (error) {

        // Clean up new image if the update fails
        if (newImagePath) {
            try {
                await deleteFile(PROFILE_IMAGE_BUCKET, newImagePath);
            } catch (cleanupError) {
                console.error(
                    "Failed to delete new profile image:",
                    cleanupError
                );
            }
        }

        if (error.code === "P2002") {
            const conflictError = new Error(
                "Phone number is already in use"
            );
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error;
    }
};


module.exports = {
    getFreelancerProfile,
    createFreelancerProfile,
    updateFreelancerProfile,
    getClientProfile,
    createClientProfile,
    updateClientProfile,
};