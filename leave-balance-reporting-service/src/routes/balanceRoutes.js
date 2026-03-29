/**
 * File: balanceRoutes.js
 * Purpose: Defines and routes HTTP endpoints regarding leave balances.
 * Maps endpoints like /api/balance/ to the appropriate controller functions.
 */

const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');

const { protect, authorize } = require('../middleware/authMiddleware');

// CREATE a new leave balance (Admin/Manager only)
router.post('/', protect, authorize('Manager', 'Admin'), balanceController.createBalance);

// DEDUCT leave (Usually an internal service call, protected by Manager or Admin logic)
router.post('/deduct', protect, authorize('Manager', 'Admin', 'Service'), balanceController.deductLeave);

// GET all leave balances (Managers/Admins only)
router.get('/', protect, authorize('Manager', 'Admin'), balanceController.getAllBalances);

// GET a specific user's leave balance (Anyone logged in can check their own)
router.get('/:userId', protect, balanceController.getBalanceByUserId);

// UPDATE a user's leave balance (Admin/Manager only)
router.put('/:userId', protect, authorize('Manager', 'Admin'), balanceController.updateBalance);

// DELETE a user's leave balance (Admin/Manager only)
router.delete('/:userId', protect, authorize('Manager', 'Admin'), balanceController.deleteBalance);

module.exports = router;
