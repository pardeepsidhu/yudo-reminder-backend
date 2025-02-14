import mongoose from "mongoose"

const emailSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  scheduleTime: { type: Date, required: true },
  jobId: { type: String }, 
});

const model = mongoose.model("Email", emailSchema);
export default model;