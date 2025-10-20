import { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./App.css";

function App() {
	const [refreshKey, setRefreshKey] = useState(0);
	const [light, setLight] = useState(() => {
		try {
			return localStorage.getItem("theme") === "light";
		} catch (e) {
			return false;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem("theme", light ? "light" : "dark");
		} catch (e) {}
		if (light) document.documentElement.classList.add("theme-light");
		else document.documentElement.classList.remove("theme-light");
	}, [light]);

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
			<TaskForm onCreated={() => setRefreshKey((k) => k + 1)} />
			{/* TaskList reads tasks on mount — using a key forces reload when a new task is created */}
			<div key={refreshKey}>
				<TaskList />
			</div>
		</div>
	);
}

export default App;
