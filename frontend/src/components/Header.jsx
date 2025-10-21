import React from "react";

export default function Header({ teamName, onAddTask, onLogout, onToggleNightMode, nightMode }) {
  return (
    <header className={`header${nightMode ? " night" : ""}`} style={{ position: "sticky", top: 0, left: 0, width: "100%", zIndex: 100, borderRadius: 0, marginLeft: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontWeight: "bold", fontSize: "1.5rem" }}>{teamName}</span>
        <button className="btn btn-primary" onClick={onAddTask}>New Task</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>  
        <button className="btn btn-ghost" onClick={onToggleNightMode} aria-label="Toggle night mode">
          {nightMode ? "🌞" : "🌙"}
        </button>
         <button className="btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}
