// ...existing code...
import { useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./App.css";

function App() {
	const [refreshKey, setRefreshKey] = useState(0);

	return (
		<>
			<h1>TeamBoard — Tasks</h1>
			<TaskForm onCreated={() => setRefreshKey((k) => k + 1)} />
			{/* TaskList reads tasks on mount — using a key forces reload when a new task is created */}
			<div key={refreshKey}>
				<TaskList />
			</div>
		</>
	);
}

export default App;
// ...existing code...
