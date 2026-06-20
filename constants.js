// =============================================================
//  constants.js
//  Shared constants, Naira formatter, and localStorage helpers.
//  Loaded first — every other file depends on these.
// =============================================================

// Ensure React & ReactDOM are available when bundled.
import * as React from "react";
import * as ReactDOM from "react-dom";
window.React = React;
window.ReactDOM = ReactDOM;

// ── React destructure (available globally to all files) ───────────────────────
const { useState, useEffect, useRef } = React;

// ── Product categories ─────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Phones", "Laptops", "Gadgets", "Accessories"];

const CAT_COLORS = {
  Phones: "phones",
  Laptops: "laptops",
  Gadgets: "gadgets",
  Accessories: "accessories",
};

// ── Default settings ───────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  brandName: "Raw Essence",
  storeName: "Raw Essence Tech",
  whatsapp: "+2348136899180",
};

// ── Currency formatter (Nigerian Naira) ────────────────────────────────────────
const fmt = (n) =>
  "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 0 });

// ── localStorage helpers ───────────────────────────────────────────────────────
const lsGet = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const lsSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// Expose legacy globals for scripts that expect non-module globals
window.CATEGORIES = CATEGORIES;
window.CAT_COLORS = CAT_COLORS;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
window.fmt = fmt;
window.lsGet = lsGet;
window.lsSet = lsSet;
