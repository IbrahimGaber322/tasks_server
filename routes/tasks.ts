// Import required modules and functions
import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTasksBySearch,
  getTask,
  comment,
  deleteComment,
} from "../controllers/tasks";
import user from "../middleware/user";

// Create an instance of the Express Router
const router = express.Router();

// Route: GET /tasks
// Description: Get a list of tasks
router.get("/", user, getTasks);

// Route: GET /tasks/:id
// Description: Get a specific task by ID
router.get("/:id", user, getTask);

// Route: GET /tasks/search/search
// Description: Search tasks based on a search query
router.get("/search/search", user, getTasksBySearch);

// Route: POST /tasks
// Description: Create a new task
router.post("/", user, createTask);

// Route: PATCH /tasks/:id/comments
// Description: Add a comment to a specific task
router.patch("/:id/comments", user, comment);

// Route: PATCH /tasks/:id
// Description: Update a specific task
router.patch("/:id", user, updateTask);

// Route: DELETE /tasks/:id
// Description: Delete a specific task
router.delete("/:id", user, deleteTask);

// Route: DELETE /tasks/:taskId/comments/:commentId
// Description: Delete a comment from a specific task
router.delete("/:taskId/comments/:commentId", user, deleteComment);

// Export the configured router
export default router;
