const approvalService = require('../services/approvalService');

const createApproval = async (req, res, next) => {
  try {
    const approval = await approvalService.createApproval(req.body);

    return res.status(201).json({
      message: 'Approval created successfully',
      data: approval
    });
  } catch (error) {
    console.error('createApproval error:', error);
    return next(error);
  }
};

const getAllApprovals = async (req, res, next) => {
  try {
    const approvals = await approvalService.getAllApprovals();

    return res.status(200).json({
      message: 'Approvals fetched successfully',
      data: approvals
    });
  } catch (error) {
    console.error('getAllApprovals error:', error);
    return next(error);
  }
};

const getApprovalById = async (req, res, next) => {
  try {
    const approval = await approvalService.getApprovalById(req.params.id);

    if (!approval) {
      return res.status(404).json({
        message: 'Approval not found'
      });
    }

    return res.status(200).json({
      message: 'Approval fetched successfully',
      data: approval
    });
  } catch (error) {
    console.error('getApprovalById error:', error);
    return next(error);
  }
};

const getPendingApprovals = async (req, res, next) => {
  try {
    const approvals = await approvalService.getPendingApprovals();

    return res.status(200).json({
      message: 'Pending approvals fetched successfully',
      data: approvals
    });
  } catch (error) {
    console.error('getPendingApprovals error:', error);
    return next(error);
  }
};

const updateApproval = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const approval = await approvalService.updateApproval(req.params.id, req.body, token);

    if (!approval) {
      return res.status(404).json({
        message: 'Approval not found'
      });
    }

    return res.status(200).json({
      message: 'Approval updated successfully',
      data: approval
    });
  } catch (error) {
    console.error('updateApproval error:', error);
    return next(error);
  }
};

const deleteApproval = async (req, res, next) => {
  try {
    const result = await approvalService.deleteApproval(req.params.id);

    if (!result) {
      return res.status(404).json({
        message: 'Approval not found'
      });
    }

    return res.status(200).json({
      message: 'Approval deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('deleteApproval error:', error);
    return next(error);
  }
};

module.exports = {
  createApproval,
  getAllApprovals,
  getApprovalById,
  getPendingApprovals,
  updateApproval,
  deleteApproval
};