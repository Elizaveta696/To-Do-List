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
	const [removeConfirm, setRemoveConfirm] = useState(null);
	const [newUserName, setNewUserName] = useState("");
	const [newUserRole, setNewUserRole] = useState("contributor");

	function updateRole(id, newRole) {
		setUsers((u) =>
			u.map((usr) => (usr.id === id ? { ...usr, role: newRole } : usr)),
		);
	}

	function removeUser(id) {
		setUsers((u) => u.filter((usr) => usr.id !== id));
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

	function addUser() {
		const name = newUserName.trim();
		if (!name) return;
		const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
		setUsers((u) => [...u, { id: nextId, name, role: newUserRole }]);
		setNewUserName("");
		setNewUserRole("contributor");
	}

	const idTeam = useId();
	const idName = useId();
	const idPassword = useId();

	return (
		<section className="settings-panel">
			<h2>Team Settings</h2>{" "}
			<div className="settings-row">
				<label htmlFor={idTeam}>Team ID</label>
				<div className="settings-value">
					<input id={idTeam} type="text" value={teamId} readOnly />
				</div>
			</div>
			<div className="settings-row">
				<label htmlFor={idName}>Change team name</label>
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
				<label htmlFor={idPassword}>Change password</label>
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
								<div className="role-with-actions">
									<select
										value={u.role}
										onChange={(e) => updateRole(u.id, e.target.value)}
									>
										<option value="admin">Admin</option>
										<option value="contributor">Contributor</option>
									</select>
									<button
										type="button"
										className="btn-icon remove-user-btn"
										onClick={() => setRemoveConfirm({ id: u.id, name: u.name })}
										aria-label={`Remove ${u.name}`}
										title={`Remove ${u.name}`}
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<title>{`Remove ${u.name}`}</title>
											<path
												d="M3 6h18"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M10 11v6"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M14 11v6"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</button>
								</div>
							</div>
						</React.Fragment>
					))}

					{removeConfirm && (
						<section className="modal-overlay">
							<div className="join-modal" role="dialog" aria-modal="true">
								<h3>Remove user</h3>
								<div className="modal-body">
									<p>
										Are you sure you want to remove{" "}
										<strong>{removeConfirm.name}</strong> from the team?
									</p>
								</div>
								<div className="modal-actions">
									<button
										type="button"
										className="btn"
										onClick={() => setRemoveConfirm(null)}
									>
										No
									</button>
									<button
										type="button"
										className="btn btn-danger"
										onClick={() => {
											removeUser(removeConfirm.id);
											setRemoveConfirm(null);
										}}
									>
										Yes
									</button>
								</div>
							</div>
						</section>
					)}

					{/* Add-user row: input under User, select + Add button under Role */}
					<React.Fragment>
						<div className="users-grid-user">
							<input
								type="text"
								className="add-user-input"
								placeholder="New user name"
								value={newUserName}
								onChange={(e) => setNewUserName(e.target.value)}
							/>
						</div>
						<div className="users-grid-role">
							<div className="add-user-actions">
								<select
									value={newUserRole}
									onChange={(e) => setNewUserRole(e.target.value)}
								>
									<option value="admin">Admin</option>
									<option value="contributor">Contributor</option>
								</select>
								<button
									type="button"
									className="btn"
									onClick={addUser}
									disabled={!newUserName.trim()}
								>
									Add user
								</button>
							</div>
						</div>
					</React.Fragment>
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
				<section className="modal-overlay">
					<div className="join-modal" role="dialog" aria-modal="true">
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
