const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/modules/auth/auth.routes");
const userRoutes = require("./src/modules/users/user.routes");
const jobRoutes = require("./src/jobs/job.routes");
const proposalRoutes = require("./src/proposals/proposal.routes");
const contractRoutes = require("./src/contracts/contract.routes");
const milestoneRoutes = require("./src/milestones/milestone.routes");
const paymentRoutes = require("./src/payments/payment.routes");
const profileRoutes = require("./src/profiles/profile.routes");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/profiles", profileRoutes);
  
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to EthioLance API",
    });
});

module.exports = app;