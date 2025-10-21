import { useState } from "react";

export default function Register({ setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setMsg(data.message || "Registered!");
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      {msg && <p>{msg}</p>}
      <form onSubmit={handleRegister}>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} /><br/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <button onClick={() => setPage("login")}>Login</button>
      </p>
    </div>
  );
}
