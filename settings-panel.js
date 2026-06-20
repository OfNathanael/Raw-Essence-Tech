// =============================================================
//  settings-panel.js
//  SettingsPanel — admin settings tab.
//  Shows store name, WhatsApp number, and integration status.
//  Admin password is now managed via the ADMIN_PASSWORD
//  environment variable on the server, NOT through this UI.
//  Depends on: constants.js, icons.js, firebase.js, imgbb.js, emailjs.js
// =============================================================

import React, { useState, useEffect, useRef } from "react";

function SettingsPanel({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings });
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // Reusable status row
  const StatusRow = ({ ok, yes, no }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 8,
        background: ok ? "#22c55e11" : "#ff4d6d11",
        border: "1px solid " + (ok ? "#22c55e33" : "#ff4d6d33"),
        fontSize: 12,
        color: ok ? "var(--success)" : "var(--danger)",
      }}
    >
      <Icon name={ok ? "check" : "close"} size={13} />
      {ok ? yes : no}
    </div>
  );

  return (
    <div>
      <h2
        style={{
          fontFamily: "DM Sans",
          fontWeight: 800,
          fontSize: 22,
          marginBottom: 8,
        }}
      >
        Settings
      </h2>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 28 }}>
        Manage your store details.
      </p>

      <div style={{ display: "grid", gap: 20, maxWidth: 560 }}>
        {/* ── Brand Info ── */}
        <div className="card" style={{ padding: 20 }}>
          <h3
            style={{
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="brand" size={16} /> Brand Info
          </h3>
          <label
            htmlFor="settings-brandName"
            style={{
              fontSize: 11,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Brand Name
          </label>
          <input
            id="settings-brandName"
            name="brandName"
            className="input"
            value={form.brandName || ""}
            onChange={(e) => set("brandName", e.target.value)}
            placeholder="Brand Name"
          />
        </div>

        {/* ── Store Info ── */}
        <div className="card" style={{ padding: 20 }}>
          <h3
            style={{
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="store" size={16} /> Store Info
          </h3>
          <label
            htmlFor="settings-storeName"
            style={{
              fontSize: 11,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Store Name
          </label>
          <input
            id="settings-storeName"
            name="storeName"
            className="input"
            value={form.storeName || ""}
            onChange={(e) => set("storeName", e.target.value)}
            placeholder="My Tech Store"
          />
        </div>

        {/* ── WhatsApp ── */}
        <div className="card" style={{ padding: 20 }}>
          <h3
            style={{
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: "#25d366" }}>
              <Icon name="whatsapp" size={16} />
            </span>{" "}
            WhatsApp Number
          </h3>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 12,
              marginBottom: 12,
              lineHeight: 1.6,
            }}
          >
            Customers are redirected here at checkout. Include country code.
          </p>
          <input
            id="settings-whatsapp"
            name="whatsapp"
            className="input"
            value={form.whatsapp || ""}
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="+2348012345678"
          />
        </div>

        {/* ── Integration Status (read-only) ── */}
        <div className="card" style={{ padding: 20 }}>
          <h3
            style={{
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="database" size={16} /> Integration Status
          </h3>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 12,
              marginBottom: 14,
              lineHeight: 1.6,
            }}
          >
            Configured directly in{" "}
            <code
              style={{
                background: "var(--bg)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              firebase.js
            </code>
            ,{" "}
            <code
              style={{
                background: "var(--bg)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              imgbb.js
            </code>
            , and{" "}
            <code
              style={{
                background: "var(--bg)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              emailjs.js
            </code>
            .
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            <StatusRow
              ok={firebaseEnabled()}
              yes="Firebase connected — products sync across all devices."
              no="Firebase not configured — edit firebase.js to connect."
            />
            <StatusRow
              ok={imgbbEnabled()}
              yes="ImgBB connected — image uploads are active."
              no="ImgBB not configured — edit imgbb.js to enable image uploads."
            />
            <StatusRow
              ok={emailjsEnabled()}
              yes="EmailJS connected — you will receive order emails."
              no="EmailJS not configured — edit emailjs.js to enable order emails."
            />
          </div>
        </div>

        {/* ── Admin Password ──
             Removed from this UI. The admin password is now stored
             server-side as the ADMIN_PASSWORD environment variable
             on Vercel and verified by /api/admin-login and
             /api/admin-write. To change it, update ADMIN_PASSWORD
             in Vercel → Settings → Environment Variables and redeploy. */}

        <button
          className="btn btn-gold"
          onClick={() => onSave(form)}
          style={{ width: "fit-content", padding: "13px 28px", fontSize: 15 }}
        >
          <Icon name="check" size={16} /> Save Settings
        </button>
      </div>
    </div>
  );
}

// Expose for legacy/global access when bundling as modules
window.SettingsPanel = SettingsPanel;