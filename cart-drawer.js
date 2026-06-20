// =============================================================
//  cart-drawer.js
//  CartDrawer — side panel showing cart contents.
//  Depends on: constants.js (fmt), icons.js
// =============================================================

function CartDrawer({
  cart,
  total,
  settings,
  orderSent,
  onClose,
  onRemove,
  onUpdateQty,
  onCheckout,
}) {
  return (
    <div
      className="slide-in"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(420px, 100vw)",
        background: "var(--surface)",
        borderLeft: "1px solid var(--border)",
        zIndex: 500,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="cart" size={18} />
          <span
            style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: 17 }}
          >
            Your Cart
          </span>
          <span
            style={{
              background: "var(--border)",
              borderRadius: 20,
              padding: "2px 8px",
              fontSize: 12,
              color: "var(--muted)",
            }}
          >
            {cart.length}
          </span>
        </div>
        <button className="btn-ghost" onClick={onClose}>
          <Icon name="close" size={16} />
        </button>
      </div>

      {/* ── Order success screen ── */}
      {orderSent ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: "#22c55e22",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--success)",
              marginBottom: 20,
              border: "2px solid #22c55e44",
            }}
          >
            <Icon name="check" size={32} />
          </div>
          <h3
            style={{
              fontFamily: "DM Sans",
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 10,
            }}
          >
            Order Sent!
          </h3>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>
            You've been redirected to WhatsApp to complete your order. The
            seller will follow up shortly!
          </p>
        </div>
      ) : /* ── Empty cart ── */
      cart.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            gap: 12,
          }}
        >
          <Icon name="cart" size={40} />
          <p style={{ fontSize: 14 }}>Your cart is empty</p>
        </div>
      ) : (
        /* ── Cart items ── */
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 56,
                      height: 56,
                      objectFit: "cover",
                      borderRadius: 8,
                      flexShrink: 0,
                    }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13.5,
                      lineHeight: 1.3,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      color: "var(--gold)",
                      fontWeight: 700,
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    {fmt(item.price * item.qty)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <button
                    className="btn-ghost"
                    onClick={() => onUpdateQty(item.id, -1)}
                    style={{ padding: 5, borderRadius: 6 }}
                  >
                    <Icon name="minus" size={12} />
                  </button>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      minWidth: 20,
                      textAlign: "center",
                    }}
                  >
                    {item.qty}
                  </span>
                  <button
                    className="btn-ghost"
                    onClick={() => onUpdateQty(item.id, 1)}
                    style={{ padding: 5, borderRadius: 6 }}
                  >
                    <Icon name="plus" size={12} />
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => onRemove(item.id)}
                    style={{
                      padding: 5,
                      borderRadius: 6,
                      color: "var(--danger)",
                      marginLeft: 4,
                    }}
                  >
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div
            style={{
              padding: "16px 16px 24px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                alignItems: "center",
              }}
            >
              <span style={{ color: "var(--muted)", fontSize: 14 }}>Total</span>
              <span
                style={{
                  fontFamily: "DM Sans",
                  fontWeight: 800,
                  fontSize: 22,
                  color: "var(--gold)",
                }}
              >
                {fmt(total)}
              </span>
            </div>
            <button
              className="btn btn-gold"
              onClick={onCheckout}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "14px",
                fontSize: 15,
              }}
            >
              <Icon name="whatsapp" size={18} /> Order via WhatsApp
            </button>
            {!settings.whatsapp && (
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: 11,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                ⚠ Set your WhatsApp number in Admin → Settings
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Expose for legacy/global access when bundling as modules
window.CartDrawer = CartDrawer;
