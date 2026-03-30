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

  // Initialize balances per leave type
  const balances = data.balances || {
    annual: { allocated: 0, used: 0, remaining: 0 },
    sick: { allocated: 0, used: 0, remaining: 0 },
    casual: { allocated: 0, used: 0, remaining: 0 }
  };

  // Ensure remaining is calculated correctly
  for (const type of ['annual', 'sick', 'casual']) {
    if (balances[type]) {
      balances[type].remaining = (balances[type].allocated || 0) - (balances[type].used || 0);
    }
  }

  const newBalance = new LeaveBalance({
    userId: data.userId,
    employeeName: data.employeeName,
    department: data.department,
    role: data.role,
    balances
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

  // Step C: Check if they have enough leaves left for the specific type
  const type = (data.leaveType || '').toLowerCase();
  
  // Basic validation that the type exists
  if (!['annual', 'sick', 'casual'].includes(type) || !balance.balances || !balance.balances[type]) {
    throw new Error(`Invalid or unsupported leave type: ${data.leaveType}`);
  }

  if (balance.balances[type].remaining < data.numberOfDays) {
    throw new Error(`Not enough remaining ${data.leaveType} leave balance`);
  }

  // Step D: Do the math explicitly for the specific leave type
  balance.balances[type].used += data.numberOfDays;
  balance.balances[type].remaining = balance.balances[type].allocated - balance.balances[type].used;
  
  // Tell mongoose the nested object changed
  balance.markModified('balances');

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

// 5. Update Balance (e.g., admin giving more total allocated leaves or handling deductions)
const updateBalance = async (userId, updateData) => {
  const balance = await LeaveBalance.findOne({ userId });
  if (!balance) throw new Error('Leave balance not found');

  // Update provided fields
  if (updateData.employeeName !== undefined) balance.employeeName = updateData.employeeName;

  // Handle deduction explicitly
  if (updateData.action === 'DEDUCT') {
    const type = (updateData.leaveType || '').toLowerCase();
    
    if (!['annual', 'sick', 'casual'].includes(type) || !balance.balances || !balance.balances[type]) {
      throw new Error(`Invalid or unsupported leave type: ${updateData.leaveType}`);
    }

    if (balance.balances[type].remaining < updateData.deductedDays) {
      throw new Error(`Not enough remaining ${updateData.leaveType} leave balance`);
    }

    balance.balances[type].used += updateData.deductedDays;
  }

  // Handle admin overriding entire balances
  if (updateData.balances) {
    for (const type of ['annual', 'sick', 'casual']) {
       if (updateData.balances[type]) {
         if (updateData.balances[type].allocated !== undefined) {
           balance.balances[type].allocated = updateData.balances[type].allocated;
         }
         if (updateData.balances[type].used !== undefined) {
           balance.balances[type].used = updateData.balances[type].used;
         }
       }
    }
  }

  // Recalculate remaining leave explicitly again!
  for (const type of ['annual', 'sick', 'casual']) {
    if (balance.balances[type]) {
      balance.balances[type].remaining = balance.balances[type].allocated - balance.balances[type].used;
      if (balance.balances[type].remaining < 0) {
        throw new Error(`Remaining ${type} leave cannot be negative`);
      }
    }
  }
  
  // Inform mongoose that the nested objects have changed
  balance.markModified('balances');

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
