import mongoose from "mongoose";

// Define the structure of the comment schema
const commentSchema = new mongoose.Schema({
  creator: String,
  text: String,
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  name: String,
});

// Define the structure of the task schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  content: [{ text: String, done: Boolean }],
  creator: { type: String, required: true },
  dueDate: { type: Date, required: true },
  tags: [String],
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  comments: [commentSchema],
});

// Define the Task model based on the taskSchema
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// Export the Task model for use in other parts of the application
export default Task;
