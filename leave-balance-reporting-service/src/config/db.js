/**
 * File: db.js
 * Purpose: Handles the connection to the MongoDB database using Mongoose.
 * Centralizes the connection logic outside of the main server file.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect using the MONGODB_URI environment variable
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit the Node process with failure code if DB connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
