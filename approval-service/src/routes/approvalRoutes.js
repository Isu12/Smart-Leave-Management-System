const express = require('express');
const controller = require('../controllers/approvalController');

const router = express.Router();

router.get('/pending', controller.getPendingApprovals);
router.post('/', controller.createApproval);
router.get('/', controller.getAllApprovals);
router.get('/:id', controller.getApprovalById);
router.put('/:id', controller.updateApproval);
router.delete('/:id', controller.deleteApproval);

module.exports = router;
