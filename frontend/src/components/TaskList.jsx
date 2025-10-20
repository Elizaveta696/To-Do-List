import { useEffect, useState, useCallback } from "react";
import { fetchTasks, removeTask, updateTask } from "../api/tasks";
import TaskItem from "./TaskItem";

export default function TaskList({ token }) {
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
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdate = async (id, updates) => {
    const updated = await updateTask(id, updates);
    setTasks((t) => t.map((x) => (x.id === updated.id ? updated : x)));
  };

  const handleDelete = async (id) => {
    // optimistic UI: remove task locally first
    const prev = tasks;
    setTasks((t) => t.filter((x) => x.id !== id));
    try {
      await removeTask(id);
    } catch (e) {
      console.error("Failed to delete task, reloading list", e);
      // restore previous state or reload from server
      try {
        const data = await fetchTasks(token);
        setTasks(data);
      } catch (err) {
        // fallback: restore previous tasks if fetch fails
        setTasks(prev);
      }
    }
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
