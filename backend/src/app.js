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
const messageRouter = require('./routes/messageRoute');
const googleAuthRouter = require('./routes/googleAuth.routes');

require('dotenv').config();

// Configure CORS
const allowedOrigins = [
    'http://localhost:5173',
    'https://frontend-iota-nine-35.vercel.app',
    'https://vla-production.up.railway.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', messageRouter);
app.use('/api/v1', googleAuthRouter);
app.use('/api/v1', signupRouter);
app.use('/api/v1', loginRouter);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1', conversationRouter);
app.use('/api/v1', engagementRoutes);

// Swagger
let swaggerOptions = {};
if (process.env.NODE_ENV !== 'production') {
    try {
        const testToken = jwt.sign({ id: '64dcebbd2a2a0123456789a1' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
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
    } catch (err) {
        console.warn('Swagger token generation warning:', err.message);
    }
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

app.get('/', (req, res) => {
    res.send('Welcome to the Attention Tracker API');
});

app.use(errorHandler);

module.exports = app;
