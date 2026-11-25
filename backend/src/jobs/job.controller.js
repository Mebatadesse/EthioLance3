
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getJobCategories,
    getJobCategoryById,
} = require("./job.service");

// CREATE JOB
const createJobController = async (req, res) => {
    const {
        title,
        description,
        contractType,
        hourlyMinRate,
        hourlyMaxRate,
        fixedBudget,
        deadline,
        requiredSkills,
        attachments,
        categoryId,
        location,
        isRemote,
    } = req.body;

    // Validate required fields
    if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof description !== "string" ||
        !description.trim() ||
        !contractType ||
        !deadline ||
        categoryId === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Title, description, contract type, deadline, and category are required",
        });
    }

    // Validate contract type
    if (!["HOURLY", "FIXED_PRICE"].includes(contractType)) {
        return res.status(400).json({
            success: false,
            message: "Contract type must be HOURLY or FIXED_PRICE",
        });
    }

    // Validate category ID
    const parsedCategoryId = Number(categoryId);

    if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid category ID",
        });
    }

    // Check whether category exists
    const category = await getJobCategoryById(parsedCategoryId);

    if (!category) {
        return res.status(404).json({
            success: false,
            message: "Job category not found",
        });
    }

    // Validate deadline
    const parsedDeadline = new Date(deadline);

    if (
        isNaN(parsedDeadline.getTime()) ||
        parsedDeadline <= new Date()
    ) {
        return res.status(400).json({
            success: false,
            message: "Deadline must be a valid future date",
        });
    }

    // Validate skills and attachments
    if (
        (requiredSkills !== undefined &&
            (!Array.isArray(requiredSkills) ||
                !requiredSkills.every(skill => typeof skill === "string"))) ||
        (attachments !== undefined &&
            (!Array.isArray(attachments) ||
                !attachments.every(file => typeof file === "string")))
    ) {
        return res.status(400).json({
            success: false,
            message: "Skills and attachments must be arrays of strings",
        });
    }

    // Validate job location
    if (
        location !== undefined &&
        (typeof location !== "string" || !location.trim())
    ) {
        return res.status(400).json({
            success: false,
            message: "Location must be a non-empty string",
        });
    }

    // Validate remote status
    if (
        isRemote !== undefined &&
        typeof isRemote !== "boolean"
    ) {
        return res.status(400).json({
            success: false,
            message: "isRemote must be a boolean",
        });
    }

    // Remote jobs should not have a physical location
    if (isRemote === true && location !== undefined) {
        return res.status(400).json({
            success: false,
            message: "Remote jobs should not have a physical location",
        });
    }

    // Non-remote jobs require a location
    if (isRemote !== true && !location?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Location is required for non-remote jobs",
        });
    }

    // Prepare job data
    const jobData = {
        title: title.trim(),
        description: description.trim(),
        contractType,
        deadline: parsedDeadline,
        requiredSkills: requiredSkills || [],
        attachments: attachments || [],
        location: isRemote === true ? null : location.trim(),
        isRemote: isRemote === true,
        categoryId: parsedCategoryId,
        clientId: req.user.userId,
    };

    // Validate hourly contract
    if (contractType === "HOURLY") {
        const minRate = Number(hourlyMinRate);
        const maxRate = Number(hourlyMaxRate);

        if (
            hourlyMinRate === undefined ||
            hourlyMaxRate === undefined ||
            !Number.isFinite(minRate) ||
            !Number.isFinite(maxRate) ||
            minRate <= 0 ||
            maxRate < minRate
        ) {
            return res.status(400).json({
                success: false,
                message: "Hourly jobs require valid positive minimum and maximum rates, with maximum not less than minimum",
            });
        }

        jobData.hourlyMinRate = minRate;
        jobData.hourlyMaxRate = maxRate;
        jobData.fixedBudget = null;
    }

    // Validate fixed-price contract
    if (contractType === "FIXED_PRICE") {
        const budget = Number(fixedBudget);

        if (
            fixedBudget === undefined ||
            !Number.isFinite(budget) ||
            budget <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Fixed-price jobs require a positive fixed budget",
            });
        }

        jobData.fixedBudget = budget;
        jobData.hourlyMinRate = null;
        jobData.hourlyMaxRate = null;
    }

    const job = await createJob(jobData);

    return res.status(201).json({
        success: true,
        message: "Job created successfully",
        job,
    });
};

const getJobsController = async (req, res) => {
    const { categoryId, skill, location, isRemote } = req.query;

    const filters = {};

    // Validate category ID
    if (categoryId !== undefined) {
        const parsedCategoryId = Number(categoryId);

        if (
            !Number.isInteger(parsedCategoryId) ||
            parsedCategoryId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        filters.categoryId = parsedCategoryId;
    }

    // Validate skill
    if (skill !== undefined) {
        if (typeof skill !== "string" || !skill.trim()) {
            return res.status(400).json({
                success: false,
                message: "Skill must be a non-empty string",
            });
        }

        filters.skill = skill.trim();
    }

    // Validate location
    if (location !== undefined) {
        if (typeof location !== "string" || !location.trim()) {
            return res.status(400).json({
                success: false,
                message: "Location must be a non-empty string",
            });
        }

        filters.location = location.trim();
    }

    // Validate remote status
    if (isRemote !== undefined) {
        if (!["true", "false"].includes(isRemote)) {
            return res.status(400).json({
                success: false,
                message: "isRemote must be true or false",
            });
        }

        filters.isRemote = isRemote === "true";
    }

    // Get filtered jobs
    const jobs = await getJobs(filters);

    return res.status(200).json({
        success: true,
        jobs,
    });
};


// GET JOB BY ID
const getJobByIdController = async (req, res) => {
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid job ID",
        });
    }

    const job = await getJobById(jobId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    return res.status(200).json({
        success: true,
        job,
    });
};


