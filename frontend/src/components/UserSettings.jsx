import React, { useEffect, useId, useMemo, useState } from "react";
import {
	editUser,
	fetchAllUsers,
	fetchTeams,
	removeTeamMember,
} from "../api/teams.js";

function parseJwt(token) {
	try {
		const payload = token.split(".")[1];
		const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
		return JSON.parse(decodeURIComponent(escape(decoded)));
	} catch {
		return null;
	}
}

export default function UserSettings({ onNavigate }) {
	const idUsername = useId();
	const idPassword = useId();

	const [username, setUsername] = useState("current-user");
	const [password, setPassword] = useState("");

	const initialTeams = useMemo(
		() => [{ id: null, name: "My tasks", code: null, default: true }],
		[],
	);
	const [teams, setTeams] = useState(initialTeams);
	const initialUsername = useMemo(() => "current-user", []);
	const [currentUserId, setCurrentUserId] = useState(null);

	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [removeConfirm, setRemoveConfirm] = useState(null);

	function handleSave() {
		// frontend-only placeholder behavior
		// only send password to backend (username cannot be changed here)
		if (!password) {
			alert("No changes to save");
			return;
		}

		editUser({ password })
			.then(() => {
				setPassword("");
				alert("Profile saved");
			})
			.catch((err) => {
				console.error(err);
				alert("Failed to save: " + err.message);
			});
	}

	function handleCancelChanges() {
		// revert to the initial values captured on mount
		setUsername(initialUsername);
		setPassword("");
		setTeams(initialTeams);
	}

	function removeTeam(id) {
		const team = teams.find((x) => x.id === id);
		if (!team) return;
		// prevent removing the default board
		if (team.default || !team.id) return;
		setRemoveConfirm({ id: team.id, name: team.name });
	}

	async function _confirmRemoveTeam() {
		if (!removeConfirm) return;
		try {
			// remove membership via API
			const userId = currentUserId;
			await removeTeamMember(removeConfirm.id, userId);
			setTeams((t) => t.filter((x) => x.id !== removeConfirm.id));
			setRemoveConfirm(null);
		} catch (err) {
			console.error(err);
			alert("Failed to remove from team: " + (err.message || err));
		}
	}

	useEffect(() => {
		// load teams from API and prepend the default 'My tasks'
		(async () => {
			try {
				const res = await fetchTeams();
				if (res.ok && Array.isArray(res.data.teams)) {
					const remote = res.data.teams.map((t) => ({
						id: t.teamId,
						name: t.name,
						code: t.teamCode,
					}));
					setTeams((prev) => [...prev.filter((p) => p.default), ...remote]);
				}
			} catch (e) {
				console.error("Failed to fetch teams", e);
			}

			// derive current user id from token and fetch username
			try {
				const token = localStorage.getItem("token");
				const payload = parseJwt(token);
				const userId = payload?.userId;
				setCurrentUserId(userId ?? null);
				if (userId) {
					const all = await fetchAllUsers();
					const found = Array.isArray(all)
						? all.find((u) => u.userId === userId)
						: (all.users || []).find((u) => u.userId === userId);
					if (found) setUsername(found.username);
				}
			} catch (e) {
				console.error("Failed to fetch username", e);
			}
		})();
	}, []);

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
			<div className="settings-row">
				<label htmlFor={idUsername}>Username</label>
				<div className="settings-value">
					<input id={idUsername} type="text" value={username} disabled />
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
					<div className="teams-grid-head">Join code</div>
					{teams.map((t) => (
						<React.Fragment key={t.id}>
							<div className="teams-grid-name">{t.name}</div>
							<div className="teams-grid-id">
								<span className="team-id-value">{t.code || "—"}</span>
								<span className="id-actions">
									{!t.default && t.id && (
										<button
											type="button"
											className="btn-icon remove-user-btn"
											onClick={() => removeTeam(t.id)}
											aria-label={`Leave ${t.name}`}
											title={`Leave ${t.name}`}
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
									)}
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
				<section className="modal-overlay">
					<div className="join-modal" role="dialog" aria-modal="true">
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
				<section className="modal-overlay">
					<div className="join-modal" role="dialog" aria-modal="true">
						<h3>Leave team</h3>
						<div className="modal-body">
							<p>
								Are you sure you want to leave{" "}
								<strong>{removeConfirm.name}</strong>?
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
								onClick={() => _confirmRemoveTeam()}
							>
								Yes, leave
							</button>
						</div>
					</div>
				</section>
			)}
		</section>
	);
}
