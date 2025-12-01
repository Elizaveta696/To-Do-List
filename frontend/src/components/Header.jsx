import React from "react";
import { FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { FEATURE_FLAGS } from "../featureFlags";

export default function Header({ onLogout, onToggleNightMode, nightMode }) {
	return (
		<nav
			className={`sidebar${nightMode ? " night" : ""}`}
			aria-label="Main navigation"
		>
			<div className="sidebar-top">
				{/* navigation / brand area intentionally minimal */}
			</div>
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
