// /api/order.js (Vercel)
// Надійно читає JSON body (навіть якщо req.body пустий) і відправляє в GAS

export const config = {
  api: {
    bodyParser: false, // ✅ важливо: читаємо raw body самі
  },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Use POST" });

  try {
    const GAS_WEBAPP =
      "https://script.google.com/macros/s/AKfycbxUON1PQ9rPVkZd5zPOpMnoTPy7eGobv6302yTT9EP6cswOB5moP1owRyjfn3wNm_6k/exec";

    // ✅ читаємо тіло запиту
    const raw = await readRawBody(req);
    let payload = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch (e) {
      return res.status(400).json({ success: false, error: "Bad JSON", raw: raw?.slice?.(0, 300) || "" });
    }

    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      return res.status(400).json({ success: false, error: "Empty items" });
    }

    // ✅ відправляємо в GAS
    const url = `${GAS_WEBAPP}?action=createOrder`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const text = await r.text();

    let out;
    try {
      out = JSON.parse(text);
    } catch {
      out = { success: false, error: "GAS returned non-JSON", raw: text?.slice?.(0, 400) || String(text) };
    }

    // якщо GAS каже success:false — віддаємо 400 (щоб фронт бачив)
    if (!out || out.success !== true) {
      return res.status(400).json(out);
    }

    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e) });
  }
}
