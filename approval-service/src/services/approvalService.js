const Approval = require('../models/Approval');
const {
  getLeaveById,
  updateLeaveStatus,
  getUserById,
  updateUserLeaveBalance,
  updateBalanceService
} = require('./externalServices');

const hasDateOverlap = (existingStart, existingEnd, newStart, newEnd) => {
  return new Date(newStart) <= new Date(existingEnd) && new Date(newEnd) >= new Date(existingStart);
};

const validateApprovalRules = async (approvalData) => {
  const user = await getUserById(approvalData.userId);
  const leave = await getLeaveById(approvalData.leaveId);

  // Do NOT crash if services are down (important for demo)
  if (!user) {
    console.warn('User validation skipped (service unavailable)');
  }

  if (!leave) {
    console.warn('Leave validation skipped (service unavailable)');
  }

  if (leave && leave.status && leave.status !== 'PENDING') {
    throw new Error(`Leave request is already ${leave.status}`);
  }

  const userBalance = user?.leaveBalance ?? 0;

  if (approvalData.status === 'APPROVED' && user && userBalance < approvalData.totalDays) {
    throw new Error('Insufficient leave balance for approval');
  }

  return { user, leave };
};

const createApproval = async (approvalData) => {
  const fs = require('fs');
  const logFile = 'd:\\MTIT assignment 2\\Smart-Leave-Management-System\\debug.log';
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] [APPROVAL-SERVICE] Received createApproval for leave ${approvalData.leaveId}\n`);
  try {
    await validateApprovalRules(approvalData);
    const approval = await Approval.create(approvalData);
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] [APPROVAL-SERVICE] Successfully created approval ${approval._id}\n`);
    return approval;
  } catch (err) {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] [APPROVAL-SERVICE] Failed to create approval: ${err.message}\n`);
    throw err;
  }
};

const getAllApprovals = async () =>
  Approval.find().sort({ createdAt: -1 });

const getApprovalById = async (id) => {
  const approval = await Approval.findById(id);
  if (!approval) throw new Error('Approval not found');
  return approval;
};

const getPendingApprovals = async () =>
  Approval.find({ status: 'PENDING' }).sort({ createdAt: -1 });

const updateApproval = async (id, updateData, token) => {
  const existingApproval = await Approval.findById(id);
  if (!existingApproval) throw new Error('Approval not found');

  const nextStatus = updateData.status || existingApproval.status;

  if (
    existingApproval.status !== 'PENDING' &&
    updateData.status &&
    updateData.status !== existingApproval.status
  ) {
    throw new Error('Only pending approvals can be changed');
  }

  if (nextStatus === 'APPROVED') {
    const { user } = await validateApprovalRules({
      ...existingApproval.toObject(),
      ...updateData,
      status: 'APPROVED'
    });

    const newBalance = (user?.leaveBalance ?? 0) - existingApproval.totalDays;

    await updateLeaveStatus(existingApproval.leaveId, {
      status: 'APPROVED',
      approvedBy: existingApproval.approverId
    }, token);

    if (user) {
      await updateUserLeaveBalance(existingApproval.userId, {
        leaveBalance: newBalance
      }, token);
    }

    await updateBalanceService(existingApproval.userId, {
      deductedDays: existingApproval.totalDays,
      leaveType: existingApproval.leaveType,
      action: 'DEDUCT'
    }, token);

    existingApproval.status = 'APPROVED';
    existingApproval.reviewedAt = new Date();
    existingApproval.comment = updateData.comment ?? existingApproval.comment;
  } 
  else if (nextStatus === 'REJECTED') {
    await updateLeaveStatus(existingApproval.leaveId, {
      status: 'REJECTED',
      approvedBy: existingApproval.approverId
    }, token);

    existingApproval.status = 'REJECTED';
    existingApproval.reviewedAt = new Date();
    existingApproval.comment = updateData.comment ?? existingApproval.comment;
  } 
  else {
    Object.assign(existingApproval, updateData);
  }

  await existingApproval.save();
  return existingApproval;
};

const deleteApproval = async (id) => {
  const approval = await Approval.findById(id);
  if (!approval) throw new Error('Approval not found');

  await approval.deleteOne();
  return { message: 'Approval deleted successfully' };
};

module.exports = {
  createApproval,
  getAllApprovals,
  getApprovalById,
  getPendingApprovals,
  updateApproval,
  deleteApproval,
  hasDateOverlap
};