/**
 * File: LeaveBalance.js
 * Purpose: Mongoose model for storing leave balances safely.
 */

const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  employeeName: { type: String, required: true },
  
  // Balances tracked per leave type
  balances: {
    annual: {
      allocated: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    },
    sick: {
      allocated: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    },
    casual: {
      allocated: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    }
  },
  
  department: { type: String },
  role: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
