const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { checkApprovedLeave } = require('./leaveService');

const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return minLength && hasUpperCase && hasNumber && hasSpecialChar;
};

exports.registerUser = async (userData) => {
    const { name, email, password, role } = userData;

    if (!validatePassword(password)) {
        throw new Error('Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        email,
        password: hashedPassword,
        role
    });

    await user.save();
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };
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

    // 3. Leave-Aware Login Check
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
