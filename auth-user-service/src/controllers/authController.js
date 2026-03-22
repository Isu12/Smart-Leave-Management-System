const authService = require('../services/authService');

exports.register = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, user });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        if (error.message.includes('Access denied. You are on leave')) {
            res.status(403);
        } else {
            res.status(401);
        }
        next(error);
    }
};
