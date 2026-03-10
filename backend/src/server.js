require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const initSocket = require('./config/socket');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI not defined in environment variables');
  // We don't exit here so Render can still see the port, but features will fail
}

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust to specific frontend URL in production
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
  },
});
initSocket(io);

// Start Server FIRST to satisfy Render health check
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Listening on 0.0.0.0:${PORT}`);

  // Connect to MongoDB AFTER the server starts listening
  if (MONGODB_URI) {
    console.log('⏳ Connecting to MongoDB...');
    mongoose.connect(MONGODB_URI)
      .then(() => console.log('✅ MongoDB Connected'))
      .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        // Optionally handle reconnect logic here
      });
  }
});

// Global error handling for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});