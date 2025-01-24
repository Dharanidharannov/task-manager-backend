import express from 'express';
import { Department, Employee } from '../Models/Empmodel.mjs';

const departmentrouter = express.Router();


departmentrouter.post('/departments', async (req, res) => {
    try {
        const { DeptName } = req.body;

        const newDepartment = new Department({
            DeptName
        });

        await newDepartment.save();
        res.status(201).json({ message: 'Department created successfully', department: newDepartment });
    } catch (error) {
        res.status(500).json({ error: 'Error creating department' });
    }
});


departmentrouter.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching departments' });
    }
});


departmentrouter.get('/departments/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching department details' });
    }
});


departmentrouter.put('/departments/:id', async (req, res) => {
    try {
        const updatedDepartment = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Department updated successfully', department: updatedDepartment });
    } catch (error) {
        res.status(500).json({ error: 'Error updating department' });
    }
});


departmentrouter.delete('/departments/:id', async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting department' });
    }
});
departmentrouter.get('/departments/:id/members', async (req, res) => {
    try {
        const departmentId = req.params.id;

        const employees = await Employee.find({ Department: departmentId }).populate("Department");

        if (!employees.length) {
            return res.status(404).json({ message: 'No employees found for this department' });
        }

        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching department members' });
    }
});

export default departmentrouter;
