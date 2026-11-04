const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const { initiatePaymentController, verifyPaymentController } = require("./payment.controller");

const router = express.Router();

router.post(
    "/milestone/:milestoneId",
    authenticate,
    authorize("CLIENT"),
    initiatePaymentController
);

router.post(
    "/verify/:paymentId",
    authenticate,
    authorize("CLIENT"),
    verifyPaymentController
);

module.exports = router;