import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
	FiLogOut,
	FiMenu,
	FiMoon,
	FiSettings,
	FiSun,
	FiUser,
} from "react-icons/fi";
import { FEATURE_FLAGS } from "../featureFlags";

export default function Header({
	onLogout,
	onToggleNightMode,
	nightMode,
	teamName = "My tasks",
	onNavigate,
}) {
	const [navOpen, setNavOpen] = useState(false);
	const [showTeams, setShowTeams] = useState(false);
	const [joinModalOpen, setJoinModalOpen] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [newTeamName, setNewTeamName] = useState("");
	const [newTeamPassword, setNewTeamPassword] = useState("");

	return (
		<nav
			className={`sidebar${nightMode ? " night" : ""}`}
			aria-label="Main navigation"
		>
			<div className="sidebar-top">
				<button
					type="button"
					className="btn nav-expand-btn theme-btn icon-btn"
					aria-label="Expand navigation"
					aria-expanded={navOpen}
					aria-pressed={navOpen}
					title="Expand navigation"
					onClick={() => setNavOpen((v) => !v)}
				>
					<FiMenu />
				</button>
				{/* navigation / brand area intentionally minimal */}
			</div>
			{navOpen &&
				createPortal(
					<section
						className="nav-expand-panel"
						aria-label="Expanded navigation"
					>
						<div className="nav-actions">
							{/* Board area: label (go to tasks) and gear (go to settings) */}
							<div className="nav-panel-btn board-settings-group">
								<button
									type="button"
									className="btn board-label-btn"
									onClick={() => {
										onNavigate?.("tasks");
										setNavOpen(false);
									}}
									aria-label={`Open ${teamName} tasks`}
								>
									{teamName}
								</button>
								<button
									type="button"
									className="btn icon-btn board-icon-btn"
									onClick={() => {
										onNavigate?.("team-settings");
										setNavOpen(false);
									}}
									aria-label={`Open settings for ${teamName}`}
									title="Board settings"
								>
									<FiSettings />
								</button>
							</div>
							<button
								type="button"
								className="btn nav-panel-btn nav-expand-toggle"
								onClick={() => setShowTeams((v) => !v)}
								aria-expanded={showTeams}
							>
								List teams
								<span className="expand-indicator" aria-hidden="true" />
							</button>

							{showTeams && (
								<ul className="team-list">
									<li>
										<button
											type="button"
											className="btn nav-panel-btn team-item"
											onClick={() => {
												onNavigate?.("tasks");
												setNavOpen(false);
											}}
										>
											{teamName}
										</button>
									</li>
								</ul>
							)}

							<button
								type="button"
								className="btn nav-panel-btn"
								onClick={() => setJoinModalOpen(true)}
							>
								Join team
							</button>

							<button
								type="button"
								className="btn nav-panel-btn"
								onClick={() => setCreateModalOpen(true)}
							>
								Create new team
							</button>
						</div>
					</section>,
					document.body,
				)}
			{createModalOpen &&
				createPortal(
					<section
						className="modal-overlay"
						onClick={() => setCreateModalOpen(false)}
					>
						<div className="join-modal" onClick={(e) => e.stopPropagation()}>
							<button
								type="button"
								className="modal-close"
								onClick={() => setCreateModalOpen(false)}
								aria-label="Close"
							>
								×
							</button>
							<h3>Create new team</h3>
							<div className="modal-body">
								<label>
									Enter team name
									<input
										type="text"
										name="teamName"
										value={newTeamName}
										onChange={(e) => setNewTeamName(e.target.value)}
									/>
								</label>
								<label>
									Enter team password
									<input
										type="password"
										name="teamPassword"
										value={newTeamPassword}
										onChange={(e) => setNewTeamPassword(e.target.value)}
									/>
								</label>
								<label>
									Team ID (assigned automatically)
									<input
										type="text"
										name="teamId"
										value="(assigned automatically)"
										disabled
									/>
								</label>
							</div>
							<div className="modal-actions">
								<button
									type="button"
									className="btn"
									onClick={() => setCreateModalOpen(false)}
								>
									Cancel
								</button>
								<button
									type="button"
									className="btn btn-primary"
									onClick={() => {
										console.log("Create team", {
											name: newTeamName,
											password: newTeamPassword,
										});
										setCreateModalOpen(false);
									}}
								>
									Create
								</button>
							</div>
						</div>
					</section>,
					document.body,
				)}

			{joinModalOpen &&
				createPortal(
					<section
						className="modal-overlay"
						onClick={() => setJoinModalOpen(false)}
					>
						<div className="join-modal" onClick={(e) => e.stopPropagation()}>
							<button
								type="button"
								className="modal-close"
								onClick={() => setJoinModalOpen(false)}
								aria-label="Close"
							>
								×
							</button>
							<h3>Join team</h3>
							<div className="modal-body">
								<label>
									Enter team ID
									<input type="text" name="teamId" />
								</label>
								<label>
									Enter password
									<input type="password" name="teamPassword" />
								</label>
							</div>
							<div className="modal-actions">
								<button
									type="button"
									className="btn"
									onClick={() => setJoinModalOpen(false)}
								>
									Cancel
								</button>
								<button
									type="button"
									className="btn btn-primary"
									onClick={() => {
										/* No backend logic for now */
										console.log("Join clicked");
									}}
								>
									Join
								</button>
							</div>
						</div>
					</section>,
					document.body,
				)}
			<div className="sidebar-bottom">
				{FEATURE_FLAGS.lightThemeToggle && (
					<button
						type="button"
						className="btn btn-ghost theme-btn icon-btn"
						onClick={onToggleNightMode}
						aria-label="Toggle night mode"
						title={nightMode ? "Switch to light" : "Switch to dark"}
					>
						{nightMode ? <FiSun /> : <FiMoon />}
					</button>
				)}
				{/* Person / profile button (navigates to user settings) */}
				<button
					type="button"
					className="btn person-btn icon-btn"
					aria-label="Profile"
					title="Profile"
					onClick={() => {
						onNavigate?.("user-settings");
						setNavOpen(false);
					}}
				>
					<FiUser />
				</button>
				<button
					type="button"
					className="btn logout-btn icon-btn"
					onClick={onLogout}
					aria-label="Logout"
					title="Logout"
				>
					<FiLogOut />
				</button>
			</div>
		</nav>
	);
}
