const express = require('express');
const { createUser, getUsers, getUser, updateUser, deleteUser, updateDepartment, getUsersByDepartment } = require('../controllers/userController');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const roleMiddleware = require('../../../shared/middleware/roleMiddleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Only managers can create/delete or view all users generally in a robust RBAC,
// but based on requirements, we'll restrict Create, Delete, and Get All to MANAGERs.
// Employees can view and update their own profiles (we will just allow specific routes for MANAGER for simplicity).

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [EMPLOYEE, MANAGER]
 *         leaveBalance:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         loginCount:
 *           type: integer
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all active users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a user (Managers only)
 *     description: Creates a new user account. Managers may specify EMPLOYEE or MANAGER role. Defaults to EMPLOYEE if omitted. Password is validated and hashed using the same rules as self-registration.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Min 8 chars, must include uppercase, number and special character
 *               role:
 *                 type: string
 *                 enum: [EMPLOYEE, MANAGER]
 *                 description: Defaults to EMPLOYEE if not specified
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error or user already exists
 */
router.route('/')
    .post(roleMiddleware(['MANAGER']), createUser)
    .get(roleMiddleware(['MANAGER', 'EMPLOYEE']), getUsers); // Example: both can view

/**
 * @swagger
 * /users/{id}:
 *   parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: The user ID
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *   delete:
 *     summary: Soft delete user by ID (Managers only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully soft-deleted
 */
router.route('/:id')
    .get(roleMiddleware(['MANAGER', 'EMPLOYEE']), getUser)
    .put(roleMiddleware(['MANAGER']), updateUser)
    .delete(roleMiddleware(['MANAGER']), deleteUser);

// Department-related routes
router.put('/:id/department', roleMiddleware(['MANAGER']), updateDepartment);
router.get('/department/:departmentId', roleMiddleware(['MANAGER', 'EMPLOYEE']), getUsersByDepartment);

module.exports = router;
