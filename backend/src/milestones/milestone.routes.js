const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const { createMilestoneController, startMilestoneController, deliverMilestoneController, approveMilestoneController } = require("./milestone.controller");

const router = express.Router();

router.post(
    "/:contractId",
    authenticate,
    authorize("CLIENT"),
    createMilestoneController
);

router.put(
    "/:milestoneId/start",
    authenticate,
    authorize("FREELANCER"),
    startMilestoneController
);

router.put(
    "/:milestoneId/deliver",
    authenticate,
    authorize("FREELANCER"),
    deliverMilestoneController
);

router.put(
    "/:milestoneId/approve",
    authenticate,
    authorize("CLIENT"),
    approveMilestoneController
);

module.exports = router;