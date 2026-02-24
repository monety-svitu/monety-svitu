// /api/order.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Use POST" });

  try {
    const GAS_WEBAPP =
      "https://script.google.com/macros/s/AKfycbxUON1PQ9rPVkZd5zPOpMnoTPy7eGobv6302yTT9EP6cswOB5moP1owRyjfn3wNm_6k/exec";

    // ✅ 1) Надійно читаємо body
    let payload = req.body;

    // Якщо req.body порожній — читаємо raw вручну
    if (!payload || (typeof payload === "object" && Object.keys(payload).length === 0)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString("utf8");
      payload = raw ? JSON.parse(raw) : {};
    }

    // ✅ 2) Мінімальна перевірка
    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      return res.status(400).json({ success: false, error: "Empty items" });
    }

    // ✅ 3) Надсилаємо в GAS
    const url = `${GAS_WEBAPP}?action=createOrder`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await r.text();

    let out;
    try {
      out = JSON.parse(text);
    } catch {
      out = { success: false, error: "GAS returned non-JSON", raw: text?.slice?.(0, 300) || String(text) };
    }

    // Якщо GAS каже success:false — віддаємо як помилку
    if (!out || out.success !== true) {
      return res.status(400).json(out);
    }

    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e) });
  }
}
