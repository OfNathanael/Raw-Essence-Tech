// =============================================================
//  persist.js
//  Saves products and settings to localStorage.
//  Also syncs to Firebase if configured.
//  Depends on: constants.js, firebase.js
// =============================================================

async function persistProducts(updated, setProducts, showToast) {
  setProducts(updated);
  lsSet("tz:products", updated);

  if (firebaseEnabled()) {
    try {
      await fbWrite("products", updated);
    } catch {
      showToast("Saved locally — Firebase sync failed.", "error");
    }
  }
}

// Expose for legacy access when bundled
window.persistProducts = persistProducts;
window.persistSettings = persistSettings;

async function persistSettings(newSettings, setSettings, showToast) {
  setSettings(newSettings);
  lsSet("tz:settings", newSettings);

  if (firebaseEnabled()) {
    try {
      await fbWrite("settings", newSettings);
    } catch {
      showToast("Saved locally — Firebase sync failed.", "error");
    }
  }

  showToast("Settings saved!");
}
