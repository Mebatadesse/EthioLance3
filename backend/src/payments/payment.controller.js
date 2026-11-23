const prisma = require("../config/prisma");

const {
    getMilestoneForPayment,
    initializeChapaPayment,
    verifyChapaPayment,
} = require("./payment.service");

const initiatePaymentController = async (req, res) => {
    const milestoneId = Number(req.params.milestoneId);

    if (!Number.isInteger(milestoneId) || milestoneId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid milestone ID",
        });
    }

    const milestone = await getMilestoneForPayment(milestoneId);

    if (!milestone) {
        return res.status(404).json({
            success: false,
            message: "Milestone not found",
        });
    }

    if (milestone.contract.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "Only the contract owner can initiate payment",
        });
    }

    if (milestone.status !== "APPROVED") {
        return res.status(400).json({
            success: false,
            message: "Only approved milestones can be paid",
        });
    }

    if (milestone.payment?.status === "COMPLETED") {
        return res.status(409).json({
            success: false,
            message: "This milestone has already been paid",
        });
    }

    if (
        milestone.payment?.status === "INITIATED" &&
        milestone.payment.txRef
    ) {
        return res.status(409).json({
            success: false,
            message:
                "A Chapa transaction already exists. Verify it before retrying.",
        });
    }

    const { payment, checkoutUrl } =
        await initializeChapaPayment(milestone);

    return res.status(200).json({
        success: true,
        message: "Chapa checkout initialized successfully",
        payment,
        checkoutUrl,
    });
};

const verifyPaymentController = async (req, res) => {
    const paymentId = Number(req.params.paymentId);

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment ID",
        });
    }

    const payment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
        },
        include: {
            milestone: {
                include: {
                    contract: true,
                },
            },
        },
    });

    if (!payment) {
        return res.status(404).json({
            success: false,
            message: "Payment not found",
        });
    }

    if (payment.milestone.contract.clientId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: "Only the contract client can verify this payment",
        });
    }

    if (payment.status === "COMPLETED") {
        const result = await prisma.$transaction(async (tx) => {
            const currentPayment = await tx.payment.findUnique({
                where: {
                    id: payment.id,
                },
                include: {
                    milestone: true,
                },
            });

            if (!currentPayment) {
                const error = new Error("Payment not found");
                error.statusCode = 404;
                throw error;
            }

            const milestone =
                currentPayment.milestone.status === "PAID"
                    ? currentPayment.milestone
                    : await tx.milestone.update({
                          where: {
                              id: currentPayment.milestoneId,
                          },
                          data: {
                              status: "PAID",
                          },
                      });

            return {
                payment: currentPayment,
                milestone,
            };
        });

        return res.status(200).json({
            success: true,
            message: "Payment has already been verified",
            payment: result.payment,
            milestone: result.milestone,
        });
    }

    if (!payment.txRef) {
        return res.status(400).json({
            success: false,
            message:
                "This payment has no transaction reference. Initialize checkout first.",
        });
    }

    if (
        payment.milestone.status !== "APPROVED" &&
        payment.milestone.status !== "PAID"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "The milestone must be approved before payment can be completed",
        });
    }

    const chapaData = await verifyChapaPayment(payment.txRef);

    if (
        chapaData.status !== "success" ||
        chapaData.tx_ref !== payment.txRef ||
        Number(chapaData.amount) !== Number(payment.amount) ||
        chapaData.currency !== "ETB"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Chapa verification failed or transaction details do not match",
        });
    }

    const result = await prisma.$transaction(async (tx) => {
        const currentPayment = await tx.payment.findUnique({
            where: {
                id: payment.id,
            },
            include: {
                milestone: true,
            },
        });

        if (!currentPayment) {
            const error = new Error("Payment not found");
            error.statusCode = 404;
            throw error;
        }

        if (currentPayment.txRef !== payment.txRef) {
            const error = new Error(
                "Transaction reference changed. Verify the current transaction."
            );
            error.statusCode = 409;
            throw error;
        }

        if (currentPayment.status === "COMPLETED") {
            const milestone =
                currentPayment.milestone.status === "PAID"
                    ? currentPayment.milestone
                    : await tx.milestone.update({
                          where: {
                              id: currentPayment.milestoneId,
                          },
                          data: {
                              status: "PAID",
                          },
                      });

            return {
                payment: currentPayment,
                milestone,
            };
        }

        if (
            currentPayment.milestone.status !== "APPROVED" &&
            currentPayment.milestone.status !== "PAID"
        ) {
            const error = new Error(
                "The milestone is not ready for payment completion"
            );
            error.statusCode = 409;
            throw error;
        }

        const updatedPayment = await tx.payment.update({
            where: {
                id: currentPayment.id,
            },
            data: {
                status: "COMPLETED",
            },
        });

        const updatedMilestone = await tx.milestone.update({
            where: {
                id: currentPayment.milestoneId,
            },
            data: {
                status: "PAID",
            },
        });

        return {
            payment: updatedPayment,
            milestone: updatedMilestone,
        };
    });

    return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        payment: result.payment,
        milestone: result.milestone,
    });
};

module.exports = {
    initiatePaymentController,
    verifyPaymentController,
};