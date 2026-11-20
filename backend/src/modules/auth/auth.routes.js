const express = require("express");

const { register, login, verifyOtp, googleLogin } = require("./auth.controller");
const { loginLimiter, verifyOtpLimiter } = require("../../middleware/rateLimiter");

const router = express.Router();

router.post(
    "/register", 
    register
);

router.post(
    "/login", 
    loginLimiter, 
    login
);

router.post(
    "/verify-otp", 
    verifyOtpLimiter, 
    verifyOtp
);

router.post(
    "/google", 
    loginLimiter, 
    googleLogin
);

module.exports = router;