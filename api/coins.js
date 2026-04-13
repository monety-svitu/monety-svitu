export default async function handler(req, res) {
  try {
    const gasUrl = process.env.GAS_WEB_APP_URL;

    if (!gasUrl) {
      return res.status(500).json({
        success: false,
        error: "Missing GAS_WEB_APP_URL"
      });
    }

    const url = new URL(gasUrl);
    url.searchParams.set("action", "getCoins");

    const allowedParams = ["country", "continent", "metal", "theme", "condition", "type"];

    for (const key of allowedParams) {
      const value = req.query[key];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        url.searchParams.set(key, String(value));
      }
    }

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
