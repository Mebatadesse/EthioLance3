const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const { createContractController, acceptContractController } = require("./contract.controller");

const router = express.Router();

router.post(
    "/:proposalId",
    authenticate,
    authorize("CLIENT"),
    createContractController
);

router.put(
    "/:contractId/accept",
    authenticate,
    authorize("FREELANCER"),
    acceptContractController
);

module.exports = router;