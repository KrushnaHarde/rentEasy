require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const userRoute = require("./routes/user");
const productRoute = require("./routes/product");
const rentalRoute = require("./routes/rental");
const notificationRoutes = require('./routes/notification');
const cartRoutes = require('./routes/cart');
const { scheduleRentalEndingNotifications } = require('./services/notification');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL).then(() => console.log("Connected to DB"));

// Middleware
app.use(express.json()); // Parse JSON data
app.use(cookieParser());
app.use(
  cors({
    // origin (localhost) badlavla bs...................................................
    origin: ["http://localhost:5174","http://localhost:5173"], // Your React frontend URL
    credentials: true, // Allow sending cookies
  })
);


// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directories exist
const fs = require('fs');
const dir = './uploads/products';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Routes
app.use("/user", userRoute);    // User routes
app.use("/product", productRoute); // Product routes
app.use("/rental", rentalRoute);   // Rental routes
app.use('/notifications', notificationRoutes);  // Notification routes
app.use('/cart', cartRoutes);  // Cart routes

scheduleRentalEndingNotifications();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});