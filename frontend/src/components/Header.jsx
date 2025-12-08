import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createTeam, fetchTeams, joinTeam } from "../api/teams.js"
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
  const [message, setMessage] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamCodeInput, setTeamCodeInput] = useState("");
  const [teamPasswordInput, setTeamPasswordInput] = useState("");

  useEffect(() => {
    const loadTeams = async () => {
      const res = await fetchTeams();

      console.log("TEAMS RESPONSE:", res.data);

      if (res.ok && Array.isArray(res.data.teams)) {
        setTeams(res.data.teams);
      } else {
        setTeams([]);
      }
    };

    loadTeams();
  }, []);

  const handleCreateTeam = async () => {
  const res = await createTeam(newTeamName, newTeamPassword);

  if (!res.ok) {
    setMessage("Error: " + (res.data.message || "Something went wrong"));
    return;
  }
  setTeams((prev) => [...prev, res.data.team]);

  setMessage("Team created! Code: " + res.data.teamCode);
};


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
								className="btn nav-panel-btn"
								aria-label="Open calendar view"
								title="Calendar view"
								onClick={() => {
									onNavigate?.("calendar");
									setNavOpen(false);
								}}
							>
								Calendar view
							</button>

              {showTeams && (
                <ul className="team-list">
                  {teams.filter(t => t && t.teamId).map((t) => (
                    <li key={t.teamId}>
                      <button
                        type="button"
                        className="btn nav-panel-btn team-item"
                        onClick={() => {
                          onNavigate?.("tasks", t.teamId);
                          setNavOpen(false);
                        }}
                      >
                        {t.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

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
          <section className="modal-overlay">
            <div className="join-modal" role="dialog" aria-modal="true">
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
                  <p>{message}</p>
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
                  onClick={handleCreateTeam}
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
          <section className="modal-overlay">
            <div className="join-modal" role="dialog" aria-modal="true">
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
                  <input type="text" name="teamId" value={teamCodeInput} onChange={(e) => setTeamCodeInput(e.target.value)} />
                </label>
                <label>
                  Enter password
                  <input type="password" name="teamPassword" value={teamPasswordInput} onChange={(e) => setTeamPasswordInput(e.target.value)} />
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
                  onClick={async () => {
                    const res = await joinTeam(teamCodeInput, teamPasswordInput);

                    if (!res.ok) {
                      alert("Error: " + res.data.message);
                      return;
                    }

                    setTeams((prev) => [...prev, res.data.team]);

                    setJoinModalOpen(false);  
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
          className="btn person-btn logout-btn icon-btn"
          aria-label="Logout"
          title="Logout"
          onClick={onLogout}
        >
          <FiLogOut />
        </button>
      </div>
    </nav>
  );
}
