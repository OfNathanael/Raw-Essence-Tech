// ============================================================
//  IMGBB CONFIG
//  Uploads are proxied through the protected serverless endpoint
//  /api/upload-imgbb, which checks the admin password (set in
//  sessionStorage at login) and uses the real ImgBB key stored
//  in server environment variables. No keys live in this file.
// ============================================================

async function imgbbUpload(file) {
  // Accept either a File or a base64 data URL string
  try {
    let dataUrl;
    if (typeof file === "string") {
      dataUrl = file;
    } else {
      dataUrl = await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(file);
      });
    }

    const adminPassword = sessionStorage.getItem("adminPassword");

    const resp = await fetch("/api/upload-imgbb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl, adminPassword }),
    });
    if (!resp.ok) throw new Error("ImgBB proxy upload failed");
    const json = await resp.json();
    return json.url;
  } catch (err) {
    console.warn("imgbbUpload proxy error", err);
    throw err;
  }
}

function imgbbEnabled() {
  // We rely on the serverless endpoint; return true so UI allows uploads.
  return true;
}