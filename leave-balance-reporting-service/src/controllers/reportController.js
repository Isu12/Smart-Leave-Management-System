/**
 * File: reportController.js
 * Purpose: Thin controller for reports. Evaluates request and returns formatted JSON.
 */

const reportService = require('../services/reportService');

const getUserLeaveReport = async (req, res) => {
  try {
    const reportData = await reportService.getUserLeaveReport(req.params.userId);
    res.status(200).json({ success: true, message: 'User report generated', data: reportData });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

const getMonthlyUsageSummary = async (req, res) => {
  try {
    const summaryData = await reportService.getMonthlyUsageSummary(req.params.userId);
    res.status(200).json({ success: true, message: 'Monthly summary generated', data: summaryData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTopLeaveUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topUsers = await reportService.getTopLeaveUsers(limit);
    res.status(200).json({ success: true, message: 'Top users retrieved', data: topUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserLeaveReport,
  getMonthlyUsageSummary,
  getTopLeaveUsers
};
