import { useState, useEffect } from "preact/hooks";
import { watchAuth, logout } from "./lib/auth";
import Login from "./pages/Login";
import "./styles/global.css";

export function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return watchAuth((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={{ padding: "24px" }}>Loading...</p>;

  if (!user) return <Login />;

  return (
    <main style={{ padding: "16px" }}>
      <h1>Lab Track</h1>
      <p>Hi, {user.displayName || user.email}</p>
      <button class="btn" onClick={logout}>Sign out</button>
    </main>
  );
}