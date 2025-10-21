import { useState } from "react";
import { createTask } from "../api/tasks";

export default function TaskForm({ token, onCreated, onClose }) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [loading, setLoading] = useState(false);

	const submit = async (e) => {
		e.preventDefault();
		if (!title.trim()) return alert("Title required");
		try {
			setLoading(true);
			const newTask = await createTask({ title, description, dueDate: dueDate || null });
			setTitle("");
			setDescription("");
			setDueDate("");
			if (onCreated) onCreated(newTask);
		} catch (e) {
			console.error(e);
			alert("Failed to create task");
		} finally {
			setLoading(false);
		}
	};

	return (
	<form className="task-form" onSubmit={submit}>
			<div>
				<input
					className="input"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Title"
				/>
			</div>
			<div>
				<input
					className="input"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Description"
				/>
			</div>
			<div>
				<input
					className="input"
					type="date"
					value={dueDate}
					onChange={(e) => setDueDate(e.target.value)}
					placeholder="Due Date"
				/>
			</div>
			<div className="form-actions">
				<button className="btn btn-primary" type="submit" disabled={loading}>
					{loading ? "Saving…" : "Add Task"}
				</button>
				<button className="btn btn-ghost" type="button" onClick={() => onClose?.()}>
					Cancel
				</button>
			</div>
		</form>
	);
}
