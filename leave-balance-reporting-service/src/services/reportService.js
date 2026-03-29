/**
 * File: reportService.js
 * Purpose: Contains the logic for generating reports.
 */

const LeaveBalance = require('../models/LeaveBalance');
const LeaveUsageLog = require('../models/LeaveUsageLog');

// 1. Get user balance and historical logs
const getUserLeaveReport = async (userId) => {
  const balance = await LeaveBalance.findOne({ userId });
  if (!balance) throw new Error('Leave balance not found');

  // Find all logs, sorted by start date (newest first)
  const history = await LeaveUsageLog.find({ userId }).sort({ startDate: -1 });

  return { balance, history };
};

// 2. Get monthly usage summary (Using a simple DB Aggregate)
const getMonthlyUsageSummary = async (userId) => {
  // Aggregate is a MongoDB feature that groups data together.
  // Step A: Match only this user's logs
  // Step B: Group the logs by their 'year' and 'month' fields
  // Step C: Calculate the sum of 'numberOfDays' in that group
  const rawSummary = await LeaveUsageLog.aggregate([
    { $match: { userId: userId } },
    { 
      $group: {
        _id: { year: "$year", month: "$month" },
        totalDaysTaken: { $sum: "$numberOfDays" },
        leaveCount: { $sum: 1 } 
      }
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } } 
  ]);

  // Clean up the formatting for the response
  const summary = rawSummary.map(item => ({
    year: item._id.year,
    month: item._id.month,
    totalDaysTaken: item.totalDaysTaken,
    totalRequestsMade: item.leaveCount
  }));

  return { userId, summary };
};

// 3. Get Top Leave Users Leaderboard
const getTopLeaveUsers = async (limitNum) => {
  // Simple MongoDB sort logic: -1 means descending (highest first)
  const topUsers = await LeaveBalance.find()
    .sort({ usedLeave: -1 })
    .limit(limitNum)
    .select('userId employeeName totalAllocated usedLeave remainingLeave'); 

  return topUsers;
};

module.exports = {
  getUserLeaveReport,
  getMonthlyUsageSummary,
  getTopLeaveUsers
};
