import { useId, useMemo, useState } from "react";
import { createTask } from "../api/tasks";
import { createTeamTask } from "../api/teams";

export default function TaskForm({ onCreated, onClose, teamId }) {
	const id = useId();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [priority, setPriority] = useState("medium");
	const [loading, setLoading] = useState(false);

	const availableUsers = useMemo(
		() => [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 3, name: "Eve" },
			{ id: 4, name: "Carol" },
		],
		[],
	);

	const [assignees, setAssignees] = useState([]);

	function toggleAssignee(id) {
		setAssignees((s) =>
			s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
		);
	}

	const submit = async (e) => {
		e.preventDefault();
		if (!title.trim()) return alert("Title required");
		try {
			setLoading(true);
			let newTask;
			if (teamId) {
				// create task on team board; API expects single assigned user id
				const assignedUserId = assignees.length > 0 ? assignees[0] : undefined;
				newTask = await createTeamTask({
					teamId,
					title,
					description,
					dueDate: dueDate || null,
					priority,
					assignedUserId,
				});
			} else {
				newTask = await createTask({
					title,
					description,
					dueDate: dueDate || null,
					priority,
					assignees, // frontend-only: list of user ids assigned to the task
				});
			}
			setTitle("");
			setDescription("");
			setDueDate("");
			setPriority("medium");
			if (onCreated) onCreated(newTask);
		} catch (e) {
			console.error(e);
			alert("Failed to create task");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className="task-form" onSubmit={submit}>
			<div>
				<label>
					Title
					<input
						id={`title-${id}`}
						className="input"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder=""
					/>
				</label>
			</div>
			<div>
				<label>
					Description
					<input
						className="input"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder=""
					/>
				</label>
			</div>
			<div>
				<label>
					Date
					<input
						id={`date-${id}`}
						className="input"
						type="date"
						value={dueDate}
						onChange={(e) => setDueDate(e.target.value)}
						placeholder=""
					/>
				</label>
			</div>
			<div>
				<label htmlFor={`priority-${id}`}>
					Priority
					<select
						id={`priority-${id}`}
						className="input"
						value={priority}
						onChange={(e) => setPriority(e.target.value)}
					>
						<option value="high">High</option>
						<option value="medium">Medium</option>
						<option value="low">Low</option>
					</select>
				</label>
			</div>
			{/* Assign users - frontend-only multi-select scroll list */}
			<div>
				<label htmlFor={`assign-${id}`}>Assign user</label>
				<div className="assign-users">
					{availableUsers.map((u) => (
						<label key={u.id} className="user-item">
							<input
								type="checkbox"
								checked={assignees.includes(u.id)}
								onChange={() => toggleAssignee(u.id)}
							/>
							<span className="user-name">{u.name}</span>
						</label>
					))}
				</div>
			</div>
			<div className="form-actions">
				<button
					className="btn btn-ghost"
					type="button"
					onClick={() => onClose?.()}
				>
					Cancel
				</button>
				<button className="btn btn-primary" type="submit" disabled={loading}>
					{loading ? "Saving…" : "Add Task"}
				</button>
			</div>
		</form>
	);
}
