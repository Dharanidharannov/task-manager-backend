import express from 'express'
import { Dataadd, Employee } from '../Models/Empmodel.mjs'
import mongoose from 'mongoose'
import emprouter from './empRouter.mjs'

const dataaddrouter = express.Router()


dataaddrouter.post('/datas', async (req, res) => {
    try {
        console.log(req.body);  
        const { Title, ActionPlanned, StartTime, EndTime, ActionAchieved, CreatedDate, EmpId } = req.body;

       
        const employee = await Employee.findOne({ EmpId });

        if (!employee) {
            return res.status(400).json({ error: 'Invalid Employee ID' });
        }

     
        const newData = new Dataadd({
            Title,
            ActionPlanned,
            StartTime,
            EndTime,
            ActionAchieved,
            CreatedDate,
            EmpId: employee._id 
        });

        await newData.save();
        res.status(201).json({ message: 'Data entry created successfully', data: newData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating data entry' });
    }
});

dataaddrouter.get('/datas', async (req, res) => {
    try {
        const { EmpId ,CreatedDate } = req.query; 

        let filter = {}; 
        if (EmpId) {
            if (!mongoose.Types.ObjectId.isValid(EmpId)) {
                return res.status(400).json({ error: 'Invalid Employee ID' });
            }
            filter = { EmpId: new mongoose.Types.ObjectId(EmpId) }; 
        }

        const dataEntries = (await Dataadd.find(filter).populate('EmpId').sort({_id:-1}));
        res.status(200).json(dataEntries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching data entries' });
    }
});

dataaddrouter.get('/datas/:id',async (req, res) => {
    try {
        const dataEntry = await Dataadd.findById(req.params.id).populate('EmpId');
        if (!dataEntry) {
            return res.status(404).json({ message: 'Data entry not found' });
        }
        res.status(200).json(dataEntry);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data entry' });
    }
    })
    dataaddrouter.put('/datas/:id', async (req, res) => {
        try {
            const updatedData = await Dataadd.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true } 
            ).sort({_id:-1});
    
            if (!updatedData) {
                return res.status(404).json({ message: 'Data entry not found' });
            }
    
            res.status(200).json({ message: 'Data entry updated successfully', data: updatedData });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error updating data entry' });
        }
    });
    

dataaddrouter.delete('/datas/:id', async (req, res) => {
    try {
        const deletedData = await Dataadd.findByIdAndDelete(req.params.id);
        if (!deletedData) {
            return res.status(404).json({ message: 'Data entry not found' });
        }
        res.status(200).json({ message: 'Data entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting data entry' });
    }
})

dataaddrouter.get('/tasks', async (req, res) => {
    try {
        const { EmpId, date } = req.query;

        if (!EmpId || !date) {
            return res.status(400).json({ error: 'EmpId and date are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(EmpId)) {
            return res.status(400).json({ error: 'Invalid Employee ID' });
        }

        const taskDate = new Date(date);
        if (isNaN(taskDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const startOfDay = new Date(taskDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(taskDate.setHours(23, 59, 59, 999));

        const tasks = await Dataadd.find({
            EmpId: new mongoose.Types.ObjectId(EmpId),
            CreatedDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate('EmpId');

        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});







export default dataaddrouter