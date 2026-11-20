const bcrypt = require("bcrypt");
const crypto = require("crypto");

const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
};

const comparePassword = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
};

const generateOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (value) => {
    const secret = process.env.OTP_HASH_SECRET;

    if (!secret) {
        throw new Error("OTP_HASH_SECRET is not configured");
    }

    return crypto
        .createHmac("sha256", secret)
        .update(value)
        .digest("hex");
};

module.exports = {
    hashPassword,
    comparePassword,
    generateOtp,
    hashOtp,
};