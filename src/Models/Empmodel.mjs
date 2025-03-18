import mongoose, { mongo, Schema } from "mongoose";


const employeeschema = new mongoose.Schema({
  Empname: {
    type: String,
    required: true,
  },
  EmpId: {
    type: String,
    required: true,
  },
  Dob: {
    type: Date,
    required: true,
  },
  Phoneno: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  Password: {
    type: String,
    required: true,
  },
  Reportingto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    validate: {
      validator: async function(value) {
        if (this.Role) {
          const role = await mongoose.model('Role').findById(this.Role);
          if (role && role.RoleName !== 'Admin' && !value) {
            return false; 
          }
        }
        return true;
      },
      message: 'Reportingto is required for non-Admin roles',
    },
  },
  Department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  Role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
});


const departmentSchema = new mongoose.Schema({
  DeptName: {
    type: String,
    required: true,
  },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
});


const roleschema = new mongoose.Schema({
  DeptName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  RoleName: {
    type: String,
    required: true,
  },
});

const dataaddingschema = new mongoose.Schema({
  Title:
   { type: String, required: true },
  ActionPlanned:
   { type: String, required: true },
  StartTime: 
  { type: String, required: true },
  EndTime:
   { type: String, required: true },
  ActionAchieved: 
  { type: Boolean, required: true },
  CreatedDate:
   { type: Date, required: true, default: Date.now },
  EmpId: 
  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
});

dataaddingschema.pre('validate', function (next) {
  if (!this.ActionPlanned && !this.ActionAchieved) {
    return next(new Error('At least one of ActionPlanned or ActionAchieved must be provided'));
  }
  next();
});

const projectschema = new mongoose.Schema({
     ProjectName:{
         type:String,
         required:true
     },
     ProjectDescription:{
         type:String,
         required:true
     },
     Assignedby:{
          type:mongoose.Schema.Types.ObjectId,
          ref:'Employee',
          required:true
     },
     Assignedto:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Employee',
            required:true
     }],
     DueDate:{
            type:Date,
            required:true
     },
     CreatedDate:{ type: Date, required: true, default: Date.now },
     Status:{
          type:String,
          required:true
          
     },
    
   
})

const subprojectschema = new mongoose.Schema({
   TaskName:{
    type:String,
    required:true
   },
   TaskDescription:{
    type:String,
    required:true
   },
   Assignedby:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'Employee',
     required:true
   },
   Assignedto:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:'Employee',
       required:true
   }],
   DueDate:{
         type:Date,
         required:true
   },
   CreatedDate:{ type: Date, required: true, default: Date.now },
   Status:{
         type:String,
         required:true,
         default: "Pending" 
   },
   projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }
   
})


export const Employee = mongoose.model('Employee', employeeschema);
export const Department = mongoose.model('Department', departmentSchema);
export const Role = mongoose.model('Role', roleschema);
export const Dataadd = mongoose.model('Dataadd', dataaddingschema);
export const Project = mongoose.model('Project',projectschema);
export const SubProject = mongoose.model('SubProject',subprojectschema)
