const express = require('express');
const router = express.Router();
const {
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment,
    assignUser,
    getDepartmentUsers
} = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes (authenticated)
router.use(authMiddleware);

router.get('/', getDepartments);
router.get('/:id', getDepartment);
router.get('/:id/users', getDepartmentUsers);

// Protected routes (MANAGER only)
router.post('/', roleMiddleware(['MANAGER']), createDepartment);
router.put('/:id', roleMiddleware(['MANAGER']), updateDepartment);
router.delete('/:id', roleMiddleware(['MANAGER']), deleteDepartment);
router.put('/:id/assign-user/:userId', roleMiddleware(['MANAGER']), assignUser);

module.exports = router;
