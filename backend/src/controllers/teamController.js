import bcrypt from "bcryptjs";
import mongoSanitize from "mongo-sanitize";
import { sequelize } from "../config/db.js";
import { Task } from "../models/Task.js";
import { Team } from "../models/Team.js";
import { Team_member } from "../models/Team_member.js";
import { User } from "../models/User.js";

//create team
const createTeam = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.userId;
    const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const passwordHashed = await bcrypt.hash(password, 10);

    const team = await Team.create({ teamCode, name, passwordHashed, userId });
    const teamId = team.teamId;
    const role = "owner";
    const team_member = await Team_member.create({ teamId, userId, role });

    res.json({
      ok: true,
      message: "Team created successfully!",
      team,
      teamCode: team.teamCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//join team
const joinTeam = async (req, res) => {
  try {
    const { teamCode, password } = req.body;
    const userId = req.user.userId;
    const team = await Team.findOne({ where: { teamCode: teamCode } });
    if (!team)
      return res.status(404).json({ ok: false, error: "Team not found" });

    const ok = await bcrypt.compare(password, team.passwordHashed);
    if (!ok)
      return res.status(400).json({ ok: false, error: "Wrong password" });

    const existingMember = await Team_member.findOne({
      where: { teamId: team.teamId, userId },
    });
    if (existingMember)
      return res
        .status(400)
        .json({ ok: false, message: "User already added to the team!" });

    const team_member = await Team_member.create({
      teamId: team.teamId,
      userId,
      role: "member",
    });
    res.json({ ok: true, message: "joined!", team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
};

const getAllTeamBoardsTheUserHas = async (req, res) => {
  try {
    const userId = req.user.userId;

    const teamIds = (
      await Team_member.findAll({ where: { userId: userId } })
    ).map((t) => t.teamId);
    if (teamIds.length === 0)
      return res.status(200).json({ ok: true, teams: [] });

    const teams = await Team.findAll({ where: { teamId: teamIds } });

    res.status(200).send({ ok: true, teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: error.message });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ["userId", "username"] });
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const addUserToTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { userIdToAdd, role } = req.body;
    const userId = req.user.userId;

    const validRoles = ["owner", "member"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role value" });
    }

    const member = await Team_member.findOne({
      where: { teamId: teamId, userId, role: "owner" },
    });
    if (!member)
      return res.status(403).json({ error: "Only owner can add members" });

    const exists = await Team_member.findOne({
      where: { teamId, userId: userIdToAdd },
    });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const team_member = await Team_member.create({
      teamId: teamId,
      userId: userIdToAdd,
      role: role || "member",
    });
    res.status(200).json({ message: "User added!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.userId;
    const { userIdToChange, role } = req.body;

    const validRoles = ["owner", "member"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role value" });
    }

    const member = await Team_member.findOne({
      where: { teamId: teamId, userId, role: "owner" },
    });
    if (!member)
      return res.status(403).json({ error: "Only owner can change roles" });

    const user = await Team_member.findOne({
      where: { teamId: teamId, userId: userIdToChange },
    });
    if (!user)
      return res
        .status(403)
        .json({ error: "User does not exist in this team" });

    user.role = role ?? user.role;
    await user.save();
    res.status(200).json({ message: "User's role changed", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//get all tasks for the team
const getTeamTasks = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.userId;

    const member = await Team_member.findOne({
      where: { teamId: teamId, userId: userId },
    });
    if (!member)
      return res.status(403).json({ error: "Not a member of this team" });

    const tasks = await Task.findAll({ where: { teamId: teamId } });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//add team task
const addTeamTask = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { title, description, completed, dueDate, priority, assignedUserId } =
      req.body;
    const userId = req.user.userId;

    const member = await Team_member.findOne({
      where: { teamId: teamId, userId: userId },
    });
    if (!member)
      return res.status(403).json({ error: "Not a member of this team" });

    let assignedUserName = null;

    if (assignedUserId) {
      const target = await Team_member.findOne({
        where: { teamId, userId: assignedUserId },
      });
      if (!target)
        return res
          .status(400)
          .json({ message: "Assigned user is not in this team" });

      const user = await User.findOne({ where: { userId: assignedUserId } });
      assignedUserName = user.username;
    }

    const task = await Task.create({
      title,
      description,
      completed,
      dueDate,
      priority,
      teamId,
      userId,
      assignedUserId,
      assignedUserName,
    });
    res.json({ message: "Task created!", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//edit team task
const editTeamTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const {
      title,
      description,
      completed,
      dueDate,
      priority,
      assignedUserId,
      assignedUserName,
    } = req.body;
    const userId = req.user.userId;

    const task = await Task.findOne({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const member = await Team_member.findOne({
      where: { teamId: task.teamId, userId, role: "owner" },
    });
    if (!member) return res.status(403).json({ error: "Forbidden" });

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.completed = completed ?? task.completed;
    task.dueDate = dueDate ?? task.dueDate;
    task.priority = priority ?? task.priority;
    task.assignedUserId = assignedUserId ?? task.assignedUserId;
    task.assignedUserName = assignedUserName ?? task.assignedUserName;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const editTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.userId;
    const { name, password } = req.body;

    const member = await Team_member.findOne({
      where: { teamId: teamId, userId, role: "owner" },
    });
    if (!member) return res.status(403).json({ error: "Forbidden" });

    const team = await Team.findOne({ where: { teamId } });
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (name) {
      team.name = name;
    }
    if (password) {
      team.passwordHashed = await bcrypt.hash(password, 10);
    }

    await team.save();
    res.status(200).json({ message: "Team info updated!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const editUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, password } = req.body;

    const user = await User.findOne({ where: { userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) {
      user.username = username;
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.status(200).json({ message: "User info updated!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//delete team task
const deleteTeamTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;

    const task = await Task.findOne({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const member = await Team_member.findOne({
      where: { teamId: task.teamId, userId, role: "owner" },
    });
    if (!member) return res.status(403).json({ error: "Forbidden" });

    const deleted = await Task.destroy({ where: { id: taskId } });
    if (!deleted) return res.status(404).json({ message: "Task not found!" });

    res.status(200).json({ message: "Task deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userToDeleteId = req.params.userId;
    const userId = req.user.userId;

    // allow a user to remove themself from a team, otherwise only an owner may remove others
    // coerce types because req.params are strings while token userId may be a number
    if (String(userToDeleteId) !== String(userId)) {
      const member = await Team_member.findOne({
        where: { teamId, userId, role: "owner" },
      });
      if (!member) return res.status(403).json({ error: "Forbidden" });
    }

    const team_member = await Team_member.findOne({
      where: { teamId: teamId, userId: userToDeleteId },
    });
    if (!team_member) return res.status(404).json({ error: "User not found" });

    await Team_member.destroy({
      where: { teamId: teamId, userId: userToDeleteId },
    });

    await Task.update(
      {
        assignedUserId: null,
        assignedUserName: null,
      },
      {
        where: {
          teamId: teamId,
          assignedUserId: userToDeleteId,
        },
      },
    );

    res.status(200).json({ message: "Team member deleted!" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

const getAllTeamMembers = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const team = await Team.findOne({ where: { teamId } });
    if (!team)
      return res.status(404).json({ ok: false, error: "Team not found" });

    const team_members = await Team_member.findAll({ where: { teamId } });
    const userIds = team_members.map((m) => m.userId);
    const users = await User.findAll({ where: { userId: userIds } });

    // merge role from team_members into user objects
    const membersWithRole = users.map((u) => {
      const membership = team_members.find((m) => m.userId === u.userId) || {};
      return {
        userId: u.userId,
        username: u.username,
        role: membership.role || "member",
      };
    });

    res.status(200).json({
      ok: true,
      users: membersWithRole,
      team: { teamId: team.teamId, teamCode: team.teamCode, name: team.name },
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user.userId;

    const team = await Team.findOne({ where: { teamId } });
    if (!team) return res.status(404).json({ error: "Team not found" });

    const owner = await Team_member.findOne({
      where: { teamId, userId, role: "owner" },
    });

    if (!owner)
      return res
        .status(403)
        .json({ error: "Only the owner can delete a team" });

    await Task.destroy({ where: { teamId } });

    await Team_member.destroy({ where: { teamId } });

    await Team.destroy({ where: { teamId } });

    res.status(200).json({ message: "Team deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export {
  createTeam,
  joinTeam,
  getTeamTasks,
  addTeamTask,
  editTeamTask,
  deleteTeamTask,
  deleteTeamMember,
  getAllTeamMembers,
  getAllTeamBoardsTheUserHas,
  getAllUsers,
  addUserToTeam,
  changeUserRole,
  deleteTeam,
  editTeam,
  editUser,
};
