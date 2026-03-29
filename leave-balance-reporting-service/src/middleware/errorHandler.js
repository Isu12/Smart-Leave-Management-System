/**
 * File: errorHandler.js
 * Purpose: Global error handling middleware for the Express application.
 * Captures thrown exceptions and formats them into a standard, clean JSON response.
 */

const errorHandler = (err, req, res, next) => {
  // Log the exact error stack for debugging purposes in the console
  console.error(err.stack); 

  // Fast-fail: If the status code was never set by controllers (meaning it defaults to 200),
  // force it to a 500 Internal Server Error. Otherwise, use the custom status code.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    // In a production app, you might hide the stack trace. 
    // Kept here for student-friendly debugging insights.
    stack: process.env.NODE_ENV === 'production' ? null : err.stack 
  });
};

module.exports = errorHandler;
