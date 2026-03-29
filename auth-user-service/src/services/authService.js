const User = require('../models/User');
const LeavePolicy = require('../models/LeavePolicy');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { checkApprovedLeave } = require('./leaveService');

const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasUpperCase && hasNumber && hasSpecialChar;
};

/**
 * Shared account creation logic used by both self-registration and manager-created users.
 * @param {object} userData - { name, email, password, role?, employmentType }
 * @param {string} [forcedRole] - When supplied, overrides any role in userData.
 */
exports.createUserAccount = async (userData, forcedRole) => {
    const { name, email, password, employmentType } = userData;
    const role = forcedRole || 'EMPLOYEE';

    if (!employmentType) {
        throw new Error('Employment type is required');
    }

    if (!validatePassword(password)) {
        throw new Error('Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    // Find LeavePolicy based on employmentType
    const policy = await LeavePolicy.findOne({ employmentType });
    if (!policy) {
        throw new Error(`No leave policy found for employment type: ${employmentType}. Please create a policy first.`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        employmentType,
        leavePolicyId: policy._id
    });

    await user.save();

    // Initialize Leave Balance (Requirement #5)
    try {
        const balanceServiceUrl = process.env.LEAVE_BALANCE_SERVICE_URL || 'http://localhost:5001';
        await axios.post(`${balanceServiceUrl}/api/balance/init`, {
            userId: user._id,
            leaveQuota: policy.leaveQuota
        });
        console.log(`Initialized leave balance for user: ${user._id}`);
    } catch (error) {
        console.error(`Warning: Failed to initialize leave balance for user ${user._id}: ${error.message}. Continuing...`);
        // Proceeding as user creation is successful (simulated or optional initialization)
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employmentType: user.employmentType,
        leavePolicyId: user.leavePolicyId
    };
};

/**
 * Public self-registration – role is always EMPLOYEE regardless of request body.
 */
exports.registerUser = async (userData) => {
    return exports.createUserAccount(userData, 'EMPLOYEE');
};

exports.loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
        throw new Error('Invalid credentials or user is inactive');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Leave-Aware Login Check
    const isOnLeave = await checkApprovedLeave(user._id);
    if (isOnLeave) {
        throw new Error('Access denied. You are on leave');
    }

    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    const payload = {
        id: user._id,
        role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, lastLogin: user.lastLogin, loginCount: user.loginCount } };
};
