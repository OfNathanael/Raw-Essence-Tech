import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

// Map legacy globals (exposed by individual modules) to local bindings
// so this file can use the components in JSX after bundling.
const StoreView = window.StoreView;
const ProductCard = window.ProductCard;
const LoginView = window.LoginView;
const AdminView = window.AdminView;
const ProductModal = window.ProductModal;
const CartDrawer = window.CartDrawer;

// =============================================================
//  app.js — App Root
//  Wires together all hooks and components.
//  Every section lives in its own dedicated file:
//
//    constants.js      — shared constants, fmt, lsGet/lsSet
//    icons.js          — Icon component
//    boot.js           — bootStore() initialisation
//    persist.js        — persistProducts() / persistSettings()
//    cart.js           — useCart() hook
//    checkout.js       — checkout() function
//    store-view.js     — StoreView component
//    product-card.js   — ProductCard component
//    cart-drawer.js    — CartDrawer component
//    login.js          — LoginView component
//    admin-view.js     — AdminView component
//    product-form.js   — ProductForm component
//    settings-panel.js — SettingsPanel component
//    product-modal.js  — ProductModal component
// =============================================================

// React hooks — declared locally so this file works as a standalone Babel script
function App() {
  // ── View state ─────────────────────────────────────────────────────────────
  const [view, setView] = useState("store"); // "store" | "login" | "admin"

  // ── Store data ─────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [cartOpen, setCartOpen] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [storageFilter, setStorageFilter] = useState("All");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [conditionFilter, setConditionFilter] = useState("Any");
  const [toast, setToast] = useState(null);
  const [orderSent, setOrderSent] = useState(false);
  const [modalProduct, setModalProduct] = useState(null); // product detail popup

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    bootStore(setProducts, setSettings, setLoading);
  }, []);

  // ── Persist products ───────────────────────────────────────────────────────
  const handleSaveProducts = (updated) =>
    persistProducts(updated, setProducts, showToast);

  // ── Persist settings ───────────────────────────────────────────────────────
  const handleSaveSettings = (newSettings) =>
    persistSettings(newSettings, setSettings, showToast);

  // ── Cart (useCart hook) ────────────────────────────────────────────────────
  const {
    cart,
    cartTotal,
    cartCount,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
  } = useCart(showToast);

  // ── Checkout ───────────────────────────────────────────────────────────────
  const handleCheckout = () =>
    checkout(cart, settings, cartTotal, () => {
      setOrderSent(true);
      setTimeout(() => {
        clearCart();
        setCartOpen(false);
        setOrderSent(false);
      }, 4000);
    });

  // ── Filtered product list ──────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    if (filterCat !== "All" && p.category !== filterCat) return false;
    const q = search.toLowerCase();
    if (
      !(
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      )
    )
      return false;
    if (brandFilter && brandFilter !== "All" && (p.brand || "") !== brandFilter)
      return false;
    if (storageFilter && storageFilter !== "All") {
      const mem = (p.memory || p.storage || p.capacity || "").toString();
      if (mem !== storageFilter) return false;
    }
    if (conditionFilter && conditionFilter !== "Any") {
      const cond = (p.condition || "new").toString();
      if (cond.toLowerCase() !== conditionFilter.toLowerCase()) return false;
    }
    if (priceMin !== "" && (!p.price || p.price < parseFloat(priceMin)))
      return false;
    if (priceMax !== "" && (!p.price || p.price > parseFloat(priceMax)))
      return false;
    return true;
  });

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading || !settings)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg)",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid var(--border)",
            borderTopColor: "var(--gold)",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading store…</p>
      </div>
    );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Toast notification */}
      {toast && (
        <div
          className="slide-in"
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: toast.type === "error" ? "#ff4d6d22" : "#4ade8022",
            border:
              "1px solid " +
              (toast.type === "error" ? "#ff4d6d44" : "#4ade8044"),
            color: toast.type === "error" ? "var(--danger)" : "var(--success)",
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
            backdropFilter: "blur(10px)",
            maxWidth: 320,
          }}
        >
          <Icon name={toast.type === "error" ? "close" : "check"} size={15} />
          {toast.msg}
        </div>
      )}

      {/* Views */}
      {view === "store" && (
        <StoreView
          products={filtered}
          allProducts={products}
          settings={settings}
          filterCat={filterCat}
          setFilterCat={setFilterCat}
          search={search}
          setSearch={setSearch}
          brandFilter={brandFilter}
          setBrandFilter={setBrandFilter}
          storageFilter={storageFilter}
          setStorageFilter={setStorageFilter}
          priceMin={priceMin}
          setPriceMin={setPriceMin}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
          conditionFilter={conditionFilter}
          setConditionFilter={setConditionFilter}
          cartCount={cartCount}
          onAddToCart={addToCart}
          onOpenCart={() => setCartOpen(true)}
          onAdminClick={() => setView("login")}
          onOpenModal={(p) => setModalProduct(p)}
        />
      )}

      {view === "login" && (
        <LoginView
          settings={settings}
          onSuccess={() => setView("admin")}
          onBack={() => setView("store")}
        />
      )}

      {view === "admin" && (
        <AdminView
          products={products}
          onSaveProducts={handleSaveProducts}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onBack={() => setView("store")}
          showToast={showToast}
        />
      )}

      {/* Product detail modal */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAdd={(p) => {
            addToCart(p);
            setModalProduct(null);
          }}
        />
      )}

      {/* Cart overlay */}
      {cartOpen && (
        <>
          <div
            onClick={() => setCartOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "#00000070",
              zIndex: 400,
              backdropFilter: "blur(4px)",
            }}
          />
          <CartDrawer
            cart={cart}
            total={cartTotal}
            settings={settings}
            orderSent={orderSent}
            onClose={() => setCartOpen(false)}
            onRemove={removeFromCart}
            onUpdateQty={updateQty}
            onCheckout={handleCheckout}
          />
        </>
      )}
    </div>
  );
}

// ── Mount ──────────────────────────────────────────────────────────────────────
createRoot(document.getElementById("root")).render(<App />);
