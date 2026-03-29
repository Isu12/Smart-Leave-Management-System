const express = require('express');
const controller = require('../controllers/approvalController');
const roleMiddleware = require('../../../shared/middleware/roleMiddleware');
const authMiddleware = require('../../../shared/middleware/authMiddleware');

const router = express.Router();

// All approval routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     ApprovalInput:
 *       type: object
 *       properties:
 *         leaveId:
 *           type: string
 *         userId:
 *           type: string
 *         approverId:
 *           type: string
 *         leaveType:
 *           type: string
 *           enum: [ANNUAL, CASUAL, MEDICAL, UNPAID]
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         totalDays:
 *           type: number
 *         reason:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         comment:
 *           type: string
 */

/**
 * @swagger
 * /api/approvals/pending:
 *   get:
 *     summary: Get all pending approvals
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending approval list
 */
router.route('/pending')
    .get(roleMiddleware(['MANAGER']), controller.getPendingApprovals);

/**
 * @swagger
 * /api/approvals:
 *   post:
 *     summary: Create a new approval record (Managers only)
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApprovalInput'
 *     responses:
 *       201:
 *         description: Approval created successfully
 *   get:
 *     summary: Get all approvals
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of approvals
 */
router.route('/')
    .post(roleMiddleware(['MANAGER']), controller.createApproval)
    .get(roleMiddleware(['MANAGER', 'EMPLOYEE']), controller.getAllApprovals); // Example: both can view

/**
 * @swagger
 * /api/approvals/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: The approval record ID
 *   get:
 *     summary: Get approval by ID
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update approval decision (Managers only)
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, REJECTED]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *   delete:
 *     summary: Delete approval by ID (Managers only)
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully deleted
 */
router.route('/:id')
    .get(roleMiddleware(['MANAGER', 'EMPLOYEE']), controller.getApprovalById)
    .put(roleMiddleware(['MANAGER']), controller.updateApproval)
    .delete(roleMiddleware(['MANAGER']), controller.deleteApproval);

module.exports = router;
