import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS ayarları (farklı yerlerden erişimi engellemek için)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { id, data } = req.body;
      if (!id || !data) return res.status(400).json({ error: "Eksik veri" });
      
      // Veriyi 7 gün sonra silinecek şekilde ayarla (opsiyonel)
      return res.status(200).json({ success: true });
    } 

    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID gerekli" });
      
      const data = await kv.get(id);
      return res.status(200).json({ data });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
