require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const initSocket = require('./config/socket'); 
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const MessageRouter = require('./routes/messageRoute');
const googleAuthRouter = require('./routes/googleAuth.routes');
const sessionRouter = require('./routes/session.routes');


const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());


app.use('/api', MessageRouter);
app.use('/api/v1', googleAuthRouter);
app.use('/sessions', sessionRouter);



if (!MONGODB_URI) {
  console.error('MongoDB URI not defined in .env file');
  process.exit(1);
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'PATCH']
  }
});

initSocket(io);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server with Socket.IO running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });