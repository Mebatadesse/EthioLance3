const { getContractById, createMilestone, getMilestoneById, updateMilestone } = require("./milestone.service");

const createMilestoneController = async (req, res) => {
    const contractId = parseInt(req.params.contractId, 10);
    const { title, amount, dueDate } = req.body;

    if (!Number.isInteger(contractId) || contractId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid contract ID",
        });
    }

    if (
        typeof title !== "string" ||
        !title.trim() ||
        amount === undefined ||
        dueDate === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Title, amount, and due date are required",
        });
    }

    const milestoneAmount = Number(amount);
    const parsedDueDate = new Date(dueDate);

    if (
        !Number.isFinite(milestoneAmount) ||
        milestoneAmount <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Amount must be a positive number",
        });
    }

    if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: "A valid due date is required",
        });
    }

    const contract = await getContractById(contractId);

    if (!contract) {
        return res.status(404).json({
            success: false,
            message: "Contract not found",
        });
    }

    if (contract.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "You can only manage milestones for your own contracts",
        });
    }

    if (contract.status !== "ACTIVE") {
        return res.status(400).json({
            success: false,
            message: "Milestones can only be added to active contracts",
        });
    }

    const allocatedAmount = contract.milestones.reduce(
        (total, milestone) => total + milestone.amount,
        0
    );

    if (
        allocatedAmount + milestoneAmount >
        contract.totalAmount + 0.000001
    ) {
        return res.status(400).json({
            success: false,
            message: "Milestone amounts cannot exceed the contract amount",
        });
    }

    const milestone = await createMilestone({
        title: title.trim(),
        amount: milestoneAmount,
        dueDate: parsedDueDate,
        contractId,
    });

    return res.status(201).json({
        success: true,
        message: "Milestone created successfully",
        milestone,
    });
};

const startMilestoneController = async (req, res) => {
    const milestoneId = parseInt(req.params.milestoneId, 10);

    if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid milestone ID",
        });
    }

    const milestone = await getMilestoneById(milestoneId);

    if(!milestone) {
        return res.status(404).json({
            success: false,
            message: "Milestone not found",
        });
    }

    if (milestone.contract.freelancerId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "Only the assigned freelancer can start this milestone",
        });
    }

    if (milestone.contract.status !== "ACTIVE") {
        return res.status(400).json({
            success: false,
            message: "The contract must be active",
        });
    }

    if (milestone.status !== "PENDING") {
        return res.status(400).json({
            success: false,
            message: "Only pending milestones can be started",
        });
    }

    const updatedMilestone = await updateMilestone(milestoneId, {
        status: "IN_PROGRESS",
    });

    return res.status(200).json({
        success: true,
        message: "Milestone started successfully",
        milestone: updatedMilestone,
    });
};

const deliverMilestoneController = async (req, res) => {
    const milestoneId = parseInt(req.params.milestoneId, 10);

    if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid milestone Id",
        });
    }

    const milestone = await getMilestoneById(milestoneId);

    if (!milestone) {
        return res.status(404).json({
            success: false,
            message: "Milestone not found",
        });
    }

    if (milestone.contract.freelancerId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "Only the assigned freelancer can deliver this milestone",
        });
    }

    if (milestone.status !== "IN_PROGRESS") {
        return res.status(400).json({
            success: false,
            message: "Only in-progress milestones can be delivered",
        });
    }

    const updatedMilestone = await updateMilestone(milestoneId, {
        status: "DELIVERED",
    });

    return res.status(200).json({
        success: true,
        message: "Milestone delivered successfully",
        milestone: updatedMilestone,
    });    
};

const approveMilestoneController = async (req, res) => {
    const milestoneId = parseInt(req.params.milestoneId, 10);

    if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid milestone ID",
        });
    }

    const milestone = await getMilestoneById(milestoneId);

    if (!milestone) {
        return res.status(404).json({
            success: false,
            message: "Milestone not found",
        });
    }

    if (milestone.contract.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "Only the contract owner can approve this milestone",
        });
    }

    if (milestone.status !== "DELIVERED") {
        return res.status(400).json({
            success: false,
            message: "Only delivered milestones can be approved",
        });
    }

    const updatedMilestone = await updateMilestone(milestoneId, {
        status: "APPROVED",
    });

    return res.status(200).json({
        success: true,
        message: "Milestone approved successfully",
        milestone: updatedMilestone,
    });  
}

module.exports = {
    createMilestoneController,
    startMilestoneController,
    deliverMilestoneController,
    approveMilestoneController,
};