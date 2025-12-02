import { useCallback, useEffect, useState } from "react";
import { fetchTasks, removeTask, updateTask } from "../api/tasks";
import TaskItem from "./TaskItem";

export default function TaskList({ token, onAddTask }) {
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
      } catch (_err) {
        // fallback: restore previous tasks if fetch fails
        setTasks(prev);
      }
    }
  };

  if (loading) return <div>Loading tasks…</div>;

  // Group tasks by priority (high, medium, low)
  const groups = { high: [], medium: [], low: [] };
  tasks.forEach((t) => {
    const p = (t.priority || t.importance || "medium").toLowerCase();
    if (groups[p]) groups[p].push(t);
    else groups.medium.push(t);
  });

  return (
    <div className="tasks-columns">
      <div className="task-column column-high">
        <h3 className="column-title">High</h3>
        <div className="column-body">
          {groups.high.length === 0 && (
            <div className="empty-column">No high priority tasks</div>
          )}
          {groups.high.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <div className="task-column column-medium">
        <h3 className="column-title">Medium</h3>
        <div className="column-body">
          {groups.medium.length === 0 && (
            <div className="empty-column">No medium priority tasks</div>
          )}
          {groups.medium.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <div className="task-column column-low">
        <h3 className="column-title">Low</h3>
        <div className="column-body">
          {groups.low.length === 0 && (
            <div className="empty-column">No low priority tasks</div>
          )}
          {groups.low.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
