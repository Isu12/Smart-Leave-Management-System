/**
 * File: server.js
 * Purpose: Main entry point for the microservice.
 * Responsible for connecting to the database and spinning up the Express server on the specified PORT.
 */

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Leave Balance & Reporting Service running on port ${PORT}`);
});
