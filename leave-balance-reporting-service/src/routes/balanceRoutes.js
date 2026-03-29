/**
 * File: balanceRoutes.js
 * Purpose: Defines and routes HTTP endpoints regarding leave balances.
 * Maps endpoints like /api/balance/ to the appropriate controller functions.
 */

const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');

const { protect, authorize } = require('../middleware/authMiddleware');

// CREATE a new leave balance (Manager only)
router.post('/', protect, authorize('MANAGER'), balanceController.createBalance);

// DEDUCT leave (Manager only – triggered after approval)
router.post('/deduct', protect, authorize('MANAGER'), balanceController.deductLeave);

// GET all leave balances (Managers only)
router.get('/', protect, authorize('MANAGER'), balanceController.getAllBalances);

// GET a specific user's leave balance (Anyone logged in)
router.get('/:userId', protect, balanceController.getBalanceByUserId);

// UPDATE a user's leave balance (Manager only)
router.put('/:userId', protect, authorize('MANAGER'), balanceController.updateBalance);

// DELETE a user's leave balance (Manager only)
router.delete('/:userId', protect, authorize('MANAGER'), balanceController.deleteBalance);

module.exports = router;
