import React, { useId, useMemo, useState } from "react";

export default function UserSettings({ onNavigate }) {
	const idUsername = useId();
	const idPassword = useId();

	const [username, setUsername] = useState(
		() => localStorage.getItem("username") || "current-user",
	);
	const [password, setPassword] = useState("");

	const initialTeams = useMemo(
		() => [
			{ id: "TEAM-12345", name: "My tasks" },
			{ id: "TEAM-67890", name: "Design" },
		],
		[],
	);
	const [teams, setTeams] = useState(initialTeams);
	const initialUsername = useMemo(
		() => localStorage.getItem("username") || "current-user",
		[],
	);

	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [removeConfirm, setRemoveConfirm] = useState(null);

	function handleSave() {
		// frontend-only placeholder behavior
		localStorage.setItem("username", username);
		setPassword("");
		alert("Profile saved (frontend-only)");
	}

	function handleCancelChanges() {
		// revert to the initial values captured on mount
		setUsername(initialUsername);
		setPassword("");
		setTeams(initialTeams);
	}

	function removeTeam(id) {
		// open modal confirmation (frontend-only)
		const team = teams.find((x) => x.id === id);
		if (!team) return;
		setRemoveConfirm({ id: team.id, name: team.name });
	}

	function confirmRemoveTeam() {
		if (!removeConfirm) return;
		setTeams((t) => t.filter((x) => x.id !== removeConfirm.id));
		setRemoveConfirm(null);
	}

	function handleDeleteConfirmed() {
		// frontend-only placeholder behavior
		console.log("Account deleted (frontend-only)");
		setConfirmDeleteOpen(false);
		alert("Account deleted (frontend-only)");
		// navigate to login page
		onNavigate?.("login");
	}

	return (
		<section className="settings-panel">
			<h2>User Settings</h2>

			<div className="settings-row">
				<label htmlFor={idUsername}>Username</label>
				<div className="settings-value">
					<input
						id={idUsername}
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
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
				<div className="danger-label">Delete account</div>
				<div className="settings-value">
					<button
						className="btn btn-danger"
						type="button"
						onClick={() => setConfirmDeleteOpen(true)}
					>
						Delete account
					</button>
				</div>
			</div>
			<div className="settings-users">
				<h3>Your teams</h3>
				<div className="teams-grid">
					<div className="teams-grid-head">Name</div>
					<div className="teams-grid-head">ID</div>
					{teams.map((t) => (
						<React.Fragment key={t.id}>
							<div className="teams-grid-name">{t.name}</div>
							<div className="teams-grid-id">
								<span className="team-id-value">{t.id}</span>
								<span className="id-actions">
									<button
										type="button"
										className="btn-icon remove-user-btn"
										onClick={() => removeTeam(t.id)}
										aria-label={`Remove ${t.name}`}
										title={`Remove ${t.name}`}
									>
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<title>Remove team</title>
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
								</span>
							</div>
						</React.Fragment>
					))}
				</div>
			</div>

			<div className="settings-actions">
				<button className="btn" type="button" onClick={handleCancelChanges}>
					Cancel changes
				</button>
				<button className="btn btn-primary" type="button" onClick={handleSave}>
					Save changes
				</button>
			</div>

			{confirmDeleteOpen && (
				<section
					className="modal-overlay"
					onClick={() => setConfirmDeleteOpen(false)}
				>
					<div className="join-modal" onClick={(e) => e.stopPropagation()}>
						<h3>Delete account</h3>
						<div className="modal-body">
							<p>
								Are you sure you want to delete your account? This is
								irreversible.
							</p>
						</div>
						<div className="modal-actions">
							<button
								type="button"
								className="btn"
								onClick={() => setConfirmDeleteOpen(false)}
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

			{removeConfirm && (
				<section
					className="modal-overlay"
					onClick={() => setRemoveConfirm(null)}
				>
					<div className="join-modal" onClick={(e) => e.stopPropagation()}>
						<h3>Remove team</h3>
						<div className="modal-body">
							<p>
								Are you sure you want to remove{" "}
								<strong>{removeConfirm.name}</strong> from your teams?
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
									setTeams((t) => t.filter((x) => x.id !== removeConfirm.id));
									setRemoveConfirm(null);
								}}
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
