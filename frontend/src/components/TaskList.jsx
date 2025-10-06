import { useCallback, useEffect, useState } from "react";
import { fetchTasks, removeTask, updateTask } from "../api/tasks";

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

	if (loading) return <div>Loading tasks…</div>;
	if (!tasks.length) return <div>No tasks yet</div>;

	return (
		<ul>
			{tasks.map((task) => (
				<li key={task.id} style={{ marginBottom: 8 }}>
					<strong
						style={{ textDecoration: task.completed ? "line-through" : "none" }}
					>
						{task.title}
					</strong>
					<div>{task.description}</div>
					<div>
						<button type="button" onClick={() => toggleComplete(task)}>
							{task.completed ? "Undo" : "Complete"}
						</button>
						<button
							type="button"
							onClick={() => handleDelete(task.id)}
							style={{ marginLeft: 8 }}
						>
							Delete
						</button>
					</div>
				</li>
			))}
		</ul>
	);
}
