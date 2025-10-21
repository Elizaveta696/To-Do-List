import { useState } from "react";

export default function Login({ setToken, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/auth/login", {
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
    <div className="auth-form">
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} /><br/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <button onClick={() => setPage("register")}>Register</button>
      </p>
    </div>
  );
}
