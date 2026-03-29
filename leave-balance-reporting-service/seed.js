                                  /**
 * File: seed.js
 * Purpose: Populates the MongoDB database with sample records for the 
 * Leave Balance & Reporting Service. Ideal for testing APIs quickly.
 */

// Load environment variables so we can read MONGODB_URI
require('dotenv').config();
const mongoose = require('mongoose');

// Import local configuration and Models
const connectDB = require('./src/config/db');
const LeaveBalance = require('./src/models/LeaveBalance');
const LeaveUsageLog = require('./src/models/LeaveUsageLog');

// 1. Array of 5 Leave Balance Records
const sampleBalances = [
  {
    userId: "EMP001",
    employeeName: "Nimal Perera",
    totalAllocated: 20,
    usedLeave: 4,
    department: "Engineering",
    role: "Manager"
  },
  {
    userId: "EMP002",
    employeeName: "Sunimal Silva",
    totalAllocated: 14,
    usedLeave: 3,
    department: "Engineering",
    role: "Employee"
  },
  {
    userId: "EMP003",
    employeeName: "Kasun Fernando",
    totalAllocated: 14,
    usedLeave: 6,
    department: "Marketing",
    role: "Employee"
  },
  {
    userId: "EMP004",
    employeeName: "Amali Rathnayake",
    totalAllocated: 14,
    usedLeave: 0,
    department: "Marketing",
    role: "Employee"
  },
  {
    userId: "EMP005",
    employeeName: "Dilini Jayasuriya",
    totalAllocated: 14,
    usedLeave: 2,
    department: "HR",
    role: "Employee"
  }
];

// 2. Array of 8 Leave Usage Log Records
// Notice we cover different months to make reporting endpoints interesting!
const sampleLogs = [
  // Nimal (EMP001) - 4 days total
  { userId: "EMP001", employeeName: "Nimal Perera", leaveRequestId: "LR101", leaveType: "Annual", startDate: "2026-01-10", endDate: "2026-01-11", numberOfDays: 2, approvedBy: "HR001", approvedDate: "2026-01-08", month: "01", year: 2026 },
  { userId: "EMP001", employeeName: "Nimal Perera", leaveRequestId: "LR102", leaveType: "Casual", startDate: "2026-02-15", endDate: "2026-02-16", numberOfDays: 2, approvedBy: "HR001", approvedDate: "2026-02-10", month: "02", year: 2026 },
  
  // Sunimal (EMP002) - 3 days total
  { userId: "EMP002", employeeName: "Sunimal Silva", leaveRequestId: "LR103", leaveType: "Medical", startDate: "2026-03-01", endDate: "2026-03-03", numberOfDays: 3, approvedBy: "EMP001", approvedDate: "2026-02-28", month: "03", year: 2026 },
  
  // Kasun (EMP003) - 6 days total
  { userId: "EMP003", employeeName: "Kasun Fernando", leaveRequestId: "LR104", leaveType: "Casual", startDate: "2026-01-05", endDate: "2026-01-06", numberOfDays: 2, approvedBy: "EMP001", approvedDate: "2026-01-02", month: "01", year: 2026 },
  { userId: "EMP003", employeeName: "Kasun Fernando", leaveRequestId: "LR105", leaveType: "Annual", startDate: "2026-02-20", endDate: "2026-02-22", numberOfDays: 3, approvedBy: "EMP001", approvedDate: "2026-02-15", month: "02", year: 2026 },
  { userId: "EMP003", employeeName: "Kasun Fernando", leaveRequestId: "LR106", leaveType: "Casual", startDate: "2026-04-10", endDate: "2026-04-10", numberOfDays: 1, approvedBy: "EMP001", approvedDate: "2026-04-05", month: "04", year: 2026 },
  
  // Dilini (EMP005) - 2 days total
  { userId: "EMP005", employeeName: "Dilini Jayasuriya", leaveRequestId: "LR107", leaveType: "Casual", startDate: "2026-05-12", endDate: "2026-05-12", numberOfDays: 1, approvedBy: "HR001", approvedDate: "2026-05-10", month: "05", year: 2026 },
  { userId: "EMP005", employeeName: "Dilini Jayasuriya", leaveRequestId: "LR108", leaveType: "Medical", startDate: "2026-06-01", endDate: "2026-06-01", numberOfDays: 1, approvedBy: "HR001", approvedDate: "2026-05-30", month: "06", year: 2026 },
];

const seedDatabase = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    
    // 2. Clear existing data to prevent duplicates
    await LeaveBalance.deleteMany({});
    await LeaveUsageLog.deleteMany({});
    console.log('Cleared existing DB data...');

    // 3. Insert new balances securely
    // We use a loop with .save() instead of .insertMany() because .insertMany() 
    // bypasses Mongoose pre('save') hooks, and we NEED our hook to calculate remainingLeave!
    for (const balanceData of sampleBalances) {
      const balance = new LeaveBalance(balanceData);
      await balance.save(); // This automatically triggers the Math equation inside the model
    }
    console.log(`✅ Successfully seeded ${sampleBalances.length} LeaveBalance records.`);

    // 4. Insert historical logs
    await LeaveUsageLog.insertMany(sampleLogs);
    console.log(`✅ Successfully seeded ${sampleLogs.length} LeaveUsageLog records.`);

    console.log('🎉 Database Seeding Completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Execute the seeding logic
seedDatabase();
