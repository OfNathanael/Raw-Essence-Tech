// =============================================================
//  product-modal.js
//  ProductModal — full product detail popup.
//  Uses React.useState / React.useEffect directly to avoid
//  any duplicate const declaration conflicts across script tags.
//  Depends on: constants.js (fmt, CAT_COLORS), icons.js
// =============================================================
function ProductModal({ product, onClose, onAdd }) {
  const [added, setAdded] = React.useState(false);
  const [imgErr, setImgErr] = React.useState(false);
  const [shareMsg, setShareMsg] = React.useState(null);

  // Close on Escape key + lock body scroll
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, []);

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleShare = async () => {
    const url = `${location.origin}${location.pathname}?product=${encodeURIComponent(product.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description || "",
          url,
        });
        setShareMsg("Shared");
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setShareMsg("Link copied to clipboard");
      } else {
        const tmp = document.createElement("input");
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        setShareMsg("Link copied to clipboard");
      }
    } catch (err) {
      setShareMsg("Unable to share");
    }
    setTimeout(() => setShareMsg(null), 3000);
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "#00000090",
          backdropFilter: "blur(6px)",
          zIndex: 600,
          animation: "fadeIn .2s ease",
        }}
      />

      {/* ── Modal panel ── */}
      <div
        className="slide-up-modal"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 700,
          width: "min(560px, 95vw)",
          maxHeight: "90vh",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px #00000080, 0 0 0 1px #4ade8010",
        }}
      >
        {/* ── Close button ── */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 10,
            background: "#00000060",
            border: "none",
            borderRadius: "50%",
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            backdropFilter: "blur(4px)",
            transition: "background .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#00000090")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#00000060")}
        >
          <Icon name="close" size={16} />
        </button>

        {/* ── Product image ── */}
        <div
          style={{
            width: "100%",
            height: 280,
            background: "var(--surface)",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!imgErr && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setImgErr(true)}
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
              <Icon name="image" size={56} />
            </div>
          )}
          <span
            className={
              "badge badge-" + (CAT_COLORS[product.category] || "gold")
            }
            style={{ position: "absolute", bottom: 14, left: 14, fontSize: 12 }}
          >
            {product.category}
          </span>
        </div>

        {/* ── Product details ── */}
        <div style={{ padding: "24px 24px 28px", overflowY: "auto", flex: 1 }}>
          <h2
            style={{
              fontFamily: "DM Sans",
              fontWeight: 800,
              fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
              lineHeight: 1.25,
              marginBottom: 12,
              color: "var(--text)",
            }}
          >
            {product.name}
          </h2>

          {product.description ? (
            <p
              style={{
                color: "var(--muted)",
                fontSize: 14.5,
                lineHeight: 1.8,
                marginBottom: 24,
              }}
            >
              {product.description}
            </p>
          ) : (
            <p
              style={{
                color: "var(--muted)",
                fontSize: 14,
                marginBottom: 24,
                fontStyle: "italic",
              }}
            >
              No description available.
            </p>
          )}

          {/* Brand / Memory / Condition */}
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              marginBottom: 20,
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            {product.brand && (
              <div>
                <strong
                  style={{
                    color: "var(--text)",
                    fontWeight: 700,
                    marginRight: 6,
                  }}
                >
                  {product.brand}
                </strong>
              </div>
            )}
            {product.memory && <div>Memory: {product.memory}</div>}
            {product.condition && (
              <div>
                Condition:{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {product.condition}
                </span>
              </div>
            )}
          </div>

          <div
            style={{ borderTop: "1px solid var(--border)", marginBottom: 20 }}
          />

          {/* Price + Share + Add to Cart */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                }}
              >
                Price
              </p>
              <span
                style={{
                  fontFamily: "DM Sans",
                  fontWeight: 800,
                  fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
                  color: "var(--gold)",
                }}
              >
                {fmt(product.price)}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                className="btn"
                onClick={handleShare}
                style={{
                  padding: "10px 16px",
                  fontSize: 14,
                  gap: 8,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--gold)",
                }}
              >
                <Icon name="share" size={16} /> Share
              </button>

              <button
                className="btn btn-gold"
                onClick={handleAdd}
                style={{
                  padding: "13px 28px",
                  fontSize: 15,
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                {added ? (
                  <>
                    <Icon name="check" size={16} /> Added to Cart
                  </>
                ) : (
                  <>
                    <Icon name="cart" size={16} /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>

          {shareMsg && (
            <div style={{ marginTop: 12, color: "var(--muted)", fontSize: 13 }}>
              {shareMsg}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Expose for legacy/global access when bundling as modules
window.ProductModal = ProductModal;
