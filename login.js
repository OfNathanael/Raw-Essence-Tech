// =============================================================
//  login.js
//  LoginView — password gate for the Admin panel.
//  Depends on: constants.js, icons.js
// =============================================================
import React, { useState, useEffect, useRef } from "react";

function LoginView({ settings, onSuccess, onBack }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  const handleLogin = () => {
    if (pass === (settings.adminPass || "admin123")) {
      onSuccess();
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 2000);
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
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "13px",
            fontSize: 15,
          }}
        >
          <Icon name="lock" size={16} /> Login
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
