// =============================================================
//  admin-view.js
//  AdminView — the admin control panel.
//  Tabs: Products | Settings
//  Depends on: constants.js, icons.js, product-form.js, settings-panel.js
// =============================================================

import React, { useState, useEffect, useRef } from "react";

function AdminView({
  products,
  onSaveProducts,
  settings,
  onSaveSettings,
  onBack,
  showToast,
}) {
  const [tab, setTab] = useState("products");
  const [editProd, setEdit] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id) => {
    const updated = products.filter((p) => p.id !== id);
    await onSaveProducts(updated);
    showToast("Product deleted.");
  };

  const handleSave = async (product) => {
    const isEdit = product.id && products.find((p) => p.id === product.id);
    const updated = isEdit
      ? products.map((p) => (p.id === product.id ? product : p))
      : [...products, { ...product, id: "p" + Date.now() }];
    await onSaveProducts(updated);
    showToast(isEdit ? "Product updated!" : "Product added!");
    setShowForm(false);
    setEdit(null);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── Admin header ── */}
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              className="btn-ghost"
              onClick={onBack}
              style={{ gap: 6, fontSize: 13, padding: "8px 12px" }}
            >
              <Icon name="store" size={15} /> Store
            </button>
            <span style={{ color: "var(--border)" }}>|</span>
            <span
              style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 16 }}
            >
              Admin Panel
            </span>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {["products", "settings"].map((t) => (
              <button
                key={t}
                className="btn"
                onClick={() => setTab(t)}
                style={{
                  background:
                    tab === t
                      ? "linear-gradient(135deg,var(--gold),var(--gold2))"
                      : "transparent",
                  color: tab === t ? "#ffffff" : "var(--muted)",
                  fontSize: 13,
                  padding: "8px 16px",
                  gap: 6,
                  textTransform: "capitalize",
                }}
              >
                <Icon
                  name={t === "products" ? "package" : "settings"}
                  size={13}
                />
                {t}
              </button>
            ))}
          </div>

          <button
            className="btn-ghost"
            onClick={onBack}
            style={{
              gap: 6,
              color: "var(--muted)",
              fontSize: 13,
              padding: "8px 12px",
            }}
          >
            <Icon name="logout" size={14} /> Logout
          </button>
        </div>
      </header>

      {/* ── Tab content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "products" ? (
          <>
            {/* Product list header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "DM Sans",
                    fontWeight: 800,
                    fontSize: 22,
                  }}
                >
                  Products
                </h2>
                <p
                  style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}
                >
                  {products.length} product{products.length !== 1 ? "s" : ""} in
                  your store
                </p>
              </div>
              <button
                className="btn btn-gold"
                onClick={() => {
                  setEdit(null);
                  setShowForm(true);
                }}
              >
                <Icon name="plus" size={15} /> Add Product
              </button>
            </div>

            {/* Add / Edit form */}
            {showForm && (
              <ProductForm
                product={editProd}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEdit(null);
                }}
                showToast={showToast}
              />
            )}

            {/* Product cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
                gap: 16,
              }}
            >
              {products.map((p) => (
                <div key={p.id} className="card">
                  <div
                    style={{
                      height: 140,
                      overflow: "hidden",
                      background: "var(--surface)",
                      position: "relative",
                    }}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        width="260"
                        height="140"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--muted)",
                        }}
                      >
                        <Icon name="image" size={32} />
                      </div>
                    )}
                    <span
                      className={
                        "badge badge-" + (CAT_COLORS[p.category] || "gold")
                      }
                      style={{ position: "absolute", top: 8, left: 8 }}
                    >
                      {p.category}
                    </span>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <div
                      style={{
                        fontFamily: "DM Sans",
                        fontWeight: 700,
                        fontSize: 14,
                        marginBottom: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        color: "var(--gold)",
                        fontWeight: 700,
                        fontSize: 16,
                        marginBottom: 10,
                      }}
                    >
                      {fmt(p.price)}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-outline"
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          fontSize: 12,
                          padding: "7px 10px",
                        }}
                        onClick={() => {
                          setEdit(p);
                          setShowForm(true);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <Icon name="edit" size={13} /> Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          fontSize: 12,
                          padding: "7px 10px",
                        }}
                        onClick={() => handleDelete(p.id)}
                      >
                        <Icon name="trash" size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <SettingsPanel settings={settings} onSave={onSaveSettings} />
        )}
      </div>
    </div>
  );
}

// Expose for legacy/global access when bundling as modules
window.AdminView = AdminView;
