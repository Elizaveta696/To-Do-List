import express from 'express';
import { createTeam, joinTeam, getTeamTasks, addTeamTask, editTeamTask, deleteTeamTask, deleteTeamMember, getAllTeamMembers, getAllTeamBoardsTheUserHas, getAllUsers, addUserToTeam, changeUserRole, deleteTeam } from '../controllers/teamController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const teamRouter = express.Router();

teamRouter.post('/teams', authenticateToken, createTeam);
teamRouter.post('/teams/join', authenticateToken, joinTeam);
teamRouter.post('/teams/:teamId/tasks', authenticateToken, addTeamTask);
teamRouter.get('/teams/:teamId/tasks', authenticateToken, getTeamTasks);
teamRouter.put('/teams/:teamId/tasks/:id', authenticateToken, editTeamTask);
teamRouter.delete('/teams/:teamId/tasks/delete/:id', authenticateToken, deleteTeamTask);
teamRouter.get('/teams/:teamId/members', authenticateToken, getAllTeamMembers);
teamRouter.delete('/teams/:teamId/members/delete/:userId', authenticateToken, deleteTeamMember);
teamRouter.get('/teams/all', authenticateToken, getAllTeamBoardsTheUserHas);
teamRouter.get('/users', authenticateToken, getAllUsers);
teamRouter.post('/teams/:teamId/join', authenticateToken, addUserToTeam);
teamRouter.put('/teams/:teamId/members/change', authenticateToken, changeUserRole);
teamRouter.delete('/team/:teamId/delete', authenticateToken, deleteTeam);
export { teamRouter };