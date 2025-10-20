import { useState } from "react";

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return alert("Title required");
    try {
      setSaving(true);
      await onUpdate(task.id, {
        title: editTitle,
        description: editDescription,
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
        <form onSubmit={handleSave} className="task-form">
          <input
            className="input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <input
            className="input"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
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
        </form>
      ) : (
        <>
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
