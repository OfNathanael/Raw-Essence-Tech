export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body;

  console.log("ADMIN_PASSWORD is set:", !!process.env.ADMIN_PASSWORD);
  console.log("ADMIN_PASSWORD length:", (process.env.ADMIN_PASSWORD || "").length);
  console.log("Password received length:", (password || "").length);

  if (password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ success: true });
  }
  return res.status(401).json({ success: false, error: "Incorrect password" });
}