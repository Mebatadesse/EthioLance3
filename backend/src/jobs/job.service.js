const prisma = require("../config/prisma");

const createJob = async (jobData) => {
    const job = await prisma.job.create({
        data: jobData,
    });

    return job;
};

const getJobs = async () => {
    const jobs = await prisma.job.findMany({
        where: {
            status: "OPEN",
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return jobs;
};

const getJobById = async (jobId) => {
    const job = await prisma.job.findUnique({
        where: {
            id: jobId,
        },
    });

    return job;
}

const updateJob = async (jobId, jobData) => {
    const job = await prisma.job.update({
        where: {
            id: jobId,
        },
        data: jobData,
    });

    return job;
};

const deleteJob = async (jobId) => {
    const job = await prisma.job.delete({
        where: {
            id: jobId,
        },
    });
}

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
};