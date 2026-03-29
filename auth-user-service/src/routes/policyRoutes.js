const express = require('express');
const { 
    createPolicy, 
    getPolicies, 
    getPolicyById, 
    updatePolicy, 
    deletePolicy 
} = require('../controllers/policyController');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const roleMiddleware = require('../../../shared/middleware/roleMiddleware');

const router = express.Router();

// All policy routes require authentication and MANAGER role
router.use(authMiddleware);
router.use(roleMiddleware(['MANAGER']));

router.route('/')
    .get(getPolicies)
    .post(createPolicy);

router.route('/:id')
    .get(getPolicyById)
    .put(updatePolicy)
    .delete(deletePolicy);

module.exports = router;
