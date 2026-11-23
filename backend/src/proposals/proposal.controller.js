const { createProposal, getJobById, getExistingProposal, getProposalsByJobId, getProposalById, acceptProposal} = require("./proposal.service");

const createProposalController = async (req, res) => {
    const { coverLetter, bidAmount, deliveryTime } = req.body;

    const jobId = Number(req.params.jobId);

    if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid job ID",
        });
    } 

    const freelancerId = req.user.userId;

    const job = await getJobById(jobId);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    if (job.clientId === freelancerId) {
        return res.status(403).json({
            success: false,
            message: "You cannot submit a proposal to your own job",
        });
    }

    if (job.status !== "OPEN") {
        return res.status(400).json({
            success: false,
            message: "This job is no longer accepting proposals",
        });
    }

    const existingProposal = await getExistingProposal(
        freelancerId,
        jobId
    );

    if (existingProposal) {
        return res.status(400).json({
            success: false,
            message: "You have already applied to this job",
        });
    }

    const proposal = await createProposal({
        coverLetter,
        bidAmount,
        deliveryTime,
        freelancerId,
        jobId,
    });

    return res.status(201).json({
        success: true,
        message: "Proposal submitted successfully",
        proposal,
    });
};

const getProposalsByJobIdController = async (req, res) => {
    const jobId = Number(req.params.jobId);

    if (!Number.isInteger(jobId) || jobId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid job ID",
        });
    }

    const job = await getJobById(jobId);

    if(!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found",
        });
    }

    if(job.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "You can only view proposals for your own jobs",
        });
    }

    const proposals = await getProposalsByJobId(jobId);

    return res.status(200).json({
        success: true,
        proposals,
    });
};

const acceptProposalController = async (req, res) => {
    const proposalId = Number(req.params.proposalId);

    if (!Number.isInteger(proposalId) || proposalId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid proposal ID",
        });
    }

    const proposal = await getProposalById(proposalId);

    if (!proposal) {
        return res.status(404).json({
            success: false,
            message: "Proposal not found", 
        });
    }

    if (proposal.job.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "You can only accept proposals for your own jobs",
        });
    }

    if (proposal.status !== "PENDING") {
        return res.status(400).json({
            success: false,
            message: "This proposal is no longer pending",
        });
    }

    const acceptedProposal = await acceptProposal(
        proposalId,
        proposal.jobId
    );

    return res.status(200).json({
        success: true,
        message: "Proposal accepted successfully",
        proposal: acceptedProposal,
    });
};

module.exports = {
    createProposalController,
    getProposalsByJobIdController,
    acceptProposalController,
};