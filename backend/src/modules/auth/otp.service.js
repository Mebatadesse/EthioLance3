const transporter = require("../../config/email");

const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "EthioLance Email Verification",
        text: `Your EthioLance verification code is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
    });
};

const sendPasswordResetEmail = async (email, resetLink) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "EthioLance Password Reset",
        text: `We received a request to reset your EthioLance password.

Click the link below to reset your password:
${resetLink}

This link expires in 15 minutes. If you did not request a password reset, you can ignore this email.`,
    });
};

module.exports = {
    sendOtpEmail,
    sendPasswordResetEmail,
};