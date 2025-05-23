require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const userRoute = require("./routes/user");
const productRoute = require("./routes/product");
const rentalRoute = require("./routes/rental");
const cartRoute = require("./routes/cart");
const searchRoute = require("./routes/search"); 
const reviewRoute = require("./routes/review"); 
const recommendationRoutes = require('./routes/recommendation');
const notificationRoutes = require("./routes/notification");
const { initNotificationScheduler } = require('./services/notificationScheduler');
const { initializeSchedulers } = require('./schedulers/rentalScheduler');

// Start the schedulers when your app initializes

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL).then(() => console.log("Connected to DB"));


// Initialize the notification scheduler
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

// Routes
app.use("/user", userRoute);    // User routes
app.use("/product", productRoute); // Product routes
app.use("/rental", rentalRoute);   // Rental routes
app.use("/review", reviewRoute);   // Review routes
app.use('/notifications', notificationRoutes);
app.use('/cart', cartRoute); // Cart routes
app.use("/search", searchRoute);   // Search routes
app.use('/recommendations', recommendationRoutes); // Recommendation routes

initNotificationScheduler();
initializeSchedulers();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});