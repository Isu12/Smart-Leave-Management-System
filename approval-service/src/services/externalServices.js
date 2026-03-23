const axios = require('axios');

const leaveClient = axios.create({
  baseURL: process.env.LEAVE_SERVICE_URL || 'http://localhost:5002',
  timeout: 5000
});

const userClient = axios.create({
  baseURL: process.env.AUTH_USER_SERVICE_URL || 'http://localhost:5001',
  timeout: 5000
});

const balanceClient = axios.create({
  baseURL: process.env.LEAVE_BALANCE_SERVICE_URL || 'http://localhost:5004',
  timeout: 5000
});

const getLeaveById = async (leaveId) => {
  try {
    const response = await leaveClient.get(`/api/leaves/${leaveId}`);
    return response.data;
  } catch (error) {
    console.warn(`Leave service unavailable or leave not found: ${leaveId}`);
    return null;
  }
};

const updateLeaveStatus = async (leaveId, payload) => {
  try {
    const response = await leaveClient.put(`/api/leaves/${leaveId}/status`, payload);
    return response.data;
  } catch (error) {
    console.warn(`Failed to update leave status: ${leaveId}`);
    return null;
  }
};

const getUserById = async (userId) => {
  try {
    const response = await userClient.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.warn(`User service unavailable or user not found: ${userId}`);
    return null;
  }
};

const updateUserLeaveBalance = async (userId, payload) => {
  try {
    const response = await userClient.put(`/api/users/${userId}`, payload);
    return response.data;
  } catch (error) {
    console.warn(`Failed to update user balance: ${userId}`);
    return null;
  }
};

const updateBalanceService = async (userId, payload) => {
  try {
    const response = await balanceClient.put(`/api/balance/${userId}`, payload);
    return response.data;
  } catch (error) {
    console.warn(`Balance service unavailable: ${userId}`);
    return null;
  }
};

module.exports = {
  getLeaveById,
  updateLeaveStatus,
  getUserById,
  updateUserLeaveBalance,
  updateBalanceService
};