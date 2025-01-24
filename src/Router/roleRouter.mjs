import express from "express"
import { Role } from "../Models/Empmodel.mjs"
import mongoose from "mongoose";


const rolerouter = express.Router()


rolerouter.post('/roles', async (req, res) => {
    try {
        const { RoleName, DeptName } = req.body;

       
        if (!RoleName || !DeptName) {
            return res.status(400).json({ error: 'RoleName and DeptName are required' });
        }

        
        if (!mongoose.Types.ObjectId.isValid(DeptName)) {
            return res.status(400).json({ error: 'Invalid Department ID' });
        }

        const newRole = new Role({ RoleName, DeptName });
        await newRole.save();

        res.status(201).json({ message: 'Role created successfully', role: newRole });
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: 'Error creating role' });
    }
});


rolerouter.get('/roles', async (req, res) => {
    try {
        const roles = await Role.find().populate('DeptName');
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching roles' });
    }
});


rolerouter.get('/roles/:id', async (req, res) => {
    try {
        const role = await Role.findById(req.params.id).populate('DeptName');
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching role details' });
    }
});


rolerouter.put('/roles/:id', async (req, res) => {
    try {
        const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Role updated successfully', role: updatedRole });
    } catch (error) {
        res.status(500).json({ error: 'Error updating role' });
    }
});


rolerouter.delete('/roles/:id', async (req, res) => {
    try {
        await Role.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting role' });
    }
});

export default rolerouter;