const prisma = require("../config/prisma");

const createJob = async (jobData) => {
    const job = await prisma.job.create({
        data: jobData,
    });

    return job;
};

const getJobs = async (filters = {}) => {
    const { categoryId, skill, location, isRemote } = filters;

    const where = {
        status: "OPEN",
    };

    // Filter by category
    if (categoryId) {
        where.categoryId = Number(categoryId);
    }

    // Filter by required skill
    if (skill) {
        where.requiredSkills = {
            has: skill,
        };
    }

    // Filter by location (case-insensitive partial match)
    if (location) {
        where.location = {
            contains: location,
            mode: "insensitive",
        };
    }

    // Filter by remote status
    if (isRemote !== undefined) {
        where.isRemote = isRemote;
    }

    const jobs = await prisma.job.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            category: true,
            client: {
                select: {
                    id: true,
                    clientProfile: {
                        select: {
                            companyName: true,
                            profileImageUrl: true,
                            website: true,
                        },
                    },
                },
            },
        },
    });

    return jobs;
};


const getJobById = async (jobId) => {
    const job = await prisma.job.findUnique({
        where: {
            id: jobId,
        },
        include: {
            category: true,
            client: {
                select: {
                    id: true,
                    clientProfile: {
                        select: {
                            companyName: true,
                            profileImageUrl: true,
                            website: true,
                        },
                    },
                },
            },
        },
    });

    return job;
};

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

const getJobCategories = async () => {
    return await prisma.jobCategory.findMany({
        orderBy: {
            name: "asc",
        },
    });
};

const createJobCategories = async () => {
    const categories = [
        "Web Development",
        "Mobile App Development",
        "UI/UX Design",
        "Graphic Design",
        "Data Science",
        "Artificial Intelligence",
        "Cybersecurity",
        "Software Testing & QA",
        "Database Management",
        "Digital Marketing",
        "Content Writing",
        "Video Editing",
    ];

    await prisma.jobCategory.createMany({
        data: categories.map((name) => ({ name })),
        skipDuplicates: true,
    });
};

const getJobCategoryById = async (categoryId) => {
    return await prisma.jobCategory.findUnique({
        where: {
            id: categoryId,
        },
    });
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getJobCategories,
    createJobCategories,
    getJobCategoryById,
};