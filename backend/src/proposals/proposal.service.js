const prisma = require("../config/prisma");

const createProposal = async (proposalData) => {
    const proposal = await prisma.proposal.create({
        data: proposalData,
    });

    return proposal;
};
// check whether the job exists
const getJobById = async (jobId) => {
    const job = await prisma.job.findUnique({
        where: {
            id: jobId,
        },
    });

    return job;
};

const getExistingProposal = async (freelancerId, jobId) => {
    const proposal = await prisma.proposal.findUnique({
        where: {
            freelancerId_jobId: {
                freelancerId,
                jobId,
            },
        },
    });

    return proposal;
};

const getProposalsByJobId = async (jobId) => {
    const proposals = await prisma.proposal.findMany({
        where: {
            jobId,
        },
        include: {
            freelancer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return proposals;
};

const getProposalById = async (proposalId) => {
    const proposal = await prisma.proposal.findUnique({
        where: {
            id: proposalId,
        },
        include: {
            job: true,
            freelancer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },      
    });

    return proposal;
};

const acceptProposal = async (proposalId, jobId) => {
    const result = await prisma.$transaction(async (tx) => {
        const acceptedProposal = await tx.proposal.update({
            where: {
                id: proposalId,
            },
            data: {
                status: "ACCEPTED",
            },
        });

        await tx.proposal.updateMany({
            where: {
                jobId,
                id: {
                    not: proposalId,
                },
                status: "PENDING",
            },
            data: {
                status: "REJECTED",
            },
        });

        await tx.job.update({
            where: {
                id: jobId,
            },
            data: {
                status: "IN_PROGRESS",
            },
        });

        return acceptedProposal;
    })

    return result;
}

module.exports = {
    createProposal,
    getJobById,
    getExistingProposal,
    getProposalsByJobId,
    getProposalById,
    acceptProposal,
};