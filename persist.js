// =============================================================
//  persist.js
//  Saves products and settings to localStorage.
//  Also syncs to Firebase via the protected /api/admin-write
//  serverless endpoint, which verifies the admin password
//  server-side (against ADMIN_PASSWORD env var) before writing.
//  The password itself is held only in sessionStorage, set at
//  login by login.js, and is never compared in the browser.
//  Depends on: constants.js
// =============================================================

async function adminWrite(path, data) {
  const adminPassword = sessionStorage.getItem("adminPassword");
  const res = await fetch("/api/admin-write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminPassword, path, data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Save failed");
  }
  return res.json();
}

async function persistProducts(updated, setProducts, showToast) {
  setProducts(updated);
  lsSet("tz:products", updated);

  try {
    await adminWrite("products", updated);
  } catch {
    showToast("Saved locally — cloud sync failed.", "error");
  }
}

async function persistSettings(newSettings, setSettings, showToast) {
  setSettings(newSettings);
  lsSet("tz:settings", newSettings);

  try {
    await adminWrite("settings", newSettings);
  } catch {
    showToast("Saved locally — cloud sync failed.", "error");
  }

  showToast("Settings saved!");
}

// Expose for legacy access when bundled
window.persistProducts = persistProducts;
window.persistSettings = persistSettings;