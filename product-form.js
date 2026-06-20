// =============================================================
//  product-form.js
//  ProductForm — add or edit a product.
//  Supports image upload via ImgBB or a pasted URL.
//  Depends on: constants.js, icons.js, imgbb.js
// =============================================================
import React, { useState, useEffect, useRef } from "react";

function ProductForm({ product, onSave, onCancel, showToast }) {
  const [form, setForm] = useState(
    product || {
      name: "",
      category: "Phones",
      price: "",
      image: "",
      description: "",
      brand: "",
      condition: "new",
      memory: "",
    },
  );
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(product?.image || "");
  const fileRef = useRef();

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show a local preview straight away
    setPreview(URL.createObjectURL(file));

    if (!imgbbEnabled()) {
      showToast(
        "Add your ImgBB API key in imgbb.js to enable image uploads.",
        "error",
      );
      return;
    }

    setUploading(true);
    try {
      const url = await imgbbUpload(file);
      set("image", url);
      setPreview(url);
      showToast("Image uploaded successfully!");
    } catch {
      showToast(
        "Image upload failed. Check your ImgBB key in imgbb.js.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.price) {
      showToast("Name and price are required.", "error");
      return;
    }
    onSave({ ...form, price: parseFloat(form.price) });
  };

  return (
    <div
      className="card fade-up"
      style={{
        padding: 24,
        marginBottom: 24,
        borderColor: "#22c55e44",
        borderWidth: 1.5,
      }}
    >
      <h3
        style={{
          fontFamily: "DM Sans",
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 20,
        }}
      >
        {product ? "Edit Product" : "Add New Product"}
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Name */}
        <div>
          <label
            htmlFor="pf-name"
            style={{
              fontSize: 12,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Product Name *
          </label>
          <input
            id="pf-name"
            name="name"
            className="input"
            placeholder="e.g. Samsung Galaxy S24"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="pf-category"
            style={{
              fontSize: 12,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Category *
          </label>
          <select
            id="pf-category"
            name="category"
            className="input"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="pf-price"
            style={{
              fontSize: 12,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Price (₦) *
          </label>
          <input
            id="pf-price"
            name="price"
            className="input"
            type="number"
            placeholder="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </div>

        {/* Brand */}
        <div>
          <label
            htmlFor="pf-brand"
            style={{
              fontSize: 12,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Brand
          </label>
          <input
            id="pf-brand"
            name="brand"
            className="input"
            placeholder="e.g. Samsung"
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
          />
        </div>

        {/* Condition */}
        <div>
          <label
            htmlFor="pf-condition"
            style={{
              fontSize: 12,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Condition
          </label>
          <select
            id="pf-condition"
            name="condition"
            className="input"
            value={form.condition}
            onChange={(e) => set("condition", e.target.value)}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>

        {/* Memory / Storage */}
        <div>
          <label
            htmlFor="pf-memory"
            style={{
              fontSize: 12,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Memory / Capacity
          </label>
          <input
            id="pf-memory"
            name="memory"
            className="input"
            placeholder="e.g. 128GB"
            value={form.memory}
            onChange={(e) => set("memory", e.target.value)}
          />
        </div>

        {/* Image */}
        <div>
          <label
            htmlFor="pf-image-file"
            style={{
              fontSize: 12,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Product Image
          </label>
          <input
            id="pf-image-file"
            name="imageFile"
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            style={{
              width: "100%",
              justifyContent: "center",
              fontSize: 13,
              padding: "10px 12px",
              gap: 6,
              marginBottom: 8,
            }}
          >
            {uploading ? (
              <>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid var(--border)",
                    borderTopColor: "var(--gold)",
                    borderRadius: "50%",
                    animation: "spin .7s linear infinite",
                  }}
                />
                Uploading…
              </>
            ) : (
              <>
                <Icon name="upload" size={14} /> Upload from Device
              </>
            )}
          </button>
          <input
            id="pf-image-url"
            name="image"
            className="input"
            placeholder="…or paste image URL"
            value={form.image}
            onChange={(e) => {
              set("image", e.target.value);
              setPreview(e.target.value);
            }}
            style={{ fontSize: 12 }}
          />
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: 12,
                color: "var(--muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Image Preview
            </label>
            <div
              style={{
                width: "100%",
                height: 160,
                borderRadius: 10,
                overflow: "hidden",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={preview}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div style={{ gridColumn: "1 / -1" }}>
          <label
            style={{
              fontSize: 12,
              color: "var(--muted)",
              display: "block",
              marginBottom: 6,
            }}
          >
            Description
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="Brief product description…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          className="btn btn-gold"
          onClick={handleSubmit}
          disabled={uploading}
        >
          <Icon name="check" size={15} /> Save Product
        </button>
        <button className="btn btn-outline" onClick={onCancel}>
          <Icon name="close" size={15} /> Cancel
        </button>
      </div>
    </div>
  );
}

// Expose for legacy/global access when bundling as modules
window.ProductForm = ProductForm;
