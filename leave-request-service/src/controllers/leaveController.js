const leaveService = require('../services/leaveService');

exports.applyLeave = async (req, res, next) => {
    try {
        const doc = await leaveService.applyLeave(req.body);
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
