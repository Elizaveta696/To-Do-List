import express from 'express';
import { createTeam, joinTeam, getTeamTasks, addTeamTask, editTeamTask, deleteTeamTask, deleteTeamMember, getAllTeamMembers } from '../controllers/teamController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const teamRouter = express.Router();

teamRouter.post('/teams', authenticateToken, createTeam);
teamRouter.post('/teams/join', authenticateToken, joinTeam);
teamRouter.post('/teams/:teamId/tasks', authenticateToken, addTeamTask);
teamRouter.get('/teams/:teamId/tasks', authenticateToken, getTeamTasks);
teamRouter.put('/teams/:teamId/tasks/:id', authenticateToken, editTeamTask);
teamRouter.delete('/teams/:teamId/tasks/delete/:id', authenticateToken, deleteTeamTask);
teamRouter.get('/team/:teamId/members', authenticateToken, getAllTeamMembers);
teamRouter.delete('/team/:teamId/members/delete/:userId', authenticateToken, deleteTeamMember);

export { teamRouter };