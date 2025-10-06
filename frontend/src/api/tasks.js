export const fetchTasks = async () => {
	const res = await fetch("/api/tasks");
	if (!res.ok) throw new Error("Failed to fetch tasks");
	return res.json();
};

export const createTask = async (task) => {
	const res = await fetch("/api/tasks", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(task),
	});
	if (!res.ok) throw new Error("Failed to create task");
	return res.json();
};

export const updateTask = async (id, updates) => {
	const res = await fetch(`/api/tasks/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(updates),
	});
	if (!res.ok) throw new Error("Failed to update task");
	return res.json();
};

export const removeTask = async (id) => {
	const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
	if (!res.ok) throw new Error("Failed to delete task");
	return res.json();
};
