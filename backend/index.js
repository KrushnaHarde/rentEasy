require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const http = require('http');
const socketIo = require('socket.io');
const { instrument } = require("@socket.io/admin-ui");

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
const chatRoutes = require('./routes/chatRoute');
const ChatSocketHandler = require('./services/socket/chatSocketHandler');

// Start the schedulers when your app initializes

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL).then(() => console.log("Connected to DB"));


// Initialize the notification scheduler
// Middleware
app.use(express.json({ limit: '10mb' })); // Parse JSON data
app.use(cookieParser());

const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "http://localhost:5174",
    "http://localhost:3000", 
    "http://localhost:3001",
    "https://admin.socket.io"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

app.use(cors(corsOptions));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with matching CORS
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.io admin UI (disable in production)
if (process.env.NODE_ENV !== 'production') {
  instrument(io, {
    auth: false,
    mode: "development",
    readonly: false
  });
}

// Routes
app.use("/user", userRoute);    // User routes
app.use("/product", productRoute); // Product routes
app.use("/rental", rentalRoute);   // Rental routes
app.use("/review", reviewRoute);   // Review routes
app.use('/notifications', notificationRoutes);
app.use('/cart', cartRoute); // Cart routes
app.use("/search", searchRoute);   // Search routes
app.use('/recommendations', recommendationRoutes); // Recommendation routes
app.use('/api/chat', chatRoutes); 

initNotificationScheduler();
initializeSchedulers();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Initialize chat handler
const chatHandler = new ChatSocketHandler(io);

// Socket.io connection handling with error handling
io.on('connection', (socket) => {
  try {
    chatHandler.handleConnection(socket);
  } catch (error) {
    console.error('Socket connection error:', error);
    socket.emit('connection_error', { message: 'Connection failed' });
  }
});

// API endpoints
app.get('/api/chat/online-users', (req, res) => {
  try {
    res.json({
      success: true,
      data: chatHandler.getOnlineUsers()
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get online users'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});