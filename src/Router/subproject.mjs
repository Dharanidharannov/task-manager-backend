import express from "express";
import mongoose from "mongoose";
import { SubProject, Project } from "../Models/Empmodel.mjs"; 

const subprojectrouter = express.Router();


subprojectrouter.post('/subprojects', async (req, res) => {
    try {
      const { TaskName, TaskDescription, Assignedby, Assignedto, DueDate, projectId } = req.body;
   
      if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }
      
  
      const subproject = new SubProject({
        TaskName,
        TaskDescription,
        Assignedby,
        Assignedto,
        DueDate,
        projectId
      });
      
      await subproject.save();
      res.status(201).json(subproject);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error adding subproject. Please try again." });
    }
  });

subprojectrouter.get('/subprojects', async (req, res) => {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }
  
    try {
      const subprojects = await SubProject.find({ projectId })
      .populate('Assignedby', 'Empname Email')
      .populate('Assignedto', 'Empname Email').sort({_id:-1});  
      res.json(subprojects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch subprojects" });
    }
  });


subprojectrouter.get('/subprojects/:id', async (req, res) => {
    try {
        const subproject = await SubProject.findById(req.params.id)
            .populate('Assignedby', 'Empname Email')
            .populate('Assignedto', 'Empname Email').sort({_id:-1});

        if (!subproject) {
            return res.status(404).json({ message: 'Subproject not found' });
        }

        res.status(200).json(subproject);
    } catch (error) {
        console.error("Error fetching subproject details:", error);
        res.status(500).json({ error: 'Error fetching subproject details' });
    }
});


subprojectrouter.put('/subprojects/:id', async (req, res) => {
    try {
        const { TaskName, TaskDescription, Assignedby, Assignedto, DueDate, Status, review, ProjectId } = req.body;

        if (ProjectId && !mongoose.Types.ObjectId.isValid(ProjectId)) {
            return res.status(400).json({ error: 'Invalid ProjectId' });
        }

      
        if (Assignedby && !mongoose.Types.ObjectId.isValid(Assignedby)) {
            return res.status(400).json({ error: 'Invalid Assignedby ID' });
        }

        if (Assignedto && (!Array.isArray(Assignedto) || !Assignedto.every((id) => mongoose.Types.ObjectId.isValid(id)))) {
            return res.status(400).json({ error: 'Invalid Assignedto ID' });
        }

        const updatedSubproject = await SubProject.findByIdAndUpdate(
            req.params.id,
            {
                TaskName,
                TaskDescription,
                Assignedby: Assignedby ? new mongoose.Types.ObjectId(Assignedby) : undefined,
                Assignedto: Assignedto ? Assignedto.map((id) => new mongoose.Types.ObjectId(id)) : undefined,
                DueDate,
                Status,
                review,
                ProjectId: ProjectId ? new mongoose.Types.ObjectId(ProjectId) : undefined,
            },
            { new: true }
        );

        if (!updatedSubproject) {
            return res.status(404).json({ message: 'Subproject not found' });
        }

        res.status(200).json({ message: 'Subproject updated successfully', subproject: updatedSubproject });
    } catch (error) {
        console.error("Error updating subproject:", error);
        res.status(500).json({ error: 'Error updating subproject' });
    }
});

// Delete a subproject by ID
subprojectrouter.delete('/subprojects/:id', async (req, res) => {
    try {
        const deletedSubproject = await SubProject.findByIdAndDelete(req.params.id);

        if (!deletedSubproject) {
            return res.status(404).json({ message: 'Subproject not found' });
        }

        res.status(200).json({ message: 'Subproject deleted successfully' });
    } catch (error) {
        console.error("Error deleting subproject:", error);
        res.status(500).json({ error: 'Error deleting subproject' });
    }
});



export default subprojectrouter;


