"use client";

import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isLogin ? "login" : "register", username, password }),
      });

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Server returned non-JSON:", text);
        setMessage({ text: `Server Error (Code ${res.status}): Please check console.`, type: "error" });
        return;
      }

      if (!res.ok) {
        setMessage({ text: data.error || "An error occurred", type: "error" });
      } else {
        setMessage({ text: data.message || "Success!", type: "success" });
        if (!isLogin) {
          // Switch to login after successful registration
          setTimeout(() => {
            setIsLogin(true);
            setMessage({ text: "Registration successful. Please log in.", type: "success" });
            setPassword("");
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ text: "Network error: " + error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p>{isLogin ? "Sign in to access your dashboard" : "Join us and start your journey"}</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="username"
            placeholder=" "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="username">Username</label>
        </div>
        <div className="form-group">
          <input
            type="password"
            id="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <div className="auth-toggle">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button type="button" onClick={() => { setIsLogin(!isLogin); setMessage(null); setPassword(""); }}>
          {isLogin ? "Sign Up" : "Log In"}
        </button>
      </div>
    </div>
  );
}
