const { createContract, getProposalById, getContractByProposalId, getContractById, acceptContract } = require("./contract.service");

const createContractController = async (req, res) => {
    const proposalId = parseInt(req.params.proposalId);

    const proposal = await getProposalById(proposalId);

    if (!proposal) {
        return res.status(404).json({
            success: false,
            message: "Proposal not found",
        });
    }

    if (proposal.status !== "ACCEPTED") {
        return res.status(400).json({
            success: false,
            message: "only accepted proposals can become contracts",
        });
    }

    if (proposal.job.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "You can only create contracts for your own jobs",
        });
    }

    const existingContract = await getContractByProposalId(proposalId);

    if (existingContract) {
        return res.status(409).json({
            success: false,
            message: "A contract already exists for this proposal",
        });
    }

    const contract = await createContract({
        proposalId,
        clientId: proposal.job.clientId,
        freelancerId: proposal.freelancerId,
        totalAmount: proposal.bidAmount,
    });

    return res.status(201).json({
        success: true,
        message: "Contract created successfully",
        contract,
    });
};

const acceptContractController = async (req, res) => {
    const contractId = parseInt(req.params.contractId, 10);

    if (!Number.isInteger(contractId) || contractId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid contract ID",
        });
    }

    const contract = await getContractById(contractId);

    if (!contract) {
        return res.status(404).json({
            success: false,
            message: "Contract not found",
        });
    }

    if (contract.freelancerId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: " Only the assigned freelancer can accept this contract",
        });
    }

    if (contract.status !== "PENDING") {
        return res.status(400).json({
            success: false,
            message: "This contract is no longer pending",
        });
    }

    const updatedContract = await acceptContract(contractId);

    return res.status(200).json({
        success: true,
        message: "Contract accepted successfully",
        contract: updatedContract,
    });
};

module.exports = {
    createContractController,
    acceptContractController,
}