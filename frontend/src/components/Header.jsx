import React from "react";
import { FEATURE_FLAGS } from "../featureFlags";

export default function Header({
	teamName,
	onAddTask,
	onLogout,
	onToggleNightMode,
	nightMode,
}) {
	return (
		<nav
			className={`sidebar${nightMode ? " night" : ""}`}
			aria-label="Main navigation"
		>
			<div className="sidebar-top">
				<div className="brand">
					<span className="team-name">{teamName}</span>
				</div>
				<button type="button" className="btn btn-primary" onClick={onAddTask}>
					New Task
				</button>
			</div>
			<div className="sidebar-bottom">
				{FEATURE_FLAGS.lightThemeToggle && (
					<button
						type="button"
						className="btn btn-ghost theme-btn"
						onClick={onToggleNightMode}
						aria-label="Toggle night mode"
					>
						{nightMode ? "🌞" : "🌙"}
					</button>
				)}
				<button type="button" className="btn logout-btn" onClick={onLogout}>
					Logout
				</button>
			</div>
		</nav>
	);
}
