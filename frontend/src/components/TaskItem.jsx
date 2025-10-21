import { useState } from "react";

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");
  const [editPriority, setEditPriority] = useState(task.priority || task.importance || "medium");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return alert("Title required");
    try {
      setSaving(true);
      await onUpdate(task.id, {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate || null,
        priority: editPriority,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    await onUpdate(task.id, { completed: !task.completed });
  };

  // Color mapping for priority
  const priorityColors = {
    high: "#e53935", // red
    medium: "#fbc02d", // yellow
    low: "#43a047", // green
  };

  return (
    <article className="task-card">
      {editing ? (
        <form onSubmit={handleSave} className="task-form" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 10}}>
            <input
              className="input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
            />
            <input
              className="input"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
            />
            <div>
              <label>Due Date:</label>
              <input
                className="input"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                placeholder="Due Date"
              />
            </div>
            <div>
              <label>Priority:</label>
              <select className="input" value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="form-actions" style={{marginTop: 'auto'}}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
            <span style={{ color: priorityColors[task.priority || task.importance] || "#333", fontWeight: "bold", fontSize: 14 }}>
              Priority: {(task.priority || task.importance) ? (task.priority || task.importance).charAt(0).toUpperCase() + (task.priority || task.importance).slice(1) : "Medium"}
            </span>
            {task.dueDate && (
              <span className="task-due-date" style={{ fontSize: 14 }}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className={`task-title ${task.completed ? "task-completed" : ""}`}>
            {task.title}
          </h3>
          <p className="task-description">{task.description}</p>
          <div className="task-controls">
            <button className="btn btn-primary" onClick={handleToggle}>
              {task.completed ? "Undo" : "Complete"}
            </button>
            <button className="btn" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn btn-ghost" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </article>
  );
}
