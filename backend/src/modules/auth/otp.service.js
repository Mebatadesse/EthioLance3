const transporter = require("../../config/email");

const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "EthioLance Login Verification",
        text: `Your EthioLance verification code is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
    });
};

module.exports = {
    sendOtpEmail,
}