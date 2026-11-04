const { createJob, getJobs, getJobById, updateJob, deleteJob } = require("./job.service");

const createJobController = async (req, res) => {
    const { title, description, budget } = req.body;

    const job = await createJob({
        title,
        description, 
        budget, 
        clientId: req.user.userId,
    });

    return res.status(201).json({
        success: true,
        message: "Job created successfully",
        job,
    });
};

const getJobsController = async (req, res) => {
    const jobs = await getJobs();

    return res.status(200).json({
        success: true,
        jobs,
    });
};

const getJobByIdController = async (req, res) => {
    const jobId = parseInt(req.params.id);

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
    const jobId = parseInt(req.params.id);

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
            message: "You can only update your own jobs",
        });
    }

    const { title, description, budget } = req.body;

    const job = await updateJob(jobId, {
        title,
        description, 
        budget
    });

    return res.status(200).json({
        success: true,
        message: "Job updated successfully",
        job,
    });
};

const deleteJobController = async (req, res) => {
    const jobId = parseInt(req.params.id);

    const existingJob = await getJobById(jobId);

    if (existingJob.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "You can only delete your own jobs",
        });
    }

    await deleteJob(jobId);

    return res.status(200).json({
        success: true,
        message: "Job deleted successfully",
    });
};

module.exports = {
    createJobController,
    getJobsController,
    getJobByIdController,
    updateJobController,
    deleteJobController,
};