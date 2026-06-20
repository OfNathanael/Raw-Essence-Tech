export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { adminPassword, path, data } = req.body;

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!["products", "settings"].includes(path)) {
    return res.status(400).json({ error: "Invalid path" });
  }

  try {
    const url = `${process.env.FIREBASE_DB_URL}/${path}.json`;
    const fbRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!fbRes.ok) return res.status(502).json({ error: "Firebase write failed" });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("admin-write error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}