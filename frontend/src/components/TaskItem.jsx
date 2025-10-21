import { useState } from "react";

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");
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
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    await onUpdate(task.id, { completed: !task.completed });
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
            <input
              className="input"
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              placeholder="Due Date"
            />
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
          <h3 className={`task-title ${task.completed ? "task-completed" : ""}`}>
            {task.title}
          </h3>
          <p className="task-description">{task.description}</p>
          {task.dueDate && (
            <p className="task-due-date">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
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
