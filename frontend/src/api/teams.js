const resolveBase = () => {
	const builtBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
	if (
		typeof window !== "undefined" &&
		window.location.hostname !== "localhost" &&
		builtBase.includes("localhost")
	) {
		return "";
	}
	return builtBase || "";
};

export async function createTeam(name, password) {
	const token = localStorage.getItem("token");

	const response = await fetch(`${resolveBase()}/api/teams`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ name, password }),
	});

	const data = await response.json();
	return { ok: response.ok, data };
}

export async function fetchTeams() {
	const token = localStorage.getItem("token");
	const res = await fetch(`${resolveBase()}/api/teams/all`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});
	const data = await res.json();
	return { ok: res.ok, data };
}

export async function joinTeam(teamCode, password) {
	const token = localStorage.getItem("token");
	const res = await fetch(`${resolveBase()}/api/teams/join`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ teamCode, password }),
	});
	const data = await res.json();
	return { ok: res.ok, data };
}

export const createTeamTask = async ({
	teamId,
	title,
	description,
	completed = false,
	dueDate,
	priority,
	assignedUserId,
}) => {
	const base = resolveBase();
	const token = localStorage.getItem("token");

	if (!teamId) throw new Error("teamId is required to create a task");

	const res = await fetch(`${base}/api/teams/${teamId}/tasks`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			title,
			description,
			completed,
			dueDate,
			priority,
			assignedUserId,
		}),
	});

	if (!res.ok) {
		const errorData = await res.json();
		throw new Error(errorData.message || "Failed to create task");
	}

	return res.json();
};

export const fetchTeamMembers = async (teamId) => {
	if (!teamId) throw new Error("teamId is required");
	const base = resolveBase();
	const token = localStorage.getItem("token");

	const res = await fetch(`${base}/api/teams/${teamId}/members`, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) {
		const errorData = await res.json();
		throw new Error(errorData.message || "Failed to fetch team members");
	}

	const data = await res.json();
	return data.users;
};

export const fetchTeamTasks = async (teamId) => {
	if (!teamId) throw new Error("teamId is required");
	const base = resolveBase();
	const token = localStorage.getItem("token");

	const res = await fetch(`${base}/api/teams/${teamId}/tasks`, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) {
		const errorData = await res.json();
		throw new Error(errorData.message || "Failed to fetch team tasks");
	}

	return res.json();
};

export const updateTask = async (teamId, taskId, updates) => {
	const base = resolveBase();
	const token = localStorage.getItem("token");
	const res = await fetch(`${base}/api/teams/${teamId}/tasks/${taskId}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(updates),
	});
	if (!res.ok) throw new Error("Failed to update task");
	return res.json();
};

export const removeTask = async (teamId, taskId) => {
	const base = resolveBase();
	const token = localStorage.getItem("token");
	const res = await fetch(
		`${base}/api/teams/${teamId}/tasks/delete/${taskId}`,
		{
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);
	if (!res.ok) throw new Error("Failed to delete task");
	return res.json();
};
