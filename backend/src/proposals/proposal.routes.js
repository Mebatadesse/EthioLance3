const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const { createProposalController, getProposalsByJobIdController, acceptProposalController } = require("./proposal.controller");

const router = express.Router();

router.post(
    "/:jobId",
    authenticate,
    authorize("FREELANCER"),
    createProposalController
);

router.get(
    "/job/:jobId",
    authenticate,
    authorize("CLIENT"),
    getProposalsByJobIdController
)

router.put(
    "/:proposalId/accept",
    authenticate,
    authorize("CLIENT"),
    acceptProposalController
);

module.exports = router;