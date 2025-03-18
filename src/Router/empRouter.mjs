import express, { text } from "express";
import { Employee, Project } from "../Models/Empmodel.mjs";
import { uploadImage, singleImagePath } from "../Utilis/mediahandler.mjs";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { mailSender } from "../Utilis/mailhandler.mjs";



const emprouter = express.Router();

emprouter.post('/employees', uploadImage.single('image'), singleImagePath, async (req, res) => {
    try {
        const { Empname, EmpId, Dob, Phoneno, Email, Password, Reportingto, Department, Role, imagelink } = req.body;

       
        if (Reportingto && !mongoose.Types.ObjectId.isValid(Reportingto)) {
            return res.status(400).json({ error: 'Invalid Reportingto ID' });
        }
        if (!mongoose.Types.ObjectId.isValid(Department)) {
            return res.status(400).json({ error: 'Invalid Department ID' });
        }
        if (!mongoose.Types.ObjectId.isValid(Role)) {
            return res.status(400).json({ error: 'Invalid Role ID' });
        }

       
        const hashedPassword = await bcrypt.hash(Password, 10);

     
        const newEmployee = new Employee({
            Empname,
            EmpId,
            Dob,
            Phoneno,
            Email,
            Password: hashedPassword,
            Reportingto: Reportingto ? new mongoose.Types.ObjectId(Reportingto) : null,
            Department: new mongoose.Types.ObjectId(Department),
            Role: new mongoose.Types.ObjectId(Role),
            image: req.body.imagelink,
        });

       
        await newEmployee.save();

    
        const emailData = {
            email: Email,
            subject: 'Welcome to our company!',
            text: `Hello Mr/Mrs ${Empname},\n\nWelcome to the company! Your EmpId is ${EmpId}.Your Role in our company is ${Role} Feel free to reach out for any assistance.\n\nBest Regards,\nCompany Team`,
        };

       
        const isMailSent = await mailSender (emailData);
        if (!isMailSent) {
            console.error('Failed to send welcome email');
        }

        res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating employee' });
    }
});


emprouter.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find().populate('Department Role Reportingto').sort({_id:-1});
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching employees' });
    }
});

emprouter.get('/employees/:id', async (req, res) => {
    try {
        
        const employee = await Employee.findById(req.params.id)
            .populate('Department') 
            .populate('Role') 
            .populate('Reportingto'); 
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

       
        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).json({ error: 'Error fetching employee details' });
    }
});
emprouter.put('/employees/:id', uploadImage.single('image'), singleImagePath, async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
    } catch (error) {
        res.status(500).json({ error: 'Error updating employee' });
    }
});

emprouter.delete('/employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Delete the employee from the database
        await Employee.findByIdAndDelete(req.params.id);

        // Email data
        const emailData = {
            email: employee.Email,
            subject: 'Employment Termination Notice',
            text: `Dear ${employee.Empname},\n\nWe regret to inform you that your employment with [Company Name] has been terminated, effective immediately.\n\nIf you have any questions, please reach out to HR.\n\nBest Regards,\n[Company Team]`,
        };

        // Send termination email
        const isMailSent = await mailSender(emailData);
        if (!isMailSent) {
            console.error('Failed to send termination email');
        }

        res.status(200).json({ message: 'Employee terminated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting employee' });
    }
});


emprouter.post('/signin', async (req, res) => {
    try {
      const { Email, Password } = req.body;
  
      const employee = await Employee.findOne({ Email }).populate('Role');  
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      const isPasswordValid = await bcrypt.compare(Password, employee.Password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      console.log(employee);  
  
      res.status(200).json({ message: 'Signin successful', employee });  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error signing in' });
    }
  });
  


emprouter.post('/forgotpassword', async (req, res) => {
    try {
        const { Email } = req.body;

     
        const employee = await Employee.findOne({ Email });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

          const resetLink = `http://localhost:3000/changepassword`

      
        const emailData = {
            email: Email,
            subject: 'Password Reset Request',
            text: `Hello ${employee.Empname},\n\nWe received your password reset request. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.\n\nBest Regards,\nCompany Team`,
        };

        const isMailSent = await mailSender(emailData);
        if (!isMailSent) {
            return res.status(500).json({ error: 'Failed to send notification email' });
        }

        res.status(200).json({ message: 'Password reset request acknowledged. Check your email.' });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500).json({ error: 'Error handling forgot password request' });
    }
});

emprouter.patch('/changepassword', async (req, res) => {
    try {
        const { Email, newPassword } = req.body;

     
        if (!Email || !newPassword) {
            return res.status(400).json({ error: 'Email and new password are required' });
        }

        
        const employee = await Employee.findOne({ Email });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);


        employee.Password = hashedPassword;
        await employee.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error("Error in change password:", error);
        res.status(500).json({ error: 'Error changing password' });
    }
});

emprouter.get('/employees/:id/projects', async (req, res) => {
    try {
        const employeeId = req.params.id;

        
        const projects = await Project.find({ Assignedto: employeeId }).sort({_id:-1})
            .populate('Assignedto', 'Empname Email')
            .populate('Assignedby', 'Empname Email');

        if (!projects.length) {
            return res.status(404).json({ message: 'No projects found for this employee' });
        }

        res.status(200).json({
            employeeId,
            projects: projects.map(project => ({
                projectId: project._id,
                projectName: project.ProjectName,
                assignedBy: project.Assignedby,
                Assignedto:project.Assignedto
            })),
        });
    } catch (error) {
        console.error("Error fetching projects for employee:", error);
        res.status(500).json({ error: 'Error fetching projects for employee' });
    }
});



export default emprouter