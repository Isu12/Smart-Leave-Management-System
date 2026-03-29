/**
 * File: app.js
 * Purpose: Express application setup configuration.
 * Mounts global middleware (like CORS and JSON parsing) and registers all API routes for the service.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes will be imported here
// const balanceRoutes = require('./routes/balanceRoutes');
// const reportRoutes = require('./routes/reportRoutes');

// app.use('/api/balance', balanceRoutes);
// app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Leave Balance & Reporting Service' });
});

module.exports = app;