const updateJobController = async (req, res) => {
    const jobId = Number(req.params.id);

    // Validate job ID
    if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid job ID",
        });
    }

    // Check whether job exists
    const existingJob = await getJobById(jobId);

    if (!existingJob) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    // Check job ownership
    if (existingJob.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "You can only update your own jobs",
        });
    }

    // Only OPEN jobs can be updated
    if (existingJob.status !== "OPEN") {
        return res.status(400).json({
            success: false,
            message: "Only open jobs can be updated",
        });
    }

    const {
        title,
        description,
        contractType,
        hourlyMinRate,
        hourlyMaxRate,
        fixedBudget,
        deadline,
        requiredSkills,
        attachments,
        categoryId,
        location,
        isRemote,
    } = req.body;

    // Prepare update data
    const jobData = {};

    if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title must be a non-empty string",
            });
        }

        jobData.title = title.trim();
    }

    if (description !== undefined) {
        if (typeof description !== "string" || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Description must be a non-empty string",
            });
        }

        jobData.description = description.trim();
    }

    // Validate contract type and prices
    if (
        contractType !== undefined ||
        hourlyMinRate !== undefined ||
        hourlyMaxRate !== undefined ||
        fixedBudget !== undefined
    ) {
        const newContractType = contractType || existingJob.contractType;

        if (!["HOURLY", "FIXED_PRICE"].includes(newContractType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contract type",
            });
        }

        jobData.contractType = newContractType;

        if (newContractType === "HOURLY") {
            const minRate = Number(
                hourlyMinRate ?? existingJob.hourlyMinRate
            );

            const maxRate = Number(
                hourlyMaxRate ?? existingJob.hourlyMaxRate
            );

            if (
                !Number.isFinite(minRate) ||
                !Number.isFinite(maxRate) ||
                minRate <= 0 ||
                maxRate < minRate
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Valid hourly minimum and maximum rates are required",
                });
            }

            jobData.hourlyMinRate = minRate;
            jobData.hourlyMaxRate = maxRate;
            jobData.fixedBudget = null;
        }

        if (newContractType === "FIXED_PRICE") {
            const budget = Number(
                fixedBudget ?? existingJob.fixedBudget
            );

            if (!Number.isFinite(budget) || budget <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "A valid fixed budget is required",
                });
            }

            jobData.fixedBudget = budget;
            jobData.hourlyMinRate = null;
            jobData.hourlyMaxRate = null;
        }
    }

    // Validate deadline
    if (deadline !== undefined) {
        const parsedDeadline = new Date(deadline);

        if (
            isNaN(parsedDeadline.getTime()) ||
            parsedDeadline <= new Date()
        ) {
            return res.status(400).json({
                success: false,
                message: "Deadline must be a valid future date",
            });
        }

        jobData.deadline = parsedDeadline;
    }

    // Validate required skills
    if (requiredSkills !== undefined) {
        if (
            !Array.isArray(requiredSkills) ||
            !requiredSkills.every(skill => typeof skill === "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Required skills must be an array of strings",
            });
        }

        jobData.requiredSkills = requiredSkills;
    }

    // Validate attachments
    if (attachments !== undefined) {
        if (
            !Array.isArray(attachments) ||
            !attachments.every(file => typeof file === "string")
        ) {
            return res.status(400).json({
                success: false,
                message: "Attachments must be an array of strings",
            });
        }

        jobData.attachments = attachments;
    }

    // Validate category
    if (categoryId !== undefined) {
        const parsedCategoryId = Number(categoryId);

        if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid category ID",
            });
        }

        const category = await getJobCategoryById(parsedCategoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Job category not found",
            });
        }

        jobData.categoryId = parsedCategoryId;
    }

    // Validate remote status
    if (
        isRemote !== undefined &&
        typeof isRemote !== "boolean"
    ) {
        return res.status(400).json({
            success: false,
            message: "isRemote must be a boolean",
        });
    }

    // Validate location
    if (
        location !== undefined &&
        (typeof location !== "string" || !location.trim())
    ) {
        return res.status(400).json({
            success: false,
            message: "Location must be a non-empty string",
        });
    }

    // Determine the final remote status
    const finalIsRemote = isRemote ?? existingJob.isRemote;

    // Determine the final location
    const finalLocation = location !== undefined
        ? location.trim()
        : existingJob.location;

    // Validate the final location and remote status together
    if (finalIsRemote === true) {
        if (location !== undefined && location.trim()) {
            return res.status(400).json({
                success: false,
                message: "Remote jobs should not have a physical location",
            });
        }

        if (
            isRemote !== undefined ||
            location !== undefined
        ) {
            jobData.isRemote = true;
            jobData.location = null;
        }
    } else {
        if (!finalLocation || !finalLocation.trim()) {
            return res.status(400).json({
                success: false,
                message: "Location is required for non-remote jobs",
            });
        }

        if (
            isRemote !== undefined ||
            location !== undefined
        ) {
            jobData.isRemote = false;
            jobData.location = finalLocation.trim();
        }
    }

    // Check whether there is anything to update
    if (Object.keys(jobData).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide at least one field to update",
        });
    }

    // Update job
    const job = await updateJob(jobId, jobData);

    return res.status(200).json({
        success: true,
        message: "Job updated successfully",
        job,
    });
};



// DELETE JOB
const deleteJobController = async (req, res) => {
    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid job ID",
        });
    }

    const existingJob = await getJobById(jobId);

    if (!existingJob) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    if (existingJob.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "You can only delete your own jobs",
        });
    }

       // Only OPEN jobs can be deleted
    if (existingJob.status !== "OPEN") {
        return res.status(400).json({
            success: false,
            message: "Only open jobs can be deleted",
        });
    }

    await deleteJob(jobId);

    return res.status(200).json({
        success: true,
        message: "Job deleted successfully",
    });
};

// GET JOB CATEGORIES
const getJobCategoriesController = async (req, res) => {
    const categories = await getJobCategories();

    return res.status(200).json({
        success: true,
        categories,
    });
};

// EXPORT CONTROLLERS
module.exports = {
    createJobController,
    getJobsController,
    getJobByIdController,
    updateJobController,
    deleteJobController,
    getJobCategoriesController,
};
