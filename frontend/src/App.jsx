import { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";




function App() {
	const [token, setToken] = useState(() => localStorage.getItem("token") || null);
	const [page, setPage] = useState(token ? "tasks" : "login");
	const [refreshKey, setRefreshKey] = useState(0);
	const [light, setLight] = useState(() => {
		try {
			return localStorage.getItem("theme") === "light";
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
		try {
			localStorage.setItem("theme", light ? "light" : "dark");
		} catch (e) {}
		if (light) document.documentElement.classList.add("theme-light");
		else document.documentElement.classList.remove("theme-light");
	}, [light]);

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
			<button
				className="theme-toggle"
				aria-label="Toggle theme"
				onClick={() => setLight((v) => !v)}
			>
				{light ? "🌙" : "🌞"}
			</button>

			<h1>TeamBoard — Tasks</h1>
			{/* show New Task button when form hidden; show overlay panel when toggled */}
			{showAddForm ? (
				/* backdrop: clicking it will close the overlay */
				<div className="overlay-form" onClick={() => setShowAddForm(false)}>
					<div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
						<TaskForm
							token={token}
							onCreated={() => {
								setRefreshKey((k) => k + 1);
								setShowAddForm(false);
								// keep form hidden after successful creation
							}}
							onClose={() => setShowAddForm(false)}
						/>
					</div>
				</div>
			) : (
				<button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
					New Task
				</button>
			)}
			{/* TaskList reads tasks on mount — using a key forces reload when a new task is created */}
			<div key={refreshKey}>
				<TaskList />
			</div>
			<button onClick={handleLogout}>Logout</button>
		</div>
	);
}

export default App;
