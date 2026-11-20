const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role,
            tokenVersion: user.tokenVersion,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );

    return token;
};

module.exports = {
    generateToken,
}