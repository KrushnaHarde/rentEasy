const { validateToken } = require("../services/authentication");

function requireAuth(cookieName = "token") {
  return (req, res, next) => {
    let token = req.cookies[cookieName] || req.headers["authorization"];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    // Handle "Bearer <token>"
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    try {
      const userPayload = validateToken(token);
      req.user = userPayload;
      next();
    } catch (error) {
      console.error("Invalid token:", error);
      res.clearCookie(cookieName);
      return res.status(401).json({ error: "Invalid session. Please log in again." });
    }
  };
}

module.exports = { requireAuth };
