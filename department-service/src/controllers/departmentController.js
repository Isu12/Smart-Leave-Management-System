const Department = require('../models/Department');
const authService = require('../services/authService');

// Create Department
exports.createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const department = await Department.create({ name, description });
        res.status(201).json({ success: true, data: department });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All Departments
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json({ success: true, count: departments.length, data: departments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Department by ID
exports.getDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.status(200).json({ success: true, data: department });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Department
exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.status(200).json({ success: true, data: department });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete Department with Validation
exports.deleteDepartment = async (req, res) => {
    try {
        const token = req.header('Authorization').split(' ')[1];
        
        // Check if there are users assigned to this department
        const userData = await authService.getUsersByDepartment(req.params.id, token);
        
        if (userData.success && userData.count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete department: there are employees assigned to it' 
            });
        }

        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }
        res.status(200).json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Assign User to Department
exports.assignUser = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const token = req.header('Authorization').split(' ')[1];

        const department = await Department.findById(id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        const result = await authService.assignUserToDepartment(userId, id, token);
        
        if (result.success) {
            res.status(200).json({ 
                success: true, 
                message: 'User assigned to department successfully',
                user: result.user 
            });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Users in Department (Bonus)
exports.getDepartmentUsers = async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.header('Authorization').split(' ')[1];

        const department = await Department.findById(id);
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        const result = await authService.getUsersByDepartment(id, token);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
