// src/components/AuthButton.jsx
import { useState, useEffect } from "preact/hooks";
import { loginWithGoogle, logout, watchAuth } from "../lib/auth";

export function AuthButton() {
  const [user, setUser] = useState(null);       // who is signed in (null = nobody)
  const [loading, setLoading] = useState(true); // true until Firebase tells us the login state
  const [error, setError] = useState("");

  // Runs once when the component first appears.
  useEffect(() => {
    const stopWatching = watchAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return stopWatching; // clean up when the component goes away
  }, []);

  async function handleLogin() {
    setError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setError("Sign in failed. Please try again.");
    }
  }

  async function handleLogout() {
    await logout();
  }

  if (loading) return <p>Loading...</p>;

  if (user) {
    return (
      <div class="auth">
        <span>Hi, {user.displayName}</span>
        <button class="btn" onClick={handleLogout}>Sign out</button>
      </div>
    );
  }

  return (
    <div class="auth">
      <button class="btn" onClick={handleLogin}>Sign in with Google</button>
      {error && <p class="error">{error}</p>}
    </div>
  );
}