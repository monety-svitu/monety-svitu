export default async function handler(req, res) {
  try {
    const gasUrl = process.env.GAS_WEB_APP_URL;

    if (!gasUrl) {
      return res.status(500).json({
        success: false,
        error: "Missing GAS_WEB_APP_URL"
      });
    }

    const slug = String(req.query.slug || "").trim();
    const id = String(req.query.id || "").trim();

    if (!slug && !id) {
      return res.status(400).json({
        success: false,
        error: "Missing slug or id"
      });
    }

    const url = new URL(gasUrl);
    url.searchParams.set("action", "getCoin");

    if (slug) url.searchParams.set("slug", slug);
    if (id) url.searchParams.set("id", id);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Invalid JSON from GAS",
        raw: text
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: String(error)
    });
  }
}
