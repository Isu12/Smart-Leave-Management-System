const axios = require('axios');

exports.checkApprovedLeave = async (userId) => {
    try {
        const leaveServiceUrl = process.env.LEAVE_SERVICE_URL || 'http://localhost:5001';
        const headers = {};
        if (process.env.LEAVE_SERVICE_API_KEY) {
            headers['X-Service-Key'] = process.env.LEAVE_SERVICE_API_KEY;
        }
        const response = await axios.get(`${leaveServiceUrl}/leaves/user/${userId}`, { headers });

        const payload = response.data;
        const leaves = Array.isArray(payload) ? payload : (payload.leaves || []);

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Check if user has an APPROVED leave for today's date
        const hasLeaveToday = leaves.some(leave => {
            // Assuming leave has status, startDate, endDate
            if (leave.status !== 'APPROVED') return false;

            const start = new Date(leave.startDate).toISOString().split('T')[0];
            const end = new Date(leave.endDate).toISOString().split('T')[0];

            return today >= start && today <= end;
        });

        return hasLeaveToday;
    } catch (error) {
        console.error(`Error communicating with Leave Service for user ${userId}:`, error.message);
        // If leave service is down, we choose not to block login (fail-open)
        // Could also throw an error to fail-closed depending on business requirements
        return false;
    }
};
