import mongoose from "mongoose";
import Task from "../models/task";
import User from "../models/user";

export const getTasks = async (req: any, res: any) => {
  const { userEmail } = req;
  const { page , sort } = req.query;
  
  console.log(req.query);
  console.log(`getTaks page: ${typeof page}`);
  
  try {
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
    const user = await User.findOne({ email: userEmail });
    const LIMIT = 10;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await Task.countDocuments({ creator: userEmail });
    const tasks = await Task.find(
      { creator: userEmail })
      .sort(sorter)
      .limit(LIMIT)
      .skip(startIndex);    
    

    res
      .status(200)
      .json({
        tasks: tasks,
        currentPage: Number(page),
        numberOfPages: Math.ceil(total / LIMIT),
      });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const getTask = async (req: any, res: any) => {
  const { userEmail } = req;
  const { id } = req.params;
  try {
    const task = await Task.findOne({
      $and: [{ _id: id }, { creator: userEmail }],
    });

    res.status(200).json(task);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const getTasksBySearch = async (req: any, res: any) => {
  const { userEmail } = req;
  const LIMIT = 10;
  const { searchQuery, searchTags, page, sort } = req.query;
  console.log(`getTasksBYSearch page: ${page}`);
  const startIndex = (Number(page) - 1) * LIMIT;
  const tagsSet =
    searchTags !== "null"
      ? searchTags?.includes(",")
        ? searchTags.split(",")
        : [searchTags]
      : null;
  const tags = tagsSet?.map((tag: string) => new RegExp(tag, "i"));
  const currentPage = page ? Number(page) : null;
  const title = searchQuery !== "null" ? new RegExp(searchQuery, "i") : null;
  try {
    let total;
    let tasks;
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
    const user = await User.findOne({ email: userEmail });
    if (currentPage) {
      if (tags && title) {
        total = await Task.find({
          $and: [
            { title: title },
            { tags: { $all: tags } },
            { creator: userEmail },
          ],
        }).countDocuments();
        tasks = await Task.find(
          {
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
        tasks = await Task.find(
          { $and: [{ tags: { $all: tags } }, { creator: userEmail }] })
          .sort(sorter)
          .limit(LIMIT)
          .skip(startIndex);
      }
    } 
    const numberOfPages =
      page !== "null" && total !== undefined ? Math.ceil(total / LIMIT) : null;
    res
      .status(200)
      .json({
        tasks: tasks,
        currentPage: currentPage,
        numberOfPages: numberOfPages,
      });
  } catch (error) {
    res.status(404).json({ message: "no tasks found" });
  }
};

export const createTask = async (req: any, res: any) => {
  const { userEmail } = req;
  const task = req.body;
  const newTask = new Task({
    ...task,
    creator: userEmail,
    createdAt: new Date().toISOString(),
  });
  try {
    await newTask.save();

    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(409).json({ message: error.message });
  }
};

export const updateTask = async (req: any, res: any) => {
  try {
    const { userEmail } = req;
    const { id } = req.params;

    const task = req.body;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("No task with that id");
    const updatedTask = await Task.findByIdAndUpdate(id, task, { new: true });

    res.json(updatedTask);
  } catch (error: any) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteTask = async (req: any, res: any) => {
  try {
    const { userEmail } = req;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("No task with that id");
    await Task.findByIdAndRemove(id);

    res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(409).json({ message: error.message });
  }
};

export const comment = async (req: any, res: any) => {
    console.log("yoo");
  try {
    const { id } = req.params;
    const comment = req.body;
    console.log(comment);
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("No task with that id");
    const task = await Task.findById(id);
    task.comments.push({ ...comment, createdAt: new Date().toISOString() });
    const updatedTask = await Task.findByIdAndUpdate(id, task, { new: true });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteComment = async (req: any, res: any) => {
  try {
    const { taskId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId))
      return res.status(404).send("No task with that id");
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $pull: { comments: { _id: commentId } },
      },
      { new: true }
    );

    res.json(updatedTask);
  } catch (error: any) {
    res.status(409).json({ message: error.message });
  }
};
