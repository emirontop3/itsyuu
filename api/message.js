export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const DB_KEY = "PEOPLE_DATABASE"; // Tüm veriler bu anahtarda saklanacak

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (req.method === 'POST') {
      const { newData, isAdminAction } = req.body;
      
      // Önce mevcut listeyi çek
      const getRes = await fetch(`${url}/get/${DB_KEY}`, { headers: { Authorization: `Bearer ${token}` } });
      const getResult = await getRes.json();
      let currentData = getResult.result ? (typeof getResult.result === 'string' ? JSON.parse(getResult.result) : getResult.result) : [];

      let updatedData;
      if (isAdminAction) {
        // Admin her şeyi değiştirebilir
        updatedData = newData;
      } else {
        // Kullanıcı sadece yeni ekleyebilir
        updatedData = [...currentData, { ...newData, id: Date.now() }];
      }

      // Veritabanını güncelle
      await fetch(`${url}/set/${DB_KEY}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedData)
      });
      return res.status(200).json({ success: true, data: updatedData });
    }

    if (req.method === 'GET') {
      const response = await fetch(`${url}/get/${DB_KEY}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      const data = result.result ? (typeof result.result === 'string' ? JSON.parse(result.result) : result.result) : [];
      return res.status(200).json({ data });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
