const leaveService = require('../services/leaveService');

exports.applyLeave = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const doc = await leaveService.applyLeave(req.body, token);
        res.status(201).json({ success: true, data: doc });
    } catch (error) {
        if (error.status) {
            res.status(error.status);
        }
        next(error);
    }
};

exports.listByUserId = async (req, res, next) => {
    try {
        const items = await leaveService.listLeaveRequestsByUserId(req.params.userId);
        res.status(200).json({ success: true, count: items.length, leaves: items });
    } catch (error) {
        if (error.status) {
            res.status(error.status);
        }
        next(error);
    }
};

exports.cancelLeave = async (req, res, next) => {
    try {
        const { leaveId } = req.params;
        const { id: userId, role } = req.user;
        const doc = await leaveService.cancelLeave(leaveId, userId, role);
        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        if (error.status) {
            res.status(error.status);
        }
        next(error);
    }
};

exports.updateLeave = async (req, res, next) => {
    try {
        const { leaveId } = req.params;
        const { id: userId, role } = req.user;
        const doc = await leaveService.updateLeave(leaveId, req.body, userId, role);
        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        if (error.status) {
            res.status(error.status);
        }
        next(error);
    }
};

exports.deleteLeave = async (req, res, next) => {
    try {
        const { leaveId } = req.params;
        const { id: userId, role } = req.user;
        const result = await leaveService.deleteLeave(leaveId, userId, role);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        if (error.status) {
            res.status(error.status);
        }
        next(error);
    }
};

exports.updateLeaveStatus = async (req, res, next) => {
    try {
        const { leaveId } = req.params;
        const { status, approvedBy } = req.body;
        const doc = await leaveService.updateLeaveStatus(leaveId, status, approvedBy);
        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        if (error.status) {
            res.status(error.status);
        }
        next(error);
    }
};
