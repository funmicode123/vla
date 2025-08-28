const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const generateToken = require('../utils/generateToken');
const path = require('path');

const token = generateToken();

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

swaggerSpec.token = token;

module.exports = {
  swaggerUi,
  swaggerSpec
};
