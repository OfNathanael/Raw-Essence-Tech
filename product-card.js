// =============================================================
//  product-card.js
//  ProductCard — displayed in the store grid.
//  Clicking anywhere on the card opens ProductModal.
//  The "Add to Cart" button adds directly without opening modal.
//  Depends on: constants.js (fmt, CAT_COLORS), icons.js
// =============================================================
import React, { useState, useEffect, useRef } from "react";

function ProductCard({ product, onAdd, onOpenModal, delay, priority }) {
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const isAboveFold = !!priority;

  const handleAdd = (e) => {
    e.stopPropagation(); // prevent modal from opening
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="card fade-up product-card"
      style={{ animationDelay: delay + "ms", cursor: "pointer" }}
      onClick={() => onOpenModal(product)}
    >
      {/* Image */}
      <div
        style={{
          height: 220,
          overflow: "hidden",
          background: "var(--surface)",
          position: "relative",
        }}
      >
        {!imgErr && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="card-img"
            loading={isAboveFold ? "eager" : "lazy"}
            decoding={isAboveFold ? "sync" : "async"}
            fetchpriority={isAboveFold ? "high" : "low"}
            width="400"
            height="200"
            onError={(e) => {
              try {
                console.warn("Product image failed to load", {
                  id: product && product.id,
                  url: product && product.image,
                });
              } catch (err) {
                /* ignore */
              }
              setImgErr(true);
            }}
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
            <Icon name="image" size={40} />
          </div>
        )}
        <span
          className={"badge badge-" + (CAT_COLORS[product.category] || "gold")}
          style={{ position: "absolute", top: 10, left: 10 }}
        >
          {product.category}
        </span>
        {/* Tap hint overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, #00000055 0%, transparent 50%)",
            opacity: 0,
            transition: "opacity .2s",
          }}
          className="card-overlay"
        />
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <h2
          style={{
            fontFamily: "DM Sans",
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 6,
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </h2>
        {product.description && (
          <p
            style={{
              color: "var(--muted)",
              fontSize: 12.5,
              lineHeight: 1.6,
              marginBottom: 14,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
        )}
        {/* Brand / Memory / Condition */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginBottom: 10,
            color: "var(--muted)",
            fontSize: 12,
          }}
        >
          {product.brand && (
            <span style={{ fontWeight: 600 }}>{product.brand}</span>
          )}
          {product.memory && <span>{product.memory}</span>}
          {product.condition && (
            <span
              style={{
                padding: "4px 8px",
                borderRadius: 10,
                fontSize: 11,
                textTransform: "capitalize",
                background:
                  product.condition === "used" ? "#fef3c7" : "#ecfccb",
                color: "var(--muted)",
              }}
            >
              {product.condition}
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "DM Sans",
              fontWeight: 800,
              fontSize: 16,
              color: "var(--gold)",
            }}
          >
            {fmt(product.price)}
          </span>
          <button
            className="btn btn-gold"
            onClick={handleAdd}
            style={{ padding: "9px 16px", fontSize: 13, gap: 6 }}
          >
            {added ? (
              <>
                <Icon name="check" size={14} /> Added
              </>
            ) : (
              <>
                <Icon name="cart" size={14} /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Expose for legacy/global access when bundling as modules
window.ProductCard = ProductCard;
