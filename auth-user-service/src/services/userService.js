const User = require('../models/User');
const { createUserAccount } = require('./authService');

/**
 * Manager-only: create a user account with an explicit role.
 * Uses the same validation + password hashing as self-registration.
 * If no role is provided, defaults to EMPLOYEE.
 */
exports.createUser = async (userData) => {
    const allowedRole = ['EMPLOYEE', 'MANAGER'].includes(userData.role) ? userData.role : 'EMPLOYEE';
    return await createUserAccount(userData, allowedRole);
};

exports.getUsers = async () => {
    return await User.find({ isActive: true }).select('-password');
};

exports.getUserById = async (id) => {
    return await User.findById(id).select('-password');
};

exports.updateUser = async (id, updateData) => {
    // Prevent password update via generic PUT
    if (updateData.password) {
        delete updateData.password;
    }

    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
};

exports.softDeleteUser = async (id) => {
    return await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
