import express from 'express';
import { getTask, addTask, editTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

router.get('/', getTask);
router.post('/', addTask);
router.put('/:id', editTask);
router.delete('/:id', deleteTask);

export { router };