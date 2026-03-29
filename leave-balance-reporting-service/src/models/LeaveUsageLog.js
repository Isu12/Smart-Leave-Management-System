/**
 * File: LeaveUsageLog.js
 * Purpose: Mongoose model representing the Leave Usage Log.
 * Stores a historical record of all approved leave days deducted from a user's balance.
 * Helpful for reporting on leave taken within specific months/years.
 */

const mongoose = require('mongoose');

const leaveUsageLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required']
  },
  leaveRequestId: {
    type: String,
    required: [true, 'Leave Request ID (from Approval Service) is required']
  },
  leaveType: {
    type: String,
    required: [true, 'Leave type is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  numberOfDays: {
    type: Number,
    required: [true, 'Number of days is required'],
    min: [0.5, 'Number of days must be at least half a day']
  },
  approvedBy: {
    type: String
    // Optional field (could be Name or ID of the manager)
  },
  approvedDate: {
    type: Date,
    required: [true, 'Approved date is required']
  },
  month: {
    type: String,
    required: [true, 'Month is required'] // Useful for simple reporting queries
  },
  year: {
    type: Number,
    required: [true, 'Year is required'] // Useful for simple reporting queries
  }
}, { 
  timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
});

module.exports = mongoose.model('LeaveUsageLog', leaveUsageLogSchema);
