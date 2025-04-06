const { Router } = require("express");
const { signup, signin, logout, profile } = require("../controllers/userController");
const { requireAuth } = require("../middleware/authentication");

const { googleAuth } = require("../controllers/userController");
const router = Router();

router.post("/google-auth", googleAuth);

// Public Routes
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/logout", logout);

// Protected Routes
router.get("/profile", requireAuth("token"), profile);

module.exports = router;
