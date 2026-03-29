const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Policy name is required'],
        trim: true
    },
    employmentType: {
        type: String,
        required: [true, 'Employment type is required'],
        enum: {
            values: ['INTERN', 'CONTRACT', 'PERMANENT'],
            message: '{VALUE} is not a valid employment type'
        }
    },
    leaveQuota: {
        annual: {
            type: Number,
            default: 0
        },
        sick: {
            type: Number,
            default: 0
        },
        casual: {
            type: Number,
            default: 0
        }
    },
    maxConsecutiveDays: {
        type: Number,
        default: 5
    },
    carryForward: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);
