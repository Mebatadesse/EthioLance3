const express = require("express");

const {
    register,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    login,
    resendLoginOtp,
    verifyOtp,
    googleLogin,
    forgotPassword,
    resetPassword,
    changePassword
} = require("./auth.controller");
const { loginLimiter, verifyOtpLimiter } = require("../../middleware/rateLimiter");
const authenticate = require("../../middleware/auth.middleware");

const router = express.Router();

router.post(
    "/register", 
    register
);

router.post(
    "/verify-registration-otp", 
    verifyOtpLimiter, 
    verifyRegistrationOtp
);

router.post(
    "/resend-registration-otp",
    verifyOtpLimiter,
    resendRegistrationOtp
);

router.post(
    "/login", 
    loginLimiter, 
    login
);

router.post(
    "/resend-login-otp",
    verifyOtpLimiter,
    resendLoginOtp
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

router.post(
    "/forgot-password", 
    loginLimiter, 
    forgotPassword
);

router.post(
    "/reset-password", 
    loginLimiter, 
    resetPassword
);

router.patch(
    "/change-password", 
    authenticate, 
    changePassword
);

module.exports = router;