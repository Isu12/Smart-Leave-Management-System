const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema(
  {
    leaveId: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: String,
      required: true,
      trim: true
    },
    approverId: {
      type: String,
      trim: true
    },
    leaveType: {
      type: String,
      enum: ['ANNUAL', 'SICK', 'CASUAL', 'MATERNITY', 'MEDICAL', 'UNPAID', 'OTHER'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    comment: {
      type: String,
      default: ''
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Approval', approvalSchema);
