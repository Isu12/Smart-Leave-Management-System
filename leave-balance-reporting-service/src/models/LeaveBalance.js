/**
 * File: LeaveBalance.js
 * Purpose: Mongoose model for storing leave balances safely.
 */

const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  employeeName: { type: String, required: true },
  totalAllocated: { type: Number, required: true, default: 14 },
  usedLeave: { type: Number, required: true, default: 0 },
  
  // We removed the advanced 'pre-save hook' here to make it simpler to explain.
  // Instead, we will calculate remainingLeave manually in the Service file using basic math:
  // remainingLeave = totalAllocated - usedLeave
  remainingLeave: { type: Number, required: true, min: 0 },
  
  department: { type: String },
  role: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
