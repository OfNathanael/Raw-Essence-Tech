// ============================================================
//  FIREBASE CONFIG
//  Fill in your Firebase Realtime Database URL below.
//
//  How to get it:
//  1. Go to https://console.firebase.google.com
//  2. Create a project (any name)
//  3. Build → Realtime Database → Create Database
//  4. Choose a region → Start in test mode → Enable
//  5. Copy the URL shown at the top (ends in .firebaseio.com)
//  6. Paste it as the value of `databaseUrl` below
// ============================================================

const FIREBASE_CONFIG = {
  databaseUrl: "https://rawessencetech-default-rtdb.firebaseio.com",
};

// ── Helpers (do not edit below this line) ────────────────────────────────────

async function fbRead(path) {
  const url =
    FIREBASE_CONFIG.databaseUrl.replace(/\/$/, "") + "/" + path + ".json";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Firebase read failed: " + res.status);
  return res.json();
}

async function fbWrite(path, data) {
  const url =
    FIREBASE_CONFIG.databaseUrl.replace(/\/$/, "") + "/" + path + ".json";
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Firebase write failed: " + res.status);
  return res.json();
}

function firebaseEnabled() {
  return (
    FIREBASE_CONFIG.databaseUrl &&
    FIREBASE_CONFIG.databaseUrl !==
      "https://YOUR-PROJECT-default-rtdb.firebaseio.com" &&
    FIREBASE_CONFIG.databaseUrl.includes("firebaseio.com")
  );
}

// Expose as globals for legacy scripts and signal readiness
try {
  window.fbRead = fbRead;
  window.fbWrite = fbWrite;
  window.firebaseEnabled = firebaseEnabled;
  try {
    window.dispatchEvent(new Event("firebase-ready"));
  } catch (e) {
    // older browsers may not support Event constructor
    var ev = document.createEvent("Event");
    ev.initEvent("firebase-ready", true, true);
    window.dispatchEvent(ev);
  }
} catch (e) {
  /* ignore */
}
