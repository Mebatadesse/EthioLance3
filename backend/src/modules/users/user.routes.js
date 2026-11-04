const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const { getMyProfile, updateProfile } = require("./user.controller");

const router = express.Router();
// view profile
router.get(
    "/me", 
    authenticate, 
    getMyProfile
);
//update profile
router.put(
    "/me",
    authenticate,
    updateProfile
)

module.exports = router;