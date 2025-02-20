const JWT = require('jsonwebtoken');
const secret = "$PotterHe@d123";

function createTokenForUser(user) {
    const payload = {
        id: user._id,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
    };
    const token = JWT.sign(payload, secret);
    return token;
    // return JWT.sign({ user }, secret, { expiresIn: '24h' });
}

function validateToken(token) {
    try {
        const payload = JWT.verify(token, secret);
        console.log("Extracted User ID from Token:", payload.id); // ✅ Debugging log
        return payload;
    } catch (error) {
        console.error("JWT Validation Error:", error.message);
        return null;
    }
}


module.exports = {
    createTokenForUser,
    validateToken,
};
