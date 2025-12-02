import { useEffect, useState } from "react";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TeamSettings from "./components/TeamSettings";
import { FEATURE_FLAGS } from "./featureFlags";
import "./App.css";
import { FiPlus } from "react-icons/fi";

function App() {
	const [token, setToken] = useState(
		() => localStorage.getItem("token") || null,
	);
	const [page, setPage] = useState(token ? "tasks" : "login");
	const [teamId, setTeamId] = useState("TEAM-12345");
	const [teamName, setTeamName] = useState("My tasks");
	const [refreshKey, setRefreshKey] = useState(0);
	const [nightMode, setNightMode] = useState(() => {
		try {
			return localStorage.getItem("theme") === "dark";
		} catch {
			return false;
		}
	});
	const [showAddForm, setShowAddForm] = useState(false);

	// lock body scroll while overlay is open
	useEffect(() => {
		if (showAddForm) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [showAddForm]);

	// close overlay on Escape for keyboard users
	useEffect(() => {
		if (!showAddForm) return;
		const onKey = (e) => {
			if (e.key === "Escape") setShowAddForm(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [showAddForm]);

	useEffect(() => {
		if (!FEATURE_FLAGS.lightThemeToggle) return;
		try {
			localStorage.setItem("theme", nightMode ? "dark" : "light");
		} catch {}
		if (nightMode) document.documentElement.classList.remove("theme-light");
		else document.documentElement.classList.add("theme-light");
	}, [nightMode]);

	// User Auth login and register
	const handleLogout = () => {
		setToken(null);
		localStorage.removeItem("token");
		setPage("login");
	};

	const toggleNight = FEATURE_FLAGS.lightThemeToggle
		? () => setNightMode((v) => !v)
		: undefined;

	if (page === "login")
		return (
			<Login
				setToken={setToken}
				setPage={setPage}
				onToggleNightMode={toggleNight}
				nightMode={nightMode}
			/>
		);
	if (page === "register")
		return (
			<Register
				setPage={setPage}
				onToggleNightMode={toggleNight}
				nightMode={nightMode}
			/>
		);

	return (
		<div className="app">
			<Header
				onLogout={handleLogout}
				onToggleNightMode={
					FEATURE_FLAGS.lightThemeToggle
						? () => setNightMode((v) => !v)
						: undefined
				}
				nightMode={nightMode}
				teamName={teamName}
				onNavigate={(p) => setPage(p)}
			/>
			{/* show New Task form overlay */}
			{showAddForm && (
				<div className="overlay-form">
					{/* backdrop removed: overlay will remain until closed via Escape or explicit controls */}
					<div className="overlay-panel" role="dialog" aria-modal="true">
						<button
							type="button"
							className="modal-close"
							onClick={() => setShowAddForm(false)}
							aria-label="Close"
						>
							×
						</button>
						<h3 className="modal-title">Add Task</h3>
						<TaskForm
							token={token}
							onCreated={() => {
								setRefreshKey((k) => k + 1);
								setShowAddForm(false);
							}}
							onClose={() => setShowAddForm(false)}
						/>
					</div>
				</div>
			)}
			<main className="main-content">
				<header className="page-header">
					<h1 className="page-title">My tasks</h1>
				</header>
				<div key={refreshKey}>
					{page === "tasks" && (
						<TaskList token={token} onAddTask={() => setShowAddForm(true)} />
					)}
					{page === "team-settings" && (
						<TeamSettings
							teamId={teamId}
							teamName={teamName}
							onChangeName={(name) => setTeamName(name)}
						/>
					)}
				</div>
				{/* floating circular add button (hide on settings page) */}
				{page === "tasks" && (
					<button
						type="button"
						className="floating-add"
						onClick={() => setShowAddForm(true)}
						aria-label="Add task"
						title="New task"
					>
						<FiPlus />
					</button>
				)}
			</main>
		</div>
	);
}

export default App;
