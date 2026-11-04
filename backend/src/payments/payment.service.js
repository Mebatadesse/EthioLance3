
const { error } = require("console");
const prisma = require("../config/prisma");
const { randomUUID } = require("crypto");

const getMilestoneForPayment = async (milestoneId) => {
    return await prisma.milestone.findUnique({
        where: {
            id: milestoneId,
        },
        include: {
            contract: {
                include: {
                    client: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
            payment: true,
        },
    });
};

const initializeChapaPayment = async (milestone) => {
    const secretKey = process.env.CHAPA_SECRET_KEY;

    if (!secretKey || secretKey.includes("•")) {
        throw new Error("Check CHAPA_SECRET_KEY in backend/.env");
    }

    const existingPayment = milestone.payment;

    if (existingPayment?.status === "COMPLETED") {
        throw new Error("This milestone has already been paid");
    }

    if (existingPayment?.status === "INITIATED" && existingPayment.txRef) {
        throw new Error("A transaction reference already exists. Verify that transaction before retrying.");
    }

    const txRef = `ethiolance-${milestone.id}-${randomUUID()}`;

    const payment = existingPayment ? await prisma.payment.update({
              where: {
                  id: existingPayment.id,
              },
              data: {
                  amount: milestone.amount,
                  method: "CHAPA",
                  txRef,
                  status: "INITIATED",
              },
          })
        : await prisma.payment.create({
              data: {
                  amount: milestone.amount,
                  method: "CHAPA",
                  txRef,
                  status: "INITIATED",
                  milestone: {
                      connect: {
                          id: milestone.id,
                      },
                  },
              },
          });

    const client = milestone.contract.client;

    const payload = {
        amount: String(milestone.amount),
        currency: "ETB",
        email: client.email,
        first_name: client.firstName,
        last_name: client.lastName,
        tx_ref: txRef,
        customization: {
            title: "EthioLance",
            description: `Payment for milestone ${milestone.id}`,
        },
    };

    let response;

    try {
        response = await fetch(
            "https://api.chapa.co/v1/transaction/initialize",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );
    } catch (error) {
        throw new Error( "Could not connect to Chapa. Verify this transaction before retrying.");
    }

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.status !== "success" || !result?.data?.checkout_url) {
        await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: "FAILED",
            },
        });

        throw new Error(
            result?.message ||
            `Chapa initialization failed with HTTP ${response.status}`
        );
    }

    return {
        payment,
        checkoutUrl: result.data.checkout_url,
    };
};

const verifyChapaPayment = async (txRef) => {
    const secretKey = process.env.CHAPA_SECRET_KEY;

    if(!secretKey || secretKey.includes("•")) {
        throw new Error("Check CHAPA_SECRET_KEY in backend/.env");
    }

    let response;

    try {
        response = await fetch(
            `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        throw new Error("Could not connect to chapa verification service");
    }

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.status !== "success" || !result?.data) {
        throw new Error(
            typeof result?.message === "string"
                ? result.message
                : "Chapa could not verify this transaction"
        );
    }

    return result.data;
};

module.exports = {
    getMilestoneForPayment,
    initializeChapaPayment,
    verifyChapaPayment,
};
