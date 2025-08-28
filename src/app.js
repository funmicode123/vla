const express = require('express');
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
const app = express();
const sessionRoutes = require('./routes/session.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
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

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use('/api/v1', signupRouter);

app.use(express.json());

app.use('/api/v1', loginRouter);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1', conversationRouter);
app.use('/api/v1', engagementRoutes);


const swaggerOptions = {
  swaggerOptions: {
    authAction: {
      bearerAuth: {
        name: "bearerAuth",
        schema: {
          type: "http",
          in: "header",
          name: "Authorization",
          scheme: "bearer",
          bearerFormat: "JWT"
        },
        value: `Bearer ${token}`,
      }
    }
  }
};
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
app.use('/api/v1/sessions', sessionRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the Attention Tracker API');
});

app.use(errorHandler);

module.exports = app;
