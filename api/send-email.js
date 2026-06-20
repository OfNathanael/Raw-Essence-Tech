// api/send-email.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { storeName, cartItems, cartTotal } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "No cart items provided" });
    }

    // Format items into a readable string for the email template
    const orderItemsText = cartItems
      .map((item) => `${item.name} x${item.quantity || 1} — $${item.price}`)
      .join("\n");

    const orderDate = new Date().toLocaleString();

    const emailRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY, // only needed if you enabled "Private Key" mode in EmailJS
        template_params: {
          store_name: storeName,
          order_items: orderItemsText,
          order_total: cartTotal,
          order_date: orderDate,
          item_count: cartItems.length,
        },
      }),
    });

    if (!emailRes.ok) {
      const errorText = await emailRes.text();
      console.error("EmailJS error:", errorText);
      return res.status(502).json({ error: "EmailJS request failed" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("send-email handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}