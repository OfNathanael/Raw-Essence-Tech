// =============================================================
//  boot.js
//  Initialises the store on first load.
//  Loads from localStorage first, then syncs from Firebase
//  if a database URL is configured.
//  Depends on: constants.js, firebase.js
// =============================================================

function bootStore(setProducts, setSettings, setLoading) {
  // Load whatever is saved locally first so the UI is instant
  const localSettings = lsGet("tz:settings", DEFAULT_SETTINGS);
  const localProducts = lsGet("tz:products", []);

  setSettings(localSettings);
  setProducts(localProducts);

  // If Firebase is configured and integration is available, pull latest data
  const hasFirebaseEnabled = typeof window.firebaseEnabled === "function";
  const hasFbRead = typeof window.fbRead === "function";
  const firebaseIsEnabled = hasFirebaseEnabled
    ? window.firebaseEnabled()
    : false;

  if (firebaseIsEnabled && hasFbRead) {
    Promise.all([
      window.fbRead("products").catch(() => null),
      window.fbRead("settings").catch(() => null),
    ])
      .then(([fbProducts, fbSettings]) => {
        if (fbProducts && Array.isArray(fbProducts) && fbProducts.length > 0) {
          setProducts(fbProducts);
        }
        if (fbSettings && fbSettings.storeName) {
          setSettings((s) => ({ ...s, ...fbSettings }));
        }
      })
      .finally(() => setLoading(false));
  } else {
    // Firebase not available yet (or not configured) — skip cloud sync
    setLoading(false);
  }

  // Also listen for Firebase becoming available later and sync without
  // blocking the initial load. This covers the case where firebase.js
  // is loaded after the app bundle (idle-loaded).
  const tryLaterSync = () => {
    try {
      const laterEnabled =
        typeof window.firebaseEnabled === "function"
          ? window.firebaseEnabled()
          : false;
      const laterHasRead = typeof window.fbRead === "function";
      if (!laterEnabled || !laterHasRead) return;
      Promise.all([
        window.fbRead("products").catch(() => null),
        window.fbRead("settings").catch(() => null),
      ])
        .then(([fbProducts, fbSettings]) => {
          if (
            fbProducts &&
            Array.isArray(fbProducts) &&
            fbProducts.length > 0
          ) {
            setProducts(fbProducts);
          }
          if (fbSettings && fbSettings.storeName) {
            setSettings((s) => ({ ...s, ...fbSettings }));
          }
        })
        .catch(() => {})
        .finally(() => {});
      window.removeEventListener("firebase-ready", tryLaterSync);
    } catch (e) {
      /* ignore */
    }
  };

  window.addEventListener("firebase-ready", tryLaterSync);
}

// Expose for legacy access when bundled
window.bootStore = bootStore;
