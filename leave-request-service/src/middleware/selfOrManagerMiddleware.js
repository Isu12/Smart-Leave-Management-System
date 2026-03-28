/**
 * EMPLOYEE may only act on their own userId; MANAGER may act on any user.
 * Use after authMiddleware + roleMiddleware.
 */
const selfOrManagerMiddleware = (getTargetUserId) => {
    return (req, res, next) => {
        if (req.user.role === 'MANAGER') {
            return next();
        }

        const target = getTargetUserId(req);
        if (target == null || (typeof target === 'string' && !target.trim())) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const normalized = String(target).trim();
        if (String(req.user.id) !== normalized) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }

        next();
    };
};

module.exports = selfOrManagerMiddleware;
