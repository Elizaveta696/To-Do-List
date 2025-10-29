import { useState } from "react";

export default function Register({ setPage, onToggleNightMode, nightMode }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [msg, setMsg] = useState("");

	const handleRegister = async (e) => {
		e.preventDefault();
		const base = import.meta.env.VITE_API_URL || "";
		const res = await fetch(`${base}/api/auth/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});
		const data = await res.json();
		setMsg(data.message || "Registered!");
	};

	return (
		<div className="auth-page">
			{onToggleNightMode && (
				<button
					type="button"
					className="theme-toggle"
					aria-label="Toggle night mode"
					onClick={onToggleNightMode}
				>
					{nightMode ? "🌞" : "🌙"}
				</button>
			)}
			<div className="auth-card">
				<h2>Register</h2>
				{msg && <p>{msg}</p>}
				<form onSubmit={handleRegister}>
					<input
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="input"
					/>
					<br />
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="input"
					/>
					<br />
					<div style={{ display: "flex", gap: 8 }}>
						<button type="submit" className="btn btn-primary">
							Register
						</button>
						<button
							type="button"
							className="btn"
							onClick={() => setPage("login")}
						>
							Login
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
