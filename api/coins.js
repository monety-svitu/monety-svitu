export default async function handler(req, res) {
  try {
    const GAS = "https://script.google.com/macros/s/AKfycbzJ36NWONGMOd94OL7iziHolfa-rq-HvNs8LEUGaYyvA2LfMjqcObhkGQ72n4LcSmOZ/exec";

    const url = GAS + "?action=getCoins";
    const r = await fetch(url);
    const text = await r.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(text);

  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
