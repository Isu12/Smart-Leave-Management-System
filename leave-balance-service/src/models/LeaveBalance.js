/**
 * File: LeaveBalance.js
 * Purpose: Mongoose model representing the Leave Balance schema.
 * Defines the structure for storing leave allocations, usage, and remaining balance per user.
 */

const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  // Schema fields will go here
}, { timestamps: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
