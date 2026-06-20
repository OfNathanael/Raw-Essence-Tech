// =============================================================
//  login.js
//  LoginView — password gate for the Admin panel.
//  Password is verified server-side via /api/admin-login
//  (checked against the ADMIN_PASSWORD environment variable),
//  never compared in the browser.
//  Depends on: constants.js, icons.js
// =============================================================
import React, { useState, useEffect, useRef } from "react";

function LoginView({ onSuccess, onBack }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        sessionStorage.setItem("adminPassword", pass);
        onSuccess();
      } else {
        setErr(true);
        setTimeout(() => setErr(false), 2000);
      }
    } catch (e) {
      setErr(true);
      setTimeout(() => setErr(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 24,
      }}
    >
      <div
        className="card fade-up"
        style={{ width: "100%", maxWidth: 380, padding: 32 }}
      >
        {/* Icon + heading */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "linear-gradient(135deg,var(--gold),var(--gold2))",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Icon name="lock" size={22} />
          </div>
          <h2
            style={{
              fontFamily: "DM Sans",
              fontWeight: 800,
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            Admin Access
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Enter your admin password to continue
          </p>
        </div>

        {/* Password input */}
        <label
          htmlFor="login-pass"
          style={{
            display: "block",
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 6,
          }}
        >
          Password
        </label>
        <input
          id="login-pass"
          name="password"
          type="password"
          className="input"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            marginBottom: 12,
            border: err ? "1.5px solid var(--danger)" : "",
          }}
        />
        {err && (
          <p style={{ color: "var(--danger)", fontSize: 12, marginBottom: 12 }}>
            Incorrect password
          </p>
        )}

        {/* Buttons */}
        <button
          className="btn btn-gold"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "13px",
            fontSize: 15,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Icon name="lock" size={16} /> {loading ? "Checking…" : "Login"}
        </button>
        <button
          className="btn-ghost"
          onClick={onBack}
          style={{
            width: "100%",
            justifyContent: "center",
            marginTop: 10,
            color: "var(--muted)",
            padding: "10px",
          }}
        >
          ← Back to store
        </button>
      </div>
    </div>
  );
}

// Expose for legacy/global access when bundling as modules
window.LoginView = LoginView;