import { useEffect, useState, useCallback } from "react";
import { fetchTasks, removeTask, updateTask } from "../api/tasks";
import TaskItem from "./TaskItem";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdate = async (id, updates) => {
    const updated = await updateTask(id, updates);
    setTasks((t) => t.map((x) => (x.id === updated.id ? updated : x)));
  };

  const handleDelete = async (id) => {
    await removeTask(id);
    setTasks((t) => t.filter((x) => x.id !== id));
  };

  if (loading) return <div>Loading tasks…</div>;
  if (!tasks.length) return <div>No tasks yet</div>;

  return (
    <div className="tasks-container">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
