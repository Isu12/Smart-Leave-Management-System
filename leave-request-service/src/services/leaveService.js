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

exports.applyLeave = async (body) => {
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

    return await LeaveRequest.create({
        userId: trimmedUserId,
        startDate: start,
        endDate: end,
        leaveType: leaveType || 'ANNUAL',
        reason: reason ?? '',
        numberOfDays: days,
        status: 'PENDING',
    });
};

exports.listLeaveRequestsByUserId = async (userId) => {
    if (!userId || typeof userId !== 'string') {
        throw validationError('userId is required');
    }

    return await LeaveRequest.find({ userId: userId.trim() })
        .sort({ startDate: -1 })
        .lean();
};
