const prisma = require("../config/prisma");

const getContractById = async (contractId) => {
    const contract = await prisma.contract.findUnique({
        where: {
            id: contractId,
        },
        include: {
            milestones: true,
        },
    });

    return contract;
};

const createMilestone = async (milestoneData) => {
    const milestone = await prisma.milestone.create({
        data: milestoneData,
    });

    return milestone;
};

const getMilestoneById = async (milestoneId) => {
    const milestone = await prisma.milestone.findUnique({
        where: {
            id: milestoneId,
        },
        include: {
            contract: true,
        },
    });

    return milestone;
};

const updateMilestone = async (milestoneId, data) => {
    const milestone = await prisma.milestone.update({
        where: {
            id: milestoneId,
        },
        data,
    });

    return milestone;
};

module.exports = {
    getContractById,
    createMilestone,
    getMilestoneById,
    updateMilestone,
}