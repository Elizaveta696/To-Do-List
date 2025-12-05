import { Task } from "../models/Task.js";
import { Team } from "../models/Team.js";
import { Team_member } from "../models/Team_member.js";
import { sequelize } from "../config/db.js";
import mongoSanitize from 'mongo-sanitize';
import bcrypt from "bcryptjs";


//create team
const createTeam = async (req, res) => {
    try{
        const { name, password } = req.body;
        const userId = req.user.userId;
        const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const passwordHashed = await bcrypt.hash(password, 10);

        const team = await Team.create({ teamCode, name, passwordHashed, userId });
        const teamId = team.teamId;
        const role = 'owner';
        const team_member = await Team_member.create({ teamId, userId, role});

        res.json({message: 'Team created successfully!', teamId, teamCode, userId});

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

//join team
const joinTeam = async (req, res) => {
    try{
    const { teamCode, password } = req.body;
    const userId = req.user.userId;
    const team = await Team.findOne({ where: { teamCode: teamCode } });
    if (!team) return res.status(404).json({ error: "Team not found" });

    const ok = await bcrypt.compare(password, team.passwordHashed);
    if (!ok) return res.status(400).json({ error: "Wrong password" });

    const team_member = await Team_member.create({ teamId: team.teamId, userId, role: 'member'});
    res.json({message: 'joined!', teamId: team.teamId});

    } catch (error){
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

//get all tasks for the team
const getTeamTasks = async (req, res) => {
    try{
        const teamId = req.params.teamId;
        const userId = req.user.userId;

        const member = await Team_member.findOne({where: { teamId: teamId, userId: userId}});
        if (!member) return res.status(403).json({ error: "Not a member of this team" });

        const tasks = await Task.findAll({where: {teamId: teamId}});
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

//add team task
const addTeamTask = async (req, res) => {
    try{
        const teamId = req.params.teamId;
        const { title, description, completed, dueDate, priority } = req.body;
        const userId = req.user.userId;

        const member = await Team_member.findOne({ where: {teamId: teamId, userId: userId}});
        if (!member) return res.status(403).json({ error: "Not a member of this team" });
        
        const task = await Task.create({title, description, completed, dueDate, priority, teamId, userId});
        res.json({message: 'Task created!'});
    } catch (error){
        console.error(error);
        res.status(500).json({ message: error.message });       
    }
}

//edit team task
const editTeamTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { title, description, completed, dueDate, priority } = req.body;
        const userId = req.user.userId;

        const task = await Task.findOne({ where: { id: taskId}});
        if (!task) return res.status(404).json({ message: "Task not found" });

        const member = await Team_member.findOne({where: {teamId: task.teamId, userId}});
        if (!member) return res.status(403).json({ error: "Not a member of this team" });

        task.title = title ?? task.title;
        task.description = description ?? task.description;
        task.completed = completed ?? task.completed;
        task.dueDate = dueDate ?? task.dueDate;
        task.priority = priority ?? task.priority;
        await task.save();

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

//delete team task
const deleteTeamTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.userId;

        const task = await Task.findOne({ where: {id: taskId }});
        if (!task) return res.status(404).json({ message: "Task not found" });

        const member = await Team_member.findOne({where: {teamId: task.teamId, userId, role: 'owner' }});
        if (!member) return res.status(403).json({ error: "Not a member of this team" });

        const deleted = await Task.destroy({ where: { id: taskId } });
        if (!deleted) return res.status(404).json({ message: "Task not found!" });

        res.status(200).json({ message: "Task deleted!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

const deleteTeamMember = async (req, res) => {
    try{
        const teamId = req.params.teamId;
        const userToDeleteId = req.params.userId;
        const userId = req.user.userId;

        const member = await Team_member.findOne({where: { teamId, userId, role: 'owner' }});
        if (!member) return res.status(403).json({ error: "Not a member of this team" });

        const team_member = await Team_member.findOne({where: {teamId: teamId, userId: userToDeleteId}});
        if (!team_member) return res.status(404).json({ error: "User not found" });

        const deleted = await Team_member.destroy({ where: {teamId: teamId, userId: userToDeleteId}});

        res.status(200).json({message: "Team member deleted!"});
    } catch (error) {
        res.status(500).json({message: error});
    }

}

const getAllTeamMembers = async (req, res) => {
    try{
        const teamId = req.params.teamId;

        const team = await Team.findOne({ where: {teamId} });
        if (!team) return res.status(404).json({ error: "Team not found" });

        const team_members = await Team_member.findAll({ where: {teamId}});

        res.status(200).json(team_members);

    } catch (error) {
        res.status(500).json({message: error});
    }
}

export { createTeam, joinTeam, getTeamTasks, addTeamTask, editTeamTask, deleteTeamTask, deleteTeamMember, getAllTeamMembers };
