import express from "express";
import { getTasks, createTask, updateTask, deleteTask, getTasksBySearch, getTask, comment, deleteComment } from "../controllers/tasks";

import user from "../middleware/user";

const router = express.Router();

router.get('/',user, getTasks);
router.get('/:id',user, getTask);
router.get('/search',user,getTasksBySearch);
router.post('/', user, createTask);
router.patch('/:id/comments', user, comment);
router.patch('/:id',user, updateTask);
router.delete('/:id',user, deleteTask);
router.delete('/:taskId/comments/:commentId',user, deleteComment);


export default router;

