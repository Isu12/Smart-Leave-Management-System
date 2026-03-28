/**
 * Compatibility route for Auth/User service: GET /leaves/user/:userId
 * Trusted callers may use X-Service-Key (SERVICE_API_KEY) instead of a user JWT.
 */
const express = require('express');
const { listByUserId } = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const selfOrManagerMiddleware = require('../middleware/selfOrManagerMiddleware');

const router = express.Router();

const serviceKeyAuth = (req, res, next) => {
    const key = process.env.SERVICE_API_KEY;
    if (key && req.get('X-Service-Key') === key) {
        req.serviceAuth = true;
        return next();
    }
    return authMiddleware(req, res, next);
};

router.get(
    '/user/:userId',
    serviceKeyAuth,
    (req, res, next) => {
        if (req.serviceAuth) {
            return next();
        }
        return roleMiddleware(['EMPLOYEE', 'MANAGER'])(req, res, next);
    },
    (req, res, next) => {
        if (req.serviceAuth) {
            return next();
        }
        return selfOrManagerMiddleware((r) => r.params.userId)(req, res, next);
    },
    listByUserId
);

module.exports = router;
