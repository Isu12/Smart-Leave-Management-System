const LeavePolicy = require('../models/LeavePolicy');

// @desc    Create new leave policy
// @route   POST /api/policies
// @access  Private (Manager/Admin)
exports.createPolicy = async (req, res, next) => {
    try {
        const policy = await LeavePolicy.create(req.body);
        res.status(201).json({
            success: true,
            data: policy
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all leave policies
// @route   GET /api/policies
// @access  Private (Manager/Admin)
exports.getPolicies = async (req, res, next) => {
    try {
        const policies = await LeavePolicy.find();
        res.status(200).json({
            success: true,
            count: policies.length,
            data: policies
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single leave policy
// @route   GET /api/policies/:id
// @access  Private (Manager/Admin)
exports.getPolicyById = async (req, res, next) => {
    try {
        const policy = await LeavePolicy.findById(req.params.id);
        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'Policy not found'
            });
        }
        res.status(200).json({
            success: true,
            data: policy
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update leave policy
// @route   PUT /api/policies/:id
// @access  Private (Manager/Admin)
exports.updatePolicy = async (req, res, next) => {
    try {
        const policy = await LeavePolicy.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'Policy not found'
            });
        }
        res.status(200).json({
            success: true,
            data: policy
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete leave policy
// @route   DELETE /api/policies/:id
// @access  Private (Manager/Admin)
exports.deletePolicy = async (req, res, next) => {
    try {
        const policy = await LeavePolicy.findByIdAndDelete(req.params.id);
        if (!policy) {
            return res.status(404).json({
                success: false,
                error: 'Policy not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
