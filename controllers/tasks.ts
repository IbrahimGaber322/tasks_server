import mongoose from "mongoose";
import Task from "../models/task";
import User from "../models/user";

/**
 * Get a list of tasks for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const getTasks = async (req: any, res: any) => {
  const { userEmail } = req;
  const { page, sort } = req.query;

  try {
    // Set up sorting options based on the provided 'sort' parameter
    let sorter: any = {};
    if (sort === "createdAt") {
      sorter.createdAt = -1;
    } else if (sort === "completed") {
      sorter.isCompleted = -1;
    } else if (sort === "notCompleted") {
      sorter.isCompleted = 1;
    } else if (sort === "dueDate") {
      sorter.dueDate = 1;
    }

    // Find the user by email
    const user = await User.findOne({ email: userEmail });

    // Pagination settings
    const LIMIT = 10;
    const startIndex = (Number(page) - 1) * LIMIT;

    // Count the total number of tasks for the user
    const total = await Task.countDocuments({ creator: userEmail });

    // Fetch tasks with sorting, pagination, and skipping
    const tasks = await Task.find({ creator: userEmail })
      .sort(sorter)
      .limit(LIMIT)
      .skip(startIndex);

    // Respond with tasks, current page, and number of pages
    res.status(200).json({
      tasks: tasks,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * Get a specific task for the authenticated user by task ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const getTask = async (req: any, res: any) => {
  const { userEmail } = req;
  const { id } = req.params;

  try {
    // Find the task by ID and creator email
    const task = await Task.findOne({
      $and: [{ _id: id }, { creator: userEmail }],
    });

    // Respond with the task
    res.status(200).json(task);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * Get tasks filtered by search criteria for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const getTasksBySearch = async (req: any, res: any) => {
  const { userEmail } = req;
  const LIMIT = 10;
  const { searchQuery, searchTags, page, sort } = req.query;

  const startIndex = (Number(page) - 1) * LIMIT;

  // Convert searchTags to an array of tags for matching
  const tagsSet =
    searchTags !== "null"
      ? searchTags?.includes(",")
        ? searchTags.split(",")
        : [searchTags]
      : null;
  const tags = tagsSet?.map((tag: string) => new RegExp(tag, "i"));

  // Convert page to a number or null if not provided
  const currentPage = page ? Number(page) : null;

  // Create a regex pattern for title search
  const title = searchQuery !== "null" ? new RegExp(searchQuery, "i") : null;

  try {
    let total;
    let tasks;
    let sorter: any = {};

    // Set up sorting options based on the provided 'sort' parameter
    if (sort === "createdAt") {
      sorter.createdAt = -1;
    } else if (sort === "completed") {
      sorter.isCompleted = -1;
    } else if (sort === "notCompleted") {
      sorter.isCompleted = 1;
    } else if (sort === "dueDate") {
      sorter.dueDate = 1;
    }

    // Find the user by email
    const user = await User.findOne({ email: userEmail });

    // Fetch tasks based on search criteria and pagination
    if (currentPage) {
      if (tags && title) {
        total = await Task.find({
          $and: [
            { title: title },
            { tags: { $all: tags } },
            { creator: userEmail },
          ],
        }).countDocuments();
        tasks = await Task.find({
          $and: [
            { title: title },
            { tags: { $all: tags } },
            { creator: userEmail },
          ],
        })
          .sort(sorter)
          .limit(LIMIT)
          .skip(startIndex);
      } else if (title && !tags) {
        total = await Task.countDocuments({
          $and: [{ title: title }, { creator: userEmail }],
        });
        tasks = await Task.find({
          $and: [{ title: title }, { creator: userEmail }],
        })
          .sort(sorter)
          .limit(LIMIT)
          .skip(startIndex);
      } else if (tags && !title) {
        total = await Task.countDocuments({
          $and: [{ tags: { $all: tags } }, { creator: userEmail }],
        });
        tasks = await Task.find({
          $and: [{ tags: { $all: tags } }, { creator: userEmail }],
        })
          .sort(sorter)
          .limit(LIMIT)
          .skip(startIndex);
      }
    }

    // Calculate the number of pages and respond
    const numberOfPages =
      page !== "null" && total !== undefined ? Math.ceil(total / LIMIT) : null;

    res.status(200).json({
      tasks: tasks,
      currentPage: currentPage,
      numberOfPages: numberOfPages,
    });
  } catch (error) {
    res.status(404).json({ message: "No tasks found" });
  }
};

/**
 * Create a new task for the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const createTask = async (req: any, res: any) => {
  const { userEmail } = req;
  const task = req.body;

  // Create a new Task instance with user's email and creation timestamp
  const newTask = new Task({
    ...task,
    creator: userEmail,
    createdAt: new Date().toISOString(),
  });

  try {
    // Save the new task to the database
    await newTask.save();

    // Respond with the created task
    res.status(201).json(newTask);
  } catch (error: any) {
    // Handle conflicts and other errors
    res.status(409).json({ message: error.message });
  }
};

/**
 * Update a task associated with the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const updateTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const task = req.body;

    // Check if the provided task ID is valid
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("No task with that id");

    // Find and update the task using the provided ID
    const updatedTask = await Task.findByIdAndUpdate(id, task, { new: true });

    // Respond with the updated task
    res.json(updatedTask);
  } catch (error: any) {
    // Handle conflicts and other errors
    res.status(409).json({ message: error.message });
  }
};

/**
 * Delete a task associated with the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const deleteTask = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // Check if the provided task ID is valid
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("No task with that id");

    // Find and delete the task using the provided ID
    await Task.findByIdAndRemove(id);

    // Respond with success message
    res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    // Handle conflicts and other errors
    res.status(409).json({ message: error.message });
  }
};

/**
 * Add a comment to a task associated with the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const comment = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const comment = req.body;

    // Check if the provided task ID is valid
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("No task with that id");

    // Find the task using the provided ID
    const task = await Task.findById(id);

    // Add a new comment with creation timestamp to the task
    task.comments.push({ ...comment, createdAt: new Date().toISOString() });

    // Update the task with the new comment
    const updatedTask = await Task.findByIdAndUpdate(id, task, { new: true });

    // Respond with the updated task
    res.json(updatedTask);
  } catch (error: any) {
    // Handle conflicts and other errors
    res.status(409).json({ message: error.message });
  }
};

/**
 * Delete a comment from a task associated with the authenticated user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export const deleteComment = async (req: any, res: any) => {
  try {
    const { taskId, commentId } = req.params;

    // Check if the provided task ID is valid
    if (!mongoose.Types.ObjectId.isValid(taskId))
      return res.status(404).send("No task with that id");

    // Remove the comment using $pull operation and update the task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $pull: { comments: { _id: commentId } },
      },
      { new: true }
    );

    // Respond with the updated task
    res.json(updatedTask);
  } catch (error: any) {
    // Handle conflicts and other errors
    res.status(409).json({ message: error.message });
  }
};
