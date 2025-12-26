import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Vercel'in senin için tanımladığı ENV'leri alıyoruz
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  // CORS ve Başlık Ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { id, data } = req.body;
      
      // Veriyi Vercel KV'ye gönder (Kütüphanesiz direkt bağlantı)
      await fetch(`${url}/set/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      
      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      const { id } = req.query;
      
      // Veriyi Vercel KV'den oku
      const response = await fetch(`${url}/get/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      
      // Upstash/KV formatında veri 'result' içindedir
      return res.status(200).json({ data: result.result });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
