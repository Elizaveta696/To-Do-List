import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiLogOut, FiMenu, FiMoon, FiSun } from "react-icons/fi";
import { FEATURE_FLAGS } from "../featureFlags";

export default function Header({
	onLogout,
	onToggleNightMode,
	nightMode,
	teamName = "My tasks",
}) {
	const [navOpen, setNavOpen] = useState(false);
	const [showTeams, setShowTeams] = useState(false);
	const [joinModalOpen, setJoinModalOpen] = useState(false);

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
							<button type="button" className="btn nav-panel-btn">
								Create new team
							</button>
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
