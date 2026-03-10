const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const generateToken = require('../utils/generateToken');
const path = require('path');

let token = null;
if (process.env.NODE_ENV !== 'production') {
  try {
    token = generateToken();
    console.log('\n🔐 Test JWT Token (valid for 1h):\n', token, '\nPaste this token in Swagger "Authorize" button.\n');
  } catch (error) {
    console.warn('Failed to generate test JWT token. Ensure JWT_SECRET is set locally for dev. Proceeding without token.', error.message);
  }
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Virtual Learning API',
      version: '1.0.0',
      description: 'API for managing sessions and users',
    },
    servers: [
      {
        url: 'http://localhost:5000', 
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },

  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../dto/**/*.js'),
  ], 
};

const swaggerSpec = swaggerJsdoc(options);
if (token){
  swaggerSpec.token = token;
}


module.exports = {
  swaggerUi,
  swaggerSpec
};
