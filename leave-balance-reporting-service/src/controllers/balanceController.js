/**
 * File: balanceController.js
 * Purpose: Thin controllers! It only extracts the request data, calls the Service, 
 * and formats the JSON response securely.
 */

const balanceService = require('../services/balanceService');

// Helper function to figure out the correct HTTP status code based on the error message
const getErrorStatusCode = (message) => {
  if (message.includes('not found')) return 404;
  if (message.includes('already exists') || message.includes('already deducted')) return 409;
  if (message.includes('Not enough') || message.includes('negative')) return 400;
  return 500;
};

const createBalance = async (req, res) => {
  try {
    const data = req.body;
    if (!data.userId || !data.employeeName) {
      return res.status(400).json({ success: false, message: 'Missing userId or employeeName' });
    }

    const newBalance = await balanceService.createBalance(data);
    res.status(201).json({ success: true, message: 'Balance created', data: newBalance });
  } catch (error) {
    res.status(getErrorStatusCode(error.message)).json({ success: false, message: error.message });
  }
};

const deductLeave = async (req, res) => {
  try {
    const data = req.body;
    if (!data.userId || !data.leaveRequestId || !data.numberOfDays || !data.startDate || !data.leaveType) {
      return res.status(400).json({ success: false, message: 'Missing required deduction fields' });
    }

    const result = await balanceService.deductLeave(data);
    res.status(200).json({ success: true, message: 'Leave successfully deducted', data: result });
  } catch (error) {
    res.status(getErrorStatusCode(error.message)).json({ success: false, message: error.message });
  }
};

const getAllBalances = async (req, res) => {
  try {
    const balances = await balanceService.getAllBalances();
    res.status(200).json({ success: true, message: 'Retrieved all balances', data: balances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBalanceByUserId = async (req, res) => {
  try {
    const balance = await balanceService.getBalanceByUserId(req.params.userId);
    res.status(200).json({ success: true, message: 'Balance found', data: balance });
  } catch (error) {
    res.status(getErrorStatusCode(error.message)).json({ success: false, message: error.message });
  }
};

const updateBalance = async (req, res) => {
  try {
    const updatedBalance = await balanceService.updateBalance(req.params.userId, req.body);
    res.status(200).json({ success: true, message: 'Balance updated', data: updatedBalance });
  } catch (error) {
    res.status(getErrorStatusCode(error.message)).json({ success: false, message: error.message });
  }
};

const deleteBalance = async (req, res) => {
  try {
    await balanceService.deleteBalance(req.params.userId);
    res.status(200).json({ success: true, message: 'Balance deleted safely' });
  } catch (error) {
    res.status(getErrorStatusCode(error.message)).json({ success: false, message: error.message });
  }
};

// Exporting functions
module.exports = {
  createBalance,
  deductLeave,
  getAllBalances,
  getBalanceByUserId,
  updateBalance,
  deleteBalance
};
