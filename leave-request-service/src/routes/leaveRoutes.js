const express = require('express');
const { applyLeave, listByUserId } = require('../controllers/leaveController');
const authMiddleware = require('../../../shared/middleware/authMiddleware');
const roleMiddleware = require('../../../shared/middleware/roleMiddleware');
const selfOrManagerMiddleware = require('../middleware/selfOrManagerMiddleware');

const router = express.Router();

router.use(authMiddleware);

const RESERVED_USER_IDS = new Set(['apply']);

router.post(
    '/apply',
    roleMiddleware(['EMPLOYEE', 'MANAGER']),
    selfOrManagerMiddleware((req) => req.body?.userId),
    applyLeave
);

router.get(
    '/:userId',
    (req, res, next) => {
        if (RESERVED_USER_IDS.has(req.params.userId)) {
            const err = new Error('Not found');
            err.status = 404;
            return next(err);
        }
        next();
    },
    roleMiddleware(['EMPLOYEE', 'MANAGER']),
    selfOrManagerMiddleware((req) => req.params.userId),
    listByUserId
);

module.exports = router;
