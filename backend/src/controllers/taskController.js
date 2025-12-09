import mongoSanitize from "mongo-sanitize";
import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { Task } from "../models/Task.js";
import { Team } from "../models/Team.js";
import { User } from "../models/User.js";

//get all
const getTask = async (req, res) => {
	try {
		const userId = req.user.userId;
		// Return tasks either created by the user OR assigned to the user
		const tasks = await Task.findAll({
			where: {
				[Op.or]: [{ userId }, { assignedUserId: userId }],
			},
			include: [
				{
					model: Team,
					attributes: ["teamId", "name"],
				},
			],
		});

		// Normalize response to include a top-level `teamName` for easier consumption by frontend
		const result = tasks.map((t) => {
			const plain = t.toJSON ? t.toJSON() : t;
			plain.teamName = plain.Team ? plain.Team.name : null;
			return plain;
		});

		res.status(200).json(result);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

//add task
const addTask = async (req, res) => {
	try {
		const { title, description, dueDate, priority, assignedUserId } = req.body;
		let assignedUserName = null;
		if (assignedUserId) {
			const user = await User.findOne({ where: { userId: assignedUserId } });
			if (user) assignedUserName = user.username;
		}
		const task = await Task.create({
			title,
			description,
			dueDate,
			priority,
			userId: req.user.userId,
			assignedUserId: assignedUserId || null,
			assignedUserName,
		});
		res.status(201).json(task);
	} catch (error) {
		console.error("Error creating task:", error);
		res.status(500).json({ message: error.message });
	}
};

//edit task
const editTask = async (req, res) => {
	try {
		const safeId = mongoSanitize(req.params.id);

		const {
			title,
			description,
			completed,
			dueDate,
			priority,
			assignedUserId,
			assignedUserName,
		} = req.body;

		const safeUserID = mongoSanitize(req.user.userId);

		const task = await Task.findOne({
			where: { id: safeId, userId: safeUserID },
		});
		if (!task) return res.status(404).json({ message: "Task not found" });

		task.title = title ?? task.title;
		task.description = description ?? task.description;
		task.completed = completed ?? task.completed;
		task.dueDate = dueDate ?? task.dueDate;
		task.priority = priority ?? task.priority;
		if (assignedUserId !== undefined) {
			// if provided, set or clear assigned user
			if (assignedUserId === null) {
				task.assignedUserId = null;
				task.assignedUserName = null;
			} else {
				// assigning to another user. If the current owner assigns to someone else,
				// transfer ownership only for personal tasks (no teamId). Team tasks should
				// retain their team ownership and only update assignedUser fields.
				if (Number(assignedUserId) !== Number(safeUserID) && !task.teamId) {
					// move ownership for personal task
					task.userId = assignedUserId;
					// clear assigned fields since it's now owned by that user
					task.assignedUserId = null;
					task.assignedUserName = null;
				} else {
					// assigning to self or editing assignment on a team task — set assigned user fields
					task.assignedUserId = assignedUserId;
					if (assignedUserName) {
						task.assignedUserName = assignedUserName;
					} else {
						const user = await User.findOne({
							where: { userId: assignedUserId },
						});
						task.assignedUserName = user
							? user.username
							: task.assignedUserName;
					}
				}
			}
		}
		await task.save();

		res.json(task);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

//delete task
const deleteTask = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Task.destroy({
			where: { id, userId: req.user.userId },
		});

		if (!deleted) return res.status(404).json({ message: "Task not found!" });

		res.status(200).json({ message: "Task deleted!" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

const healthCheck = async (req, res) => {
	res.status(200).json({ status: "ok", msage: "Server is running!!" });
};

const readyCheck = async (req, res) => {
	try {
		await sequelize.authenticate();
		res
			.status(200)
			.json({ status: "ok", message: "Database connection is successful!" });
	} catch (e) {
		console.error("Database readiness check failed: ", e.message);
		res.status(500).json({ status: "error", message: e.message });
	}
};

export { getTask, addTask, editTask, deleteTask, healthCheck, readyCheck };
