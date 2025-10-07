import {Task} from '../models/Task.js';

//get all
const getTask = async (req, res) => {
    try {
        const tasks = await Task.findAll();
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

//add task
const addTask = async (req, res) => {
    try {
        const { title, description } = req.body;
        const task = await Task.create({ title, description });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//edit task
const editTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: "Task not found!" });

    await task.update(req.body);
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

//delete task
const deleteTask = async(req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: "Task not found!" });

    await task.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

export { getTask, addTask, editTask, deleteTask};