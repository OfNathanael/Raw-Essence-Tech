export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body; // base64 data URL, e.g. "data:image/png;base64,...."

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // ImgBB expects raw base64 (no "data:image/...;base64," prefix)
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    const formData = new URLSearchParams();
    formData.append("image", base64Data);

    const imgbbRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      }
    );

    const data = await imgbbRes.json();

    if (!imgbbRes.ok || !data?.data?.url) {
      console.error("ImgBB upload failed:", data);
      return res.status(502).json({ error: "ImgBB upload failed" });
    }

    return res.status(200).json({ url: data.data.url });
  } catch (err) {
    console.error("upload-imgbb handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}