import express from 'express';
import { createTeam, joinTeam, getTeamTasks, addTeamTask, editTeamTask, deleteTeamTask } from '../controllers/teamController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const teamRouter = express.Router();

teamRouter.post('/teams', authenticateToken, createTeam);
teamRouter.post('/teams/join', authenticateToken, joinTeam);
teamRouter.post('/teams/:teamId/tasks', authenticateToken, addTeamTask);
teamRouter.get('/teams/:teamId/tasks', authenticateToken, getTeamTasks);
teamRouter.put('/teams/:teamId/tasks/:id', authenticateToken, editTeamTask);
teamRouter.delete('/teams/:teamId/tasks/:id', authenticateToken, deleteTeamTask);

export { teamRouter };