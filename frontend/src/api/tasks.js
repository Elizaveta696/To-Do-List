const API_URL = "http://localhost:3000/api/tasks";

export const fetchTasks = async () => {
	const token = localStorage.getItem("token");
	const res = await fetch(API_URL, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error("Failed to fetch tasks");
	return res.json();
};

export const createTask = async (task) => {
	const token = localStorage.getItem("token");
	const res = await fetch(API_URL, {
		method: "POST",
		headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`, //  send JWT
		},
		body: JSON.stringify(task),
	});
	if (!res.ok) throw new Error("Failed to create task");
	return res.json();
};

export const updateTask = async (id, updates) => {
	const token = localStorage.getItem("token");
	const res = await fetch(`${API_URL}/${id}`, {
		method: "PUT",
		headers: { 
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`, // send JWT
		},
		body: JSON.stringify(updates),
	});
	if (!res.ok) throw new Error("Failed to update task");
	return res.json();
};

export const removeTask = async (id) => {
	const token = localStorage.getItem("token");
	const res = await fetch(`${API_URL}/${id}`, { 
		method: "DELETE",
		headers: { Authorization: `Bearer ${token}`, // send JWT
		},
	});
	if (!res.ok) throw new Error("Failed to delete task");
	return res.json();
};
