const User = require('../models/User');

exports.createUser = async (userData) => {
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) {
        throw new Error('User already exists');
    }

    const user = new User(userData);
    await user.save();
    return user;
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
