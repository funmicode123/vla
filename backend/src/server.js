require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const jwt = require('jsonwebtoken');
const path = require('path');
const MessageRouter = require('./routes/messageRoute');
const googleAuthRouter = require('./routes/googleAuth.routes');
const sessionRouter = require('./routes/session.routes');
const signupRouter = require('./routes/signup.routes');
const loginRouter = require('./routes/login.routes');
const conversationRouter = require('./routes/conversationRoute');
const engagementRoutes = require('./routes/engagementRoutes');
const errorHandler = require('./middlewares/errorHandler');
const initSocket = require('./config/socket');

const app = express();

app.use(cors({
  origin: 'https://frontend-kl5xkpl4h-funmilola-sannis-projects.vercel.app/', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', MessageRouter);
app.use('/api/v1', googleAuthRouter);
app.use('/sessions', sessionRouter);
app.use('/api/v1', signupRouter);
app.use('/api/v1', loginRouter);
app.use('/api/v1/sessions', sessionRouter); 
app.use('/api/v1', conversationRouter);
app.use('/api/v1', engagementRoutes);

let swaggerOptions = {};
if (process.env.NODE_ENV !== 'production') {
  try {
    const testToken = jwt.sign({ id: '64dcebbd2a2a0123456789a1' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    swaggerOptions = {
      swaggerOptions: {
        authAction: {
          bearerAuth: {
            name: "bearerAuth",
            schema: {
              type: "http",
              in: "header",
              name: "Authorization",
              scheme: "bearer",
              bearerAuth: "JWT",
            },
            value: `Bearer ${testToken}`,
          },
        },
      },
    };
    console.log('Swagger test token generated successfully');
  } catch (err) {
    console.warn('Failed to generate Swagger test token (check JWT_SECRET):', err.message);
    swaggerOptions = {};
  }
} else {
  console.log('Skipping Swagger test token in production');
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

app.get('/', (req, res) => res.send('Welcome to the Attention Tracker API'));

app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://frontend-kl5xkpl4h-funmilola-sannis-projects.vercel.app/', 
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
  },
});
initSocket(io);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MongoDB URI not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT, '0.0.0.0', () => {
      console.log(`Server with Socket.IO running on ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });