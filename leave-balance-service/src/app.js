/**
 * File: app.js
 * Purpose: Express application setup configuration.
 * Mounts global middleware (like CORS and JSON parsing) and registers all API routes for the service.
 */

const express = require('express');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

const balanceRoutes = require('./routes/balanceRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');

app.use('/api/balance', balanceRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Leave Balance & Reporting Service' });
});

module.exports = app;
