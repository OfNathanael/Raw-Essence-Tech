// =============================================================
//  store-view.js
//  StoreView — the main customer-facing page.
//  Depends on: constants.js, icons.js
// =============================================================
import React, { useState, useEffect, useRef } from "react";

function StoreView({
  products,
  allProducts,
  settings,
  filterCat,
  setFilterCat,
  search,
  setSearch,
  brandFilter,
  setBrandFilter,
  storageFilter,
  setStorageFilter,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  conditionFilter,
  setConditionFilter,
  cartCount,
  onAddToCart,
  onOpenCart,
  onAdminClick,
  onOpenModal,
}) {
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState("home"); // home | products | search
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appliedProducts, setAppliedProducts] = useState(null);
  const [homeProducts, setHomeProducts] = useState([]);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const productsMenuRef = useRef(null);
  const productsBtnRef = useRef(null);
  const devMode = !!(settings && settings.devMode);

  const copyDebugToClipboard = async () => {
    try {
      const snap = {
        page,
        products: products || [],
        allProducts: allProducts || [],
        appliedProducts: appliedProducts === null ? null : appliedProducts,
        displayProducts: displayProducts || [],
      };
      const text = JSON.stringify(snap, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert("Debug snapshot copied to clipboard.");
      } else {
        console.log(text);
        alert("Debug snapshot logged to console.");
      }
    } catch (e) {
      console.warn("Failed to copy debug snapshot", e);
    }
  };

  const syncFromFirebase = async () => {
    if (!(window.fbRead && typeof window.fbRead === "function")) {
      alert("Firebase read function not available in this environment.");
      return;
    }
    try {
      const data = await window.fbRead("products");
      if (!data || (Array.isArray(data) && data.length === 0)) {
        alert("No products found in Firebase.");
        return;
      }
      try {
        lsSet("tz:products", data);
        alert("Products synced from Firebase. Reloading...");
        window.location.reload();
      } catch (err) {
        alert(
          "Failed to write products to localStorage: " + (err && err.message),
        );
      }
    } catch (err) {
      alert("Firebase read failed: " + (err && err.message));
    }
  };
  // simple hash-based routing: '', 'products', 'search'
  const goTo = (p) => {
    const target = p === "home" ? "" : `#${p}`;
    try {
      window.location.hash = target;
    } catch (e) {
      setPage(p);
    }
  };
  const brands = Array.from(
    new Set(allProducts.map((p) => p.brand).filter(Boolean)),
  );
  const storages = Array.from(
    new Set(
      allProducts
        .map((p) => p.memory || p.storage || p.capacity || "")
        .filter(Boolean),
    ),
  );
  // Helper: render products grid
  const renderGrid = (items) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
        gap: 20,
      }}
    >
      {items.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          onAdd={onAddToCart}
          onOpenModal={onOpenModal}
          delay={i * 60}
          priority={i < 2}
        />
      ))}
    </div>
  );

  const applyFilters = () => {
    const q = (search || "").toString().trim().toLowerCase();
    const min = parseFloat(priceMin) || 0;
    const max = parseFloat(priceMax) || Infinity;
    const matched = allProducts.filter((p) => {
      if (brandFilter && brandFilter !== "All" && p.brand !== brandFilter)
        return false;
      if (storageFilter && storageFilter !== "All") {
        const mem = (p.memory || p.storage || p.capacity || "").toString();
        if (!mem.includes(storageFilter)) return false;
      }
      if (conditionFilter && conditionFilter !== "Any") {
        const cond = (p.condition || "new").toString();
        if (cond.toLowerCase() !== conditionFilter.toLowerCase()) return false;
      }
      const price = parseFloat(p.price) || 0;
      if (price < min || price > max) return false;
      if (q) {
        const text = (
          p.name +
          " " +
          (p.description || "") +
          " " +
          (p.brand || "")
        ).toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
    setAppliedProducts(matched);
    setSidebarOpen(false);
  };

  const displayProducts = (() => {
    const src =
      appliedProducts !== null
        ? appliedProducts.slice()
        : (allProducts || []).slice();
    const cat = filterCat && filterCat !== "All" ? filterCat : null;
    if (cat) return src.filter((p) => p.category === cat);
    return src;
  })();

  useEffect(() => {
    if (!allProducts || !allProducts.length) return;
    // pick a random count between 10 and 15 (or limited by available products)
    const max = Math.min(allProducts.length, 15);
    const min = Math.min(allProducts.length, 10);
    const count = Math.max(min, 10 + Math.floor(Math.random() * (max - 9)));
    const shuffled = allProducts.slice().sort(() => Math.random() - 0.5);
    setHomeProducts(shuffled.slice(0, count));
  }, [allProducts]);

  // Integrate Firebase: if enabled and no products available, fetch from RTDB
  useEffect(() => {
    const trySyncFromFirebase = async () => {
      try {
        const enabled =
          typeof firebaseEnabled === "function"
            ? firebaseEnabled()
            : window && typeof window.firebaseEnabled === "function"
              ? window.firebaseEnabled()
              : false;
        if (!enabled) return;
        if (allProducts && allProducts.length) return; // already have products
        const readFn =
          typeof fbRead === "function"
            ? fbRead
            : window && typeof window.fbRead === "function"
              ? window.fbRead
              : null;
        if (!readFn) return;
        const data = await readFn("products");
        if (!data) return;
        try {
          lsSet("tz:products", data);
          // reload so the app picks up the new products
          window.location.reload();
        } catch (err) {
          console.warn("Failed to persist Firebase products", err);
        }
      } catch (err) {
        console.warn("Firebase sync failed", err);
      }
    };
    trySyncFromFirebase();
  }, [allProducts]);

  // initialize page from hash and respond to hash changes (support category pages)
  useEffect(() => {
    const categories = {
      phones: "Phones",
      laptops: "Laptops",
      gadgets: "Gadgets",
      accessories: "Accessories",
    };
    const syncFromHash = () => {
      const h = (window.location.hash || "").replace(/^#/, "");
      if (!h) return setPage("home");
      if (h === "products") {
        setFilterCat("All");
        setAppliedProducts(null);
        return setPage("products");
      }
      if (h === "search") return setPage("search");
      if (categories[h]) {
        setFilterCat(categories[h]);
        setAppliedProducts(null);
        return setPage("products");
      }
      setPage("home");
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Close products dropdown when clicking outside
  useEffect(() => {
    if (!productsMenuOpen) return;
    const onDocDown = (e) => {
      if (productsMenuRef.current && productsMenuRef.current.contains(e.target))
        return;
      if (productsBtnRef.current && productsBtnRef.current.contains(e.target))
        return;
      setProductsMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [productsMenuOpen]);

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--surface)",
          borderBottom: "2px solid var(--gold2)",
          boxShadow: "0 4px 24px #4ade8015",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          {/* Logo (clickable to go home) with inline sidebar button */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => goTo("home")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goTo("home");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(true);
              }}
              aria-label="Open menu"
              style={{
                background: "transparent",
                border: "none",
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                cursor: "pointer",
                marginRight: 6,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 2,
                  background: "var(--muted)",
                  display: "block",
                }}
              />
              <span
                style={{
                  width: 18,
                  height: 2,
                  background: "var(--muted)",
                  display: "block",
                }}
              />
              <span
                style={{
                  width: 18,
                  height: 2,
                  background: "var(--muted)",
                  display: "block",
                }}
              />
            </button>
            <img
              src="design.ico"
              alt="Brand Logo"
              style={{ height: 38, width: "auto", objectFit: "contain" }}
              onError={(e) => (e.target.style.display = "none")}
            />
            <span
              style={{
                fontFamily: "DM Sans",
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: "-1px",
                color: "var(--gold)",
              }}
            >
              {settings.storeName || "Raw Essence Tech"}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Products dropdown (show only on Products page) */}
            {page === "products" && (
              <div style={{ position: "relative" }} ref={productsMenuRef}>
                <button
                  ref={productsBtnRef}
                  onClick={() => setProductsMenuOpen((s) => !s)}
                  className={"btn-ghost"}
                  aria-expanded={productsMenuOpen}
                  aria-haspopup="true"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {page === "products" && filterCat && filterCat !== "All"
                    ? filterCat + " ▾"
                    : "Products ▾"}
                </button>
                {productsMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 40,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: 8,
                      zIndex: 220,
                      minWidth: 180,
                    }}
                  >
                    <button
                      className="btn"
                      onClick={() => {
                        goTo("products");
                        setFilterCat("All");
                        setAppliedProducts(null);
                        setProductsMenuOpen(false);
                      }}
                    >
                      All Products
                    </button>
                    <div style={{ height: 8 }} />
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        goTo("phones");
                        setFilterCat("Phones");
                        setAppliedProducts(null);
                        setProductsMenuOpen(false);
                      }}
                    >
                      Phones
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        goTo("laptops");
                        setFilterCat("Laptops");
                        setAppliedProducts(null);
                        setProductsMenuOpen(false);
                      }}
                    >
                      Laptops
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        goTo("gadgets");
                        setFilterCat("Gadgets");
                        setAppliedProducts(null);
                        setProductsMenuOpen(false);
                      }}
                    >
                      Gadgets
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        goTo("accessories");
                        setFilterCat("Accessories");
                        setAppliedProducts(null);
                        setProductsMenuOpen(false);
                      }}
                    >
                      Accessories
                    </button>
                  </div>
                )}
              </div>
            )}
            {page === "home" && (
              <button
                onClick={onAdminClick}
                style={{
                  fontSize: 12,
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "1.5px solid var(--border)",
                  color: "var(--muted)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--gold)";
                  e.currentTarget.style.color = "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--muted)";
                }}
              >
                <Icon name="settings" size={14} /> Admin
              </button>
            )}
            <button
              className="btn btn-outline"
              onClick={onOpenCart}
              style={{ position: "relative", gap: 8 }}
            >
              <Icon name="cart" size={16} /> Cart
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "var(--gold)",
                    color: "#0a0f0a",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "pulse .6s ease",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {devMode && (
        <div
          style={{
            position: "fixed",
            right: 12,
            bottom: 12,
            zIndex: 9999,
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "8px 10px",
            borderRadius: 8,
            fontSize: 12,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 700, marginRight: 8 }}>DBG</div>
          <div
            style={{
              maxWidth: 260,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {Array.isArray(displayProducts) || Array.isArray(allProducts) ? (
              <span>
                {(displayProducts || []).length} / {(allProducts || []).length}
              </span>
            ) : (
              <span>no products</span>
            )}
          </div>
          <button
            className="btn btn-ghost"
            onClick={copyDebugToClipboard}
            style={{ padding: "6px 8px", fontSize: 12 }}
          >
            Copy
          </button>
        </div>
      )}

      {/* ── Hero (Home only) ───────────────────────────────────────────────── */}
      {page === "home" && (
        <div
          style={{
            background:
              "linear-gradient(160deg,#0d2010 0%,#0a1a0a 40%,#060f06 100%)",
            borderBottom: "1px solid var(--border)",
            padding: "72px 24px 60px",
            position: "relative",
            overflow: "hidden",
            minHeight: "55vh",
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 500,
              height: 500,
              background:
                "radial-gradient(circle,#4ade8022 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -80,
              left: -40,
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle,#22c55e14 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: 1200,
              width: "100%",
              padding: "0 24px",
              pointerEvents: "none",
              color: "#fff",
            }}
          >
            <div
              style={{ maxWidth: 900, margin: "0 auto", pointerEvents: "auto" }}
            >
              <div className="fade-up">
                <p style={{ color: "#c7f9d2", marginBottom: 8, fontSize: 14 }}>
                  Welcome to Raw Essence Tech — The Home of Affordable and
                  Reliable Gadgets
                </p>
                <span
                  className="badge badge-gold"
                  style={{ marginBottom: 12, display: "inline-block" }}
                >
                  ✦ New Arrivals Available
                </span>
                <h1
                  style={{
                    fontFamily: "DM Sans",
                    fontWeight: 800,
                    fontSize: "clamp(1.8rem,5vw,3.2rem)",
                    lineHeight: 1.05,
                    letterSpacing: "-1px",
                    marginBottom: 10,
                    color: "#fff",
                  }}
                >
                  Quality Gadgets,
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(90deg,var(--gold),#bbf7d0)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Delivered to You
                  </span>
                </h1>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 16,
                    maxWidth: 600,
                    lineHeight: 1.6,
                  }}
                >
                  Browse phones, laptops, gadgets & accessories. Find your
                  perfect device today.
                </p>
              </div>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              width: 600,
              height: 2,
              background:
                "linear-gradient(90deg,transparent,#4ade8008,transparent)",
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* Slide-out sidebar (edge hamburger) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "#00000066",
            zIndex: 150,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: 280,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .28s ease",
          zIndex: 160,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <strong style={{ fontSize: 15 }}>Menu</strong>
          <button
            className="btn-ghost"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            className={page === "home" ? "btn" : "btn-ghost"}
            onClick={() => {
              goTo("home");
              setSidebarOpen(false);
            }}
          >
            Home
          </button>
          <button
            className={page === "products" ? "btn" : "btn-ghost"}
            onClick={() => {
              goTo("products");
              setSidebarOpen(false);
            }}
          >
            Products
          </button>
          <button
            className={page === "search" ? "btn" : "btn-ghost"}
            onClick={() => {
              goTo("search");
              setSidebarOpen(false);
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Main page content (no static aside) */}
      <main
        id="main"
        role="main"
        aria-label="Primary content"
        style={{ marginTop: 18 }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ flex: 1 }}>
            {page === "home" && (
              <div
                style={{
                  maxWidth: 1200,
                  margin: "40px auto",
                  padding: "0 24px",
                }}
              >
                {/* homepage shows a small randomized selection */}
                {homeProducts && homeProducts.length > 0 && (
                  <div style={{ marginTop: 8 }}>{renderGrid(homeProducts)}</div>
                )}
              </div>
            )}
            {page === "products" && (
              <>
                <div
                  style={{
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <label
                    htmlFor="sort-select"
                    style={{ color: "var(--muted)", fontSize: 13 }}
                  >
                    Sort:
                  </label>
                  <select
                    id="sort-select"
                    name="sort"
                    className="input"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    style={{ padding: "8px 10px", minWidth: 160 }}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name-asc">Name A → Z</option>
                    <option value="name-desc">Name Z → A</option>
                    <option value="price-asc">Price Low → High</option>
                    <option value="price-desc">Price High → Low</option>
                  </select>
                </div>
                {/* Category tabs removed — products dropdown used instead. The main products grid below handles rendering and sorting. */}
              </>
            )}
            {page === "search" && (
              <>
                <div
                  style={{
                    marginBottom: 18,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ position: "relative", maxWidth: 420 }}>
                    <label
                      htmlFor="search-input"
                      style={{ position: "absolute", left: -9999 }}
                    >
                      Search products
                    </label>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--muted)",
                        pointerEvents: "none",
                      }}
                    >
                      <Icon name="search" size={16} />
                    </span>
                    <input
                      id="search-input"
                      name="search"
                      className="input"
                      autoComplete="off"
                      placeholder="Search products…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        paddingLeft: 42,
                        background: "var(--card)",
                        border: "1.5px solid var(--border)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <label
                      htmlFor="brand-filter"
                      style={{ color: "var(--muted)", fontSize: 13 }}
                    >
                      Brand:
                    </label>
                    <select
                      id="brand-filter"
                      name="brand"
                      className="input"
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                      style={{ padding: "8px 10px", minWidth: 140 }}
                    >
                      <option value="All">All</option>
                      {brands.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <label
                      htmlFor="storage-filter"
                      style={{ color: "var(--muted)", fontSize: 13 }}
                    >
                      Storage:
                    </label>
                    <select
                      id="storage-filter"
                      name="storage"
                      className="input"
                      value={storageFilter}
                      onChange={(e) => setStorageFilter(e.target.value)}
                      style={{ padding: "8px 10px", minWidth: 110 }}
                    >
                      <option value="All">All</option>
                      {storages.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <label
                      htmlFor="condition-filter"
                      style={{ color: "var(--muted)", fontSize: 13 }}
                    >
                      Condition:
                    </label>
                    <select
                      id="condition-filter"
                      name="condition"
                      className="input"
                      value={conditionFilter}
                      onChange={(e) => setConditionFilter(e.target.value)}
                      style={{ padding: "8px 10px", minWidth: 110 }}
                    >
                      <option value="Any">Any</option>
                      <option value="new">New</option>
                      <option value="used">Used</option>
                    </select>
                    <label htmlFor="price-min" style={{ color: "var(--muted)", fontSize: 13 }}>
  Price:
</label>
<input
  id="price-min"
  name="priceMin"
  className="input"
  type="number"
  autoComplete="off"
  placeholder="Min"
  value={priceMin}
  onChange={(e) => setPriceMin(e.target.value)}
  style={{ width: 90 }}
/>
<label htmlFor="price-max" style={{ position: "absolute", left: -9999 }}>
  Maximum price
</label>
<input
  id="price-max"
  name="priceMax"
  className="input"
  type="number"
  autoComplete="off"
  placeholder="Max"
  value={priceMax}
  onChange={(e) => setPriceMax(e.target.value)}
  style={{ width: 90 }}
/>
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setBrandFilter("All");
                        setStorageFilter("All");
                        setConditionFilter("Any");
                        setPriceMin("");
                        setPriceMax("");
                      }}
                      style={{ marginLeft: 6 }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "20px 24px",
                  }}
                >
                  <p style={{ color: "var(--muted)", marginBottom: 8 }}></p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-gold"
                      onClick={() => {
                        applyFilters();
                        goTo("search");
                      }}
                    >
                      Apply filters
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        setBrandFilter("All");
                        setStorageFilter("All");
                        setConditionFilter("Any");
                        setPriceMin("");
                        setPriceMax("");
                        setAppliedProducts(null);
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                {/* Render search results here (stay on Search page) */}
                <div
                  style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "20px 24px",
                  }}
                >
                  {appliedProducts && appliedProducts.length > 0 ? (
                    <div style={{ marginTop: 16 }}>
                      {renderGrid(appliedProducts)}
                    </div>
                  ) : (
                    appliedProducts !== null && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "40px 0",
                          color: "var(--muted)",
                        }}
                      >
                        <p style={{ marginTop: 16, fontSize: 16 }}>
                          No products match your filters
                        </p>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category tabs moved into Products page */}

        {/* ── Products grid ────────────────────────────────────────────────────── */}
        {page === "products" && (
          <div
            style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}
          >
            {displayProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 0",
                  color: "var(--muted)",
                }}
              >
                <Icon name="package" size={48} />
                <p style={{ marginTop: 16, fontSize: 16 }}>No products found</p>
              </div>
            ) : (
              (() => {
                const sorted = displayProducts.slice();
                switch (sort) {
                  case "name-asc":
                    sorted.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                  case "name-desc":
                    sorted.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                  case "price-asc":
                    sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                    break;
                  case "price-desc":
                    sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                    break;
                  default:
                    break; // relevance / original order
                }
                return (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(260px,1fr))",
                      gap: 20,
                    }}
                  >
                    {sorted.map((p, i) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onAdd={onAddToCart}
                        onOpenModal={onOpenModal}
                        delay={i * 60}
                        priority={i < 2}
                      />
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px",
          textAlign: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        {settings.brandName || "Raw Essence"} © {new Date().getFullYear()} — All
        rights reserved.
        {settings.whatsapp && (
          <span style={{ marginLeft: 16 }}>
            <a
              href={"https://wa.me/" + settings.whatsapp.replace(/\D/g, "")}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#25d366",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Icon name="whatsapp" size={14} /> Chat with us
            </a>
          </span>
        )}
      </footer>
    </div>
  );
}

// Expose for legacy/global access when bundling as modules
window.StoreView = StoreView;
