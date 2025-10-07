import { useCallback, useEffect, useState } from "react";
import { fetchTasks, removeTask, updateTask } from "../api/tasks";

export default function TaskList() {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);

	// editing state
	const [editingId, setEditingId] = useState(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editLoading, setEditLoading] = useState(false);

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

	const toggleComplete = async (task) => {
		try {
			const updated = await updateTask(task.id, { completed: !task.completed });
			setTasks((t) => t.map((x) => (x.id === updated.id ? updated : x)));
		} catch (e) {
			console.error(e);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm("Delete this task?")) return;
		try {
			await removeTask(id);
			setTasks((t) => t.filter((x) => x.id !== id));
		} catch (e) {
			console.error(e);
		}
	};

	const startEdit = (task) => {
		setEditingId(task.id);
		setEditTitle(task.title || "");
		setEditDescription(task.description || "");
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditTitle("");
		setEditDescription("");
	};

	const submitEdit = async (e) => {
		e.preventDefault();
		if (!editingId) return;
		if (!editTitle.trim()) return alert("Title required");
		try {
			setEditLoading(true);
			const updated = await updateTask(editingId, {
				title: editTitle,
				description: editDescription,
			});
			setTasks((t) => t.map((x) => (x.id === updated.id ? updated : x)));
			cancelEdit();
		} catch (err) {
			console.error(err);
			alert("Failed to save changes");
		} finally {
			setEditLoading(false);
		}
	};

	if (loading) return <div>Loading tasks…</div>;
	if (!tasks.length) return <div>No tasks yet</div>;

	return (
		<div className="tasks-container">
			{tasks.map((task) => (
				<article className="task-card" key={task.id}>
					{editingId === task.id ? (
						<form className="task-form" onSubmit={submitEdit}>
							<div>
								<input
									className="input"
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
									placeholder="Title"
								/>
							</div>
							<div>
								<input
									className="input"
									value={editDescription}
									onChange={(e) => setEditDescription(e.target.value)}
									placeholder="Description"
								/>
							</div>
							<div>
								<button
									className="btn btn-primary"
									type="submit"
									disabled={editLoading}
								>
									{editLoading ? "Saving…" : "Save"}
								</button>
								<button
									className="btn btn-ghost"
									type="button"
									onClick={cancelEdit}
									style={{ marginLeft: 8 }}
								>
									Cancel
								</button>
							</div>
						</form>
					) : (
						<>
							<h3
								className={`task-title ${task.completed ? "task-completed" : ""}`}
							>
								{task.title}
							</h3>

							<div className="task-description">{task.description}</div>
							<div className="task-controls">
								<button
									className="btn btn-primary"
									type="button"
									onClick={() => toggleComplete(task)}
								>
									{task.completed ? "Undo" : "Complete"}
								</button>
								<button
									className="btn"
									type="button"
									onClick={() => startEdit(task)}
								>
									Edit
								</button>
								<button
									className="btn btn-ghost"
									type="button"
									onClick={() => handleDelete(task.id)}
								>
									Delete
								</button>
							</div>
						</>
					)}
				</article>
			))}
		</div>
	);
}
