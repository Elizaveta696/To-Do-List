import { Task } from "../models/Task.js";
import { sequelize } from "../config/db.js";
import mongoSanitize from 'mongo-sanitize';

//get all
const getTask = async (req, res) => {
    try {
        const tasks = await Task.findAll({ where: { userId: req.user.userId } });
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

//add task
const addTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    const task = await Task.create({ title, description, dueDate, priority, userId: req.user.userId });
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

  const { title, description, completed, dueDate, priority } = req.body;

  const safeUserID = mongoSanitize(req.user.userId);

  const task = await Task.findOne({ where: { id: safeId, userId: safeUserID } });
  if (!task) return res.status(404).json({ message: "Task not found" });

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

//delete task
const deleteTask = async(req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.destroy({ where: { id, userId: req.user.userId } });

    if (!deleted) return res.status(404).json({ message: "Task not found!" });

    res.status(200).json({ message: "Task deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

const healthCheck = async(req, res) => {
  res.status(200).json({status:"ok", msage:"Server is running!!"})
}

const readyCheck = async(req, res) => {
  try{
    await sequelize.authenticate();
    res.status(200).json({ status: "ok", message: "Database connection is successful!"})
  }catch (e) {
    console.error("Database readiness check failed: ", e.message);
    res.status(500).json({ status: "error", message: e.message})
  }
}

export { getTask, addTask, editTask, deleteTask, healthCheck, readyCheck };
