import { useState } from "react";
import { createTask } from "../api/tasks";

export default function TaskForm({ onCreated }) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);

	const submit = async (e) => {
		e.preventDefault();
		if (!title.trim()) return alert("Title required");
		try {
			setLoading(true);
			const newTask = await createTask({ title, description });
			setTitle("");
			setDescription("");
			if (onCreated) onCreated(newTask);
		} catch (e) {
			console.error(e);
			alert("Failed to create task");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={submit} style={{ marginBottom: 16 }}>
			<div>
				<input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Title"
				/>
			</div>
			<div>
				<input
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Description"
				/>
			</div>
			<button type="submit" disabled={loading}>
				{loading ? "Saving…" : "Add Task"}
			</button>
		</form>
	);
}
