const express = require("express");
const authenticate = require("../../middleware/auth.middleware");
const { getMyProfile, updateProfile, getMyDevices, revokeDevice, revokeAllDevices } = require("./user.controller");

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
);

router.get(
    "/devices", 
    authenticate, 
    getMyDevices
);
router.delete(
    "/devices/:id", 
    authenticate, 
    revokeDevice
);
router.delete(
    "/devices", 
    authenticate, 
    revokeAllDevices
);

module.exports = router;