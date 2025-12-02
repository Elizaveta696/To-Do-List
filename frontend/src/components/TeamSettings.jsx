import React, { useId, useMemo, useState } from "react";

export default function TeamSettings({
	teamId = "(unknown)",
	teamName = "My tasks",
	onChangeName,
	onNavigate,
}) {
	const [name, setName] = useState(teamName);
	const [password, setPassword] = useState("");

	const initialUsers = useMemo(
		() => [
			{ id: 1, name: "Alice", role: "admin" },
			{ id: 2, name: "Bob", role: "contributor" },
			{ id: 3, name: "Eve", role: "contributor" },
		],
		[],
	);

	const [users, setUsers] = useState(initialUsers);
	const [confirmOpen, setConfirmOpen] = useState(false);

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

	function handleDeleteConfirmed() {
		console.log("Team deleted (frontend-only)", teamId);
		setConfirmOpen(false);
		alert("Team deleted (frontend-only)");
	}

	function handleCancel() {
		// revert to the initial values (frontend-only)
		setName(teamName);
		setPassword("");
		setUsers(initialUsers);
	}

	const idTeam = useId();
	const idName = useId();
	const idPassword = useId();

	return (
		<section className="settings-panel">
			<h2>Team settings</h2>
			<div className="settings-team-title">
				<button
					type="button"
					className="btn-plain settings-team-name"
					onClick={() => onNavigate?.("tasks")}
					title="Back to tasks"
				>
					{teamName}
				</button>
			</div>

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

			<div className="settings-row">
				<div className="danger-label">Delete team</div>
				<div className="settings-value">
					<button
						className="btn btn-danger"
						type="button"
						onClick={() => setConfirmOpen(true)}
					>
						Delete team
					</button>
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
				<button className="btn" type="button" onClick={handleCancel}>
					Cancel changes
				</button>
				<button className="btn btn-primary" type="button" onClick={handleSave}>
					Save changes
				</button>
			</div>

			{confirmOpen && (
				<section
					className="modal-overlay"
					onClick={() => setConfirmOpen(false)}
				>
					<div className="join-modal" onClick={(e) => e.stopPropagation()}>
						<h3>Delete team</h3>
						<div className="modal-body">
							<p>Are you sure you want to delete this team?</p>
						</div>
						<div className="modal-actions">
							<button
								type="button"
								className="btn"
								onClick={() => setConfirmOpen(false)}
							>
								No
							</button>
							<button
								type="button"
								className="btn btn-danger"
								onClick={handleDeleteConfirmed}
							>
								Yes
							</button>
						</div>
					</div>
				</section>
			)}
		</section>
	);
}
