import React, { useId, useState } from "react";

export default function TeamSettings({
	teamId = "(unknown)",
	teamName = "My tasks",
	onChangeName,
}) {
	const [name, setName] = useState(teamName);
	const [password, setPassword] = useState("");

	const [users, setUsers] = useState([
		{ id: 1, name: "Alice", role: "admin" },
		{ id: 2, name: "Bob", role: "contributor" },
		{ id: 3, name: "Eve", role: "contributor" },
	]);

	function updateRole(id, newRole) {
		setUsers((u) =>
			u.map((usr) => (usr.id === id ? { ...usr, role: newRole } : usr)),
		);
	}

	function handleSave() {
		console.log("Save team settings", { teamId, name, password, users });
		if (onChangeName) onChangeName(name);
		setPassword("");
		alert("Settings saved (frontend-only)");
	}

	function handleDelete() {
		if (
			!window.confirm(
				"Delete this team? This cannot be undone (frontend-only).",
			)
		)
			return;
		console.log("Team deleted (frontend-only)", teamId);
		alert("Team deleted (frontend-only)");
	}

	const idTeam = useId();
	const idName = useId();
	const idPassword = useId();

	return (
		<section className="settings-panel">
			<h2>Team settings</h2>

			<div className="settings-row">
				<label htmlFor="team-id">Team ID</label>
				<div className="settings-value">
					<input id={idTeam} type="text" value={teamId} readOnly />
				</div>
			</div>

			<div className="settings-row">
				<label htmlFor="team-name">Change team name</label>
				<div className="settings-value">
					<input
						id={idName}
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
				</div>
			</div>

			<div className="settings-row">
				<label htmlFor="team-password">Change password</label>
				<div className="settings-value">
					<input
						id={idPassword}
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
			</div>

			<div className="settings-users">
				<h3>Team members</h3>
				<div className="users-grid">
					<div className="users-grid-head">User</div>
					<div className="users-grid-head">Role</div>
					{users.map((u) => (
						<React.Fragment key={u.id}>
							<div className="users-grid-user">{u.name}</div>
							<div className="users-grid-role">
								<select
									value={u.role}
									onChange={(e) => updateRole(u.id, e.target.value)}
								>
									<option value="admin">Admin</option>
									<option value="contributor">Contributor</option>
								</select>
							</div>
						</React.Fragment>
					))}
				</div>
			</div>

			<div className="settings-actions">
				<button className="btn" type="button" onClick={handleSave}>
					Save changes
				</button>
				<button className="btn btn-danger" type="button" onClick={handleDelete}>
					Delete team
				</button>
			</div>
		</section>
	);
}
