/**
 * File: server.js
 * Purpose: Main entry point for the microservice.
 * Responsible for connecting to the database and spinning up the Express server.
 */

// Load environment variables as early as possible
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5001;

console.log("Starting server file...");

// Connect to MongoDB Database first
connectDB().then(() => {
  // Only begin listening for HTTP requests after DB connection is successful
  app.listen(PORT, () => {
    console.log(`🚀 Leave Balance & Reporting Service running at http://localhost:${PORT}`);
  });
});
