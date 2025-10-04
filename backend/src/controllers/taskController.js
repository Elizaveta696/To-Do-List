import {Task} from '../models/Task.js';

//get all
const getTask = async (req, res) => {
    const tasks = await Task.findAll();
    res.json(tasks);
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
    const {id} = req.params;
    const task = await Task.findByPK(id);
    if (!task) return res.status(404).json({message: 'Task not found!'});

    await task.update(req.body);
    res.json(task);
}

//delete task
const deleteTask = async(req, res) => {
    const { id } = req.params;
    const task = await Task.findByPK(id);
    if (!task) return res.status(404).json({message: 'Task not found!'});

    await task.destroy();
    res.json({message: 'Task deleted!!'});
}

export { getTask, addTask, editTask, deleteTask};