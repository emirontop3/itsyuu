export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { id, data } = req.body;
      await fetch(`${url}/set/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(data) 
      });
      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      const { id } = req.query;
      const response = await fetch(`${url}/get/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      
      // Upstash bazen veriyi string içinde döndürür, temizliyoruz
      let cleanData = result.result;
      if (typeof cleanData === 'string' && cleanData.startsWith('"')) {
          cleanData = JSON.parse(cleanData);
      }
      
      return res.status(200).json({ data: cleanData });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
