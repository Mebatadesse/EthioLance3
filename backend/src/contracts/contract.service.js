const prisma = require("../config/prisma");

const createContract = async (contractData) => {
    const contract = await prisma.contract.create({
        data: {
            totalAmount: contractData.totalAmount,

            proposal: {
                connect: {
                    id: contractData.proposalId,
                },
            },
            client: {
                connect: {
                    id: contractData.clientId,
                },
            },

            freelancer: {
                connect: {
                    id: contractData.freelancerId,
                },
            },
        },
    });

    return contract;
}

const getProposalById = async (proposalId) => {
    const proposal = await prisma.proposal.findUnique({
        where: {
            id: proposalId,
        },
        include: {
            job: true,
        },
    });

    return proposal;
};

const getContractByProposalId = async (proposalId) => {
    const contract = await prisma.contract.findUnique({
        where: {
            proposalId,
        },
    });

    return contract;
};

const getContractById = async (contractId) => {
    const contract = await prisma.contract.findUnique({
        where: {
            id: contractId,
        },
    });

    return contract;
};

const acceptContract = async (contractId) => {
    const contract = await prisma.contract.update({
        where: {
            id: contractId,
        },
        data: {
            status: "ACTIVE",
            startDate: new Date(),
        },
    });

    return contract;
};

module.exports = {
    createContract,
    getProposalById,
    getContractByProposalId,
    getContractById,
    acceptContract,
}