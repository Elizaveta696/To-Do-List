import express from 'express';
import { getTask, addTask, editTask, deleteTask, healthCheck, readyCheck } from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getTask);
router.post('/', authenticateToken, addTask);
router.put('/:id', authenticateToken, editTask);
router.delete('/:id', authenticateToken, deleteTask);
router.get('/health', healthCheck);
router.get('/ready', readyCheck);

export { router };