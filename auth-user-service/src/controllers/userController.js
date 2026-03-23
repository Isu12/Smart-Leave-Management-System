const userService = require('../services/userService');

exports.createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, user });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500);
        next(error);
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400);
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await userService.softDeleteUser(req.params.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.status(200).json({ success: true, message: 'User deleted (soft)' });
    } catch (error) {
        res.status(400);
        next(error);
    }
};
