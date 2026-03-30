/**
 * File: app.js
 * Purpose: Express application setup configuration.
 * Mounts global middleware (cors, morgan, json), registers routes, and sets up error handling.
 */

const express = require('express');
const morgan = require('morgan');
require('dotenv').config();

const balanceRoutes = require('./routes/balanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// 1. Global Middleware
app.use(morgan('dev')); // Log incoming HTTP requests cleanly to the console
app.use(express.json()); // Parse incoming JSON payloads in req.body automatically

// 2. Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Leave Balance & Reporting Service' });
});

// 3. API Route Registration
app.use('/api/balance', balanceRoutes);
app.use('/api/reports', reportRoutes);

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Expose Swagger spec for API Gateway aggregation
app.get('/api-spec', (req, res) => {
  res.json(swaggerDocument);
});

// 4. Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. Global Error Handler
// MUST be placed after all routes so it catches unhandled errors
app.use(errorHandler);

module.exports = app;
