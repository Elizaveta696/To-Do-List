import { useState, useEffect } from "react";
import { FEATURE_FLAGS } from "./featureFlags";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from "./components/Header";
import "./App.css";
function App() {
	const [token, setToken] = useState(() => localStorage.getItem("token") || null);
	const [page, setPage] = useState(token ? "tasks" : "login");
	const [refreshKey, setRefreshKey] = useState(0);
	const [nightMode, setNightMode] = useState(() => {
		try {
			return localStorage.getItem("theme") === "dark";
		} catch (e) {
			return false;
		}
	});

	// show/hide the add-task form
	const [showAddForm, setShowAddForm] = useState(false);

	// lock body scroll while overlay is open
	useEffect(() => {
		if (showAddForm) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [showAddForm]);

	useEffect(() => {
		if (!FEATURE_FLAGS.lightThemeToggle) return;
		try {
			localStorage.setItem("theme", nightMode ? "dark" : "light");
		} catch (e) {}
		if (nightMode) document.documentElement.classList.remove("theme-light");
		else document.documentElement.classList.add("theme-light");
	}, [nightMode]);

	// User Auth login and register
	const handleLogout = () => {
		setToken(null);
		localStorage.removeItem("token");
		setPage("login");
	};

	if (page === "login") return <Login setToken={setToken} setPage={setPage} />;
	if (page === "register") return <Register setPage={setPage} />;

	return (
		<div className="app">
			<Header
				teamName="TeamBoard"
				onAddTask={() => setShowAddForm(true)}
				onLogout={handleLogout}
				onToggleNightMode={FEATURE_FLAGS.lightThemeToggle ? () => setNightMode((v) => !v) : undefined}
				nightMode={nightMode}
			/>
			{/* show New Task form overlay */}
			{showAddForm && (
				<div className="overlay-form" onClick={() => setShowAddForm(false)}>
					<div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
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
			<div key={refreshKey}>
				<TaskList token={token} onAddTask={() => setShowAddForm(true)} />
			</div>
		</div>
	);
}

export default App;
