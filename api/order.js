// /api/order.js
export default async function handler(req, res) {
  // ✅ CORS (щоб браузер не блокував)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Приймаємо тільки POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    // 🔴 ВАЖЛИВО: сюди встав свій Apps Script Web App URL (exec) БЕЗ ?action=...
    const GAS_WEBAPP =
      "https://script.google.com/macros/s/AKfycbxUON1PQ9rPVkZd5zPOpMnoTPy7eGobv6302yTT9EP6cswOB5moP1owRyjfn3wNm_6k/exec";

    // payload з сайту
    const payload = req.body || {};

    // Відправляємо у GAS (action=createOrder)
    const url = `${GAS_WEBAPP}?action=createOrder`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const text = await r.text();

    // GAS інколи повертає текст — пробуємо зробити JSON
    let out;
    try {
      out = JSON.parse(text);
    } catch (_) {
      out = { raw: text };
    }

    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
