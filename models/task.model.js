import mongoose from "mongoose";


const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'to do', 'in progress', 'done'], 
    default: 'pending'
  },
  estimatedTime: { type: Date },
  time: [{
    stated: { type: Date },  
    ended: { type: String },   
  }],
  priority: {
    type: String,
    enum: ['high', 'normal', 'low'], 
    default: 'normal'
  }
}, { timestamps: true }); 

const Task = mongoose.model("Task", taskSchema);

export default Task;
