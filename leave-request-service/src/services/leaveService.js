const LeaveRequest = require('../models/LeaveRequest');
const { rangesOverlap, inclusiveCalendarDays } = require('../utils/dateOverlap');

function parseDateOnly(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

function validationError(message, status = 400) {
    const e = new Error(message);
    e.status = status;
    return e;
}

exports.applyLeave = async (body, token) => {
    const { userId, startDate, endDate, leaveType, reason } = body;

    if (!userId || typeof userId !== 'string') {
        throw validationError('userId is required');
    }

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (!start || !end) {
        throw validationError('startDate and endDate must be valid dates');
    }

    if (end < start) {
        throw validationError('endDate must be on or after startDate');
    }

    const days = inclusiveCalendarDays(start, end);
    const trimmedUserId = userId.trim();

    const blocking = await LeaveRequest.find({
        userId: trimmedUserId,
        status: { $in: ['PENDING', 'APPROVED'] },
    }).lean();

    const hasOverlap = blocking.some((row) =>
        rangesOverlap(start, end, row.startDate, row.endDate)
    );

    if (hasOverlap) {
        throw validationError(
            'Leave dates overlap an existing PENDING or APPROVED request for this user',
            409
        );
    }

    const leave = await LeaveRequest.create({
        userId: trimmedUserId,
        startDate: start,
        endDate: end,
        leaveType: leaveType || 'ANNUAL',
        reason: reason ?? '',
        numberOfDays: days,
        status: 'PENDING',
    });

    // Notify approval-service
    try {
        const axios = require('axios');
        const approvalUrl = process.env.APPROVAL_SERVICE_URL || 'http://localhost:5002';

        console.log(`[LEAVE-SERVICE] Sending notification to ${approvalUrl}/api/approvals for leave ${leave._id}`);

        await axios.post(`${approvalUrl}/api/approvals`, {
            leaveId: String(leave._id),
            userId: String(leave.userId),
            leaveType: leave.leaveType,
            startDate: leave.startDate,
            endDate: leave.endDate,
            totalDays: leave.numberOfDays,
            reason: leave.reason,
            status: 'PENDING'
        }, {
            headers: { Authorization: token },
            timeout: 5000 // Increase timeout
        });
        console.log(`[LEAVE-SERVICE] Successfully notified approval service for leave ${leave._id}`);
    } catch (err) {
        console.error(`[LEAVE-SERVICE] Failed to notify approval service for leave ${leave._id}:`, err.message);
        if (err.response) {
            console.error(`[LEAVE-SERVICE] Approval service error (${err.response.status}):`, JSON.stringify(err.response.data));
        }
    }

    return leave;
};

exports.listLeaveRequestsByUserId = async (userId) => {
    if (!userId || typeof userId !== 'string') {
        throw validationError('userId is required');
    }

    return await LeaveRequest.find({ userId: userId.trim() })
        .sort({ startDate: -1 })
        .lean();
};

exports.cancelLeave = async (leaveId, userId, role) => {
    if (!leaveId) {
        throw validationError('leaveId is required');
    }

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
        throw validationError('Leave request not found', 404);
    }

    // Role check: Only the owner or a MANAGER can cancel
    if (role !== 'MANAGER' && String(leave.userId) !== String(userId)) {
        throw validationError('Access denied: insufficient permissions', 403);
    }

    // Status check: Only PENDING can be cancelled
    if (leave.status !== 'PENDING') {
        throw validationError('Only pending leave requests can be cancelled', 400);
    }

    leave.status = 'CANCELLED';
    await leave.save();

    return leave;
};

exports.updateLeave = async (leaveId, body, userId, role) => {
    if (!leaveId) {
        throw validationError('leaveId is required');
    }

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
        throw validationError('Leave request not found', 404);
    }

    // Role check: Only the owner or a MANAGER can update
    if (role !== 'MANAGER' && String(leave.userId) !== String(userId)) {
        throw validationError('Access denied: insufficient permissions', 403);
    }

    // Status check: Only PENDING can be edited
    if (leave.status !== 'PENDING') {
        throw validationError('Only pending leave requests can be edited', 400);
    }

    const { startDate, endDate, leaveType, reason } = body;

    const start = startDate ? parseDateOnly(startDate) : leave.startDate;
    const end = endDate ? parseDateOnly(endDate) : leave.endDate;

    if (!start || !end) {
        throw validationError('startDate and endDate must be valid dates');
    }

    if (end < start) {
        throw validationError('endDate must be on or after startDate');
    }

    // Check overlaps (excluding this specific request)
    const blocking = await LeaveRequest.find({
        userId: leave.userId,
        _id: { $ne: leave._id },
        status: { $in: ['PENDING', 'APPROVED'] },
    }).lean();

    const hasOverlap = blocking.some((row) =>
        rangesOverlap(start, end, row.startDate, row.endDate)
    );

    if (hasOverlap) {
        throw validationError(
            'Updated leave dates overlap an existing PENDING or APPROVED request for this user',
            409
        );
    }

    const days = inclusiveCalendarDays(start, end);

    leave.startDate = start;
    leave.endDate = end;
    leave.leaveType = leaveType || leave.leaveType;
    leave.reason = reason ?? leave.reason;
    leave.numberOfDays = days;

    await leave.save();
    return leave;
};

exports.deleteLeave = async (leaveId, userId, role) => {
    if (!leaveId) {
        throw validationError('leaveId is required');
    }

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
        throw validationError('Leave request not found', 404);
    }

    // Role check: Only the owner or a MANAGER can delete
    if (role !== 'MANAGER' && String(leave.userId) !== String(userId)) {
        throw validationError('Access denied: insufficient permissions', 403);
    }

    // Status check: Only PENDING requests can be deleted
    // (Alternatively, we could allow deleting CANCELLED/REJECTED too)
    if (leave.status !== 'PENDING') {
        throw validationError('Only pending leave requests can be deleted', 400);
    }

    await LeaveRequest.findByIdAndDelete(leaveId);
    return { message: 'Leave request deleted successfully' };
};

exports.updateLeaveStatus = async (leaveId, status, approvedBy) => {
    if (!leaveId) {
        throw validationError('leaveId is required');
    }

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
        throw validationError('Leave request not found', 404);
    }

    if (status) {
        if (!['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
            throw validationError('Invalid status');
        }
        leave.status = status;
    }

    await leave.save();
    return leave;
};
