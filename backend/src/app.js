const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const app = express();
const sessionRoutes = require('./routes/session.routes');
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require('./config/swagger');
const jwt = require('jsonwebtoken');
const signupRouter = require('./routes/signup.routes');
const loginRouter = require('./routes/login.routes');
const path = require('path');
const conversationRouter = require('./routes/conversationRoute');
const engagementRoutes = require('./routes/engagementRoutes');

require('dotenv').config();

const mockUserId = '64dcebbd2a2a0123456789a1';
const token = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log('\n🔐 Test JWT Token (valid for 1h):\n');
console.log(token);
console.log('\nPaste this token in Swagger "Authorize" button.\n');

// Configure CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://vla-production.up.railway.app' // Optional: if frontend is also deployed here
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/v1', signupRouter);
app.use('/api/v1', loginRouter);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1', conversationRouter);
app.use('/api/v1', engagementRoutes);

// Static files and Swagger
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.get('/', (req, res) => {
    res.send('Welcome to the Attention Tracker API');
});

app.use(errorHandler);

module.exports = app;
