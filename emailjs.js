// ============================================================
//  EMAILJS CONFIG
//  Fill in your EmailJS credentials below.
//
//  How to get them:
//  1. Create a free account at https://www.emailjs.com
//  2. Go to Email Services → Add New Service (connect Gmail etc.)
//     → copy the Service ID into `serviceId` below
//  3. Go to Email Templates → Create New Template
//     Use these variables anywhere in the template body:
//       {{store_name}}   — your store name
//       {{order_items}}  — list of items ordered
//       {{order_total}}  — total price
//       {{order_date}}   — date and time of order
//       {{item_count}}   — number of items
//     → copy the Template ID into `templateId` below
//  4. Go to Account → General → copy your Public Key into `publicKey`
//  5. Put the email address where you want alerts in `ownerEmail`
// ============================================================

// Client-side shim: forward order data to serverless endpoint which uses
// server-side EmailJS credentials stored in environment variables.
async function emailjsSendOrder(storeName, cartItems, cartTotal) {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeName, cartItems, cartTotal }),
    });
  } catch (err) {
    console.warn("emailjsSendOrder proxy failed", err);
    throw err;
  }
}

function emailjsEnabled() {
  // Serverless endpoint handles the presence/absence of credentials.
  // Return true so UI will attempt to send; failures will be reported.
  return true;
}
