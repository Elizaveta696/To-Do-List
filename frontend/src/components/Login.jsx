import { useState } from "react";

export default function Login({
	setToken,
	setPage,
	onToggleNightMode,
	nightMode,
}) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleLogin = async (e) => {
		e.preventDefault();
		const base = import.meta.env.VITE_API_URL || "";
		const res = await fetch(`${base}/api/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password }),
		});
		const data = await res.json();
		if (data.accessToken) {
			setToken(data.accessToken);
			localStorage.setItem("token", data.accessToken);
			setPage("tasks");
		} else {
			setError(data.message || "Login failed");
		}
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
				<h2>Login</h2>
				{error && <p style={{ color: "red" }}>{error}</p>}
				<form onSubmit={handleLogin}>
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
							Login
						</button>
						<button
							type="button"
							className="btn"
							onClick={() => setPage("register")}
						>
							Register
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
