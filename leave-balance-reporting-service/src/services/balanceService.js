/**
 * File: balanceService.js
 * Purpose: All business rules live here. It keeps the controllers thin and clean.
 */

const LeaveBalance = require('../models/LeaveBalance');
const LeaveUsageLog = require('../models/LeaveUsageLog');

// 1. Create a new balance
const createBalance = async (data) => {
  // Check if balance already exists
  const existingBalance = await LeaveBalance.findOne({ userId: data.userId });
  if (existingBalance) {
    throw new Error('Leave balance already exists for this user');
  }

  // Explicit Math: Calculate remaining leave clearly
  const remainingLeave = data.totalAllocated - data.usedLeave;

  const newBalance = new LeaveBalance({
    ...data,
    remainingLeave: remainingLeave
  });

  return await newBalance.save();
};

// 2. Deduct leave when approved
const deductLeave = async (data) => {
  // Step A: Check if we already deducted this exact request (prevents duplicate bugs)
  const existingLog = await LeaveUsageLog.findOne({ leaveRequestId: data.leaveRequestId });
  if (existingLog) {
    throw new Error('This leave request was already deducted');
  }

  // Step B: Find the user's balance
  const balance = await LeaveBalance.findOne({ userId: data.userId });
  if (!balance) {
    throw new Error('Leave balance not found for user');
  }

  // Step C: Check if they have enough leaves left
  if (balance.remainingLeave < data.numberOfDays) {
    throw new Error('Not enough remaining leave balance');
  }

  // Step D: Do the math explicitly (Easy to explain in a Viva)
  balance.usedLeave = balance.usedLeave + data.numberOfDays;
  balance.remainingLeave = balance.totalAllocated - balance.usedLeave;

  // Step E: Extract the string '03' and number '2026' from the startDate "2026-03-10"
  const startDateObj = new Date(data.startDate);
  const monthString = String(startDateObj.getMonth() + 1).padStart(2, '0');
  const yearNumber = startDateObj.getFullYear();

  // Step F: Create the history log
  const usageLog = new LeaveUsageLog({
    userId: data.userId,
    employeeName: data.employeeName,
    leaveRequestId: data.leaveRequestId,
    leaveType: data.leaveType,
    startDate: data.startDate,
    endDate: data.endDate,
    numberOfDays: data.numberOfDays,
    approvedBy: data.approvedBy,
    approvedDate: data.approvedDate,
    month: monthString,
    year: yearNumber
  });

  // Save both the updated balance and the new log
  await usageLog.save();
  await balance.save();

  return { balance, usageLog };
};

// 3. Get all balances
const getAllBalances = async () => {
  return await LeaveBalance.find();
};

// 4. Get by User ID
const getBalanceByUserId = async (userId) => {
  const balance = await LeaveBalance.findOne({ userId });
  if (!balance) throw new Error('Leave balance not found');
  return balance;
};

// 5. Update Balance (e.g., admin giving more total allocated leaves)
const updateBalance = async (userId, updateData) => {
  const balance = await LeaveBalance.findOne({ userId });
  if (!balance) throw new Error('Leave balance not found');

  // Update provided fields
  if (updateData.totalAllocated !== undefined) balance.totalAllocated = updateData.totalAllocated;
  if (updateData.usedLeave !== undefined) balance.usedLeave = updateData.usedLeave;
  if (updateData.employeeName !== undefined) balance.employeeName = updateData.employeeName;

  // Recalculate remaining leave explicitly again!
  balance.remainingLeave = balance.totalAllocated - balance.usedLeave;
  if (balance.remainingLeave < 0) throw new Error('Remaining leave cannot be negative');

  return await balance.save();
};

const deleteBalance = async (userId) => {
  const deleted = await LeaveBalance.findOneAndDelete({ userId });
  if (!deleted) throw new Error('Leave balance not found');
  return deleted;
};

// Export simple functions instead of classes to make it easier to read
module.exports = {
  createBalance,
  deductLeave,
  getAllBalances,
  getBalanceByUserId,
  updateBalance,
  deleteBalance
};
