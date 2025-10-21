import { Task } from "../models/Task.js";

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
    const { title, description, dueDate } = req.body;
    const task = await Task.create({ title, description, dueDate, userId: req.user.userId });
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: error.message });
  }
};

//edit task
const editTask = async (req, res) => {
  try {
  const { id } = req.params;
  const { title, description, completed, dueDate } = req.body;

  const task = await Task.findOne({ where: { id, userId: req.user.userId } });
  if (!task) return res.status(404).json({ message: "Task not found" });

  task.title = title ?? task.title;
  task.description = description ?? task.description;
  task.completed = completed ?? task.completed;
  task.dueDate = dueDate ?? task.dueDate;
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

export { getTask, addTask, editTask, deleteTask };
