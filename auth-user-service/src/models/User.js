const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['EMPLOYEE', 'MANAGER'], default: 'EMPLOYEE' },
    employmentType: { 
        type: String, 
        enum: ['INTERN', 'CONTRACT', 'PERMANENT'], 
        required: [true, 'Employment type is required'] 
    },
    leavePolicyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'LeavePolicy' 
    },
    departmentId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    loginCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
