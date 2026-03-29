const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const LeavePolicy = require('./src/models/LeavePolicy');
const User = require('./src/models/User');
const authService = require('./src/services/authService');

const fs = require('fs');

const reportFile = path.join(__dirname, 'verify_results.txt');
const log = (msg) => {
    fs.appendFileSync(reportFile, msg + '\n');
    console.log(msg);
};

if (fs.existsSync(reportFile)) fs.unlinkSync(reportFile);

const verifyFeature = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        log('Connected to MongoDB');

        // 1. Create a Leave Policy
        log('--- 1. Creating Leave Policy ---');
        const policyData = {
            name: 'Standard Intern Policy',
            employmentType: 'INTERN',
            leaveQuota: {
                annual: 5,
                sick: 3,
                casual: 2
            },
            maxConsecutiveDays: 3,
            carryForward: false
        };

        let policy = await LeavePolicy.findOne({ employmentType: 'INTERN' });
        if (policy) {
            log('Policy already exists, updating...');
            policy = await LeavePolicy.findOneAndUpdate({ employmentType: 'INTERN' }, policyData, { new: true });
        } else {
            policy = await LeavePolicy.create(policyData);
        }
        log('Policy created/updated: ' + policy.name);

        // 2. Register a new user
        log('\n--- 2. Registering User ---');
        const userData = {
            name: 'Test Intern',
            email: `intern_${Date.now()}@example.com`,
            password: 'Password123!',
            employmentType: 'INTERN'
        };

        const registeredUser = await authService.registerUser(userData);
        log('User registered successfully');
        log('User employmentType: ' + registeredUser.employmentType);
        log('User leavePolicyId: ' + registeredUser.leavePolicyId);

        // 3. Verify in Database
        log('\n--- 3. Verifying in Database ---');
        const userInDb = await User.findById(registeredUser._id).populate('leavePolicyId');
        if (userInDb && userInDb.leavePolicyId && userInDb.leavePolicyId.employmentType === 'INTERN') {
            log('Verification SUCCESS: User assigned to correct policy');
        } else {
            log('Verification FAILED: User or policy assignment not found');
        }

    } catch (error) {
        log('Verification Error: ' + error.message);
    } finally {
        await mongoose.connection.close();
        log('MongoDB connection closed');
    }
};

verifyFeature();
