import express from "express";
import { Project } from "../Models/Empmodel.mjs";
import mongoose from "mongoose";

const projectrouter = express.Router();


projectrouter.post('/projects', async (req, res) => {
    try {
        const { ProjectName, ProjectDescription, Assignedby, Assignedto, DueDate, Status } = req.body;

     
        if (!mongoose.Types.ObjectId.isValid(Assignedby)) {
            return res.status(400).json({ error: 'Invalid Assignedby ID' });
        }
        for (const assignee of Assignedto) {
            if (!mongoose.Types.ObjectId.isValid(assignee)) {
                return res.status(400).json({ error: 'Invalid Assignedto ID' });
            }
        }

        const newProject = new Project({
            ProjectName,
            ProjectDescription,
            Assignedby: new mongoose.Types.ObjectId(Assignedby),
            Assignedto: Assignedto.map(id => new mongoose.Types.ObjectId(id)),
            DueDate,
            Status
        });

        await newProject.save();

        res.status(201).json({ message: 'Project created successfully', project: newProject });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: 'Error creating project' });
    }
});


projectrouter.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ _id: -1})
            .populate('Assignedby', 'Empname Email')
            .populate('Assignedto', 'Empname Email');

        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: 'Error fetching projects' });
    }
});

projectrouter.get('/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('Assignedby', 'Empname Email')
            .populate('Assignedto', 'Empname Email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project details:", error);
        res.status(500).json({ error: 'Error fetching project details' });
    }
});

projectrouter.put('/projects/:id', async (req, res) => {
    try {
        const { ProjectName, ProjectDescription, Assignedby, Assignedto, DueDate, Status } = req.body;

        console.log("Updating Project ID:", req.params.id);
        console.log("New Status:", Status);

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            {
                ProjectName,
                ProjectDescription,
                Assignedby: Assignedby ? new mongoose.Types.ObjectId(Assignedby) : undefined,
                Assignedto: Assignedto ? Assignedto.map(id => new mongoose.Types.ObjectId(id)) : undefined,
                DueDate,
                Status
            },
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        console.log("Updated Project:", updatedProject); // ✅ Check if Status updates in DB
        res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: 'Error updating project' });
    }
});


projectrouter.delete('/projects/:id', async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: 'Error deleting project' });
    }
});







export default projectrouter;
