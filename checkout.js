// =============================================================
//  checkout.js
//  Handles order checkout:
//    1. Redirects the customer to WhatsApp with their order
//    2. Silently fires an order notification email to the owner
//  Depends on: constants.js (fmt), emailjs.js
// =============================================================

async function checkout(cart, settings, cartTotal, onSuccess) {
  if (!cart.length) return;

  // ── 1. Redirect customer to WhatsApp ────────────────────────────────────────
  if (settings?.whatsapp) {
    const number = settings.whatsapp.replace(/\D/g, "");
    const itemLines = cart.map((i) => "• " + i.name + " x" + i.qty).join("\n");
    const message =
      "Hello! I'd like to order:\n\n" +
      itemLines +
      "\n\nTotal: " +
      fmt(cartTotal) +
      "\n\nPlease confirm availability and payment. Thank you!";

    window.open(
      "https://wa.me/" + number + "?text=" + encodeURIComponent(message),
      "_blank",
    );
  }

  // ── 2. Silently email the owner via emailjs.js ───────────────────────────────
  try {
    await emailjsSendOrder(settings?.storeName, cart, cartTotal);
  } catch (e) {
    console.warn("EmailJS notification failed:", e);
  }

  // ── 3. Signal success to the App ────────────────────────────────────────────
  onSuccess();
}

// Expose for legacy access when bundled
window.checkout = checkout;
