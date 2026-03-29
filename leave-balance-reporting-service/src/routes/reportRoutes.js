/**
 * File: reportRoutes.js
 * Purpose: Defines and routes HTTP endpoints for reporting.
 * Connects the raw request path to the specific report controller execution.
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/authMiddleware');

// 1. GET /api/reports/user/:userId
// Any logged in user can view their history
router.get('/user/:userId', protect, reportController.getUserLeaveReport);

// 2. GET /api/reports/monthly/:userId
// Only Managers/Admins can view monthly aggregations
router.get('/monthly/:userId', protect, authorize('Manager', 'Admin'), reportController.getMonthlyUsageSummary);

// 3. GET /api/reports/top-leave-users
// Only Managers/Admins can view the global leaderboard
router.get('/top-leave-users', protect, authorize('Manager', 'Admin'), reportController.getTopLeaveUsers);

module.exports = router;
