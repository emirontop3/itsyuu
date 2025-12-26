export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const adminPass = process.env.pass;
  const DB_KEY = "PEOPLE_DB_V2";

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const getRes = await fetch(`${url}/get/${DB_KEY}`, { headers: { Authorization: `Bearer ${token}` } });
    const getResult = await getRes.json();
    let currentData = getResult.result ? (typeof getResult.result === 'string' ? JSON.parse(getResult.result) : getResult.result) : [];

    if (req.method === 'POST') {
      const { action, data, auth } = req.body;

      // Admin Kontrolü
      if ((action === 'delete' || action === 'update') && auth !== adminPass) {
        return res.status(403).json({ error: "Yetkisiz erişim!" });
      }

      if (action === 'create') {
        currentData.push({ ...data, id: Date.now(), comments: [] });
      } else if (action === 'comment') {
        const person = currentData.find(p => p.id === data.personId);
        if (person) person.comments.push({ text: data.comment, date: new Date().toLocaleString() });
      } else if (action === 'delete') {
        currentData = currentData.filter(p => p.id !== data.id);
      } else if (action === 'update') {
        const index = currentData.findIndex(p => p.id === data.id);
        if (index !== -1) currentData[index] = { ...currentData[index], ...data.updatedFields };
      } else if (action === 'delete_comment') {
        const person = currentData.find(p => p.id === data.personId);
        if (person) {
        person.comments = person.comments.filter((_, index) => index !== data.commentIndex);
  }
}
      
      await fetch(`${url}/set/${DB_KEY}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(currentData)
      });
      return res.status(200).json({ success: true, data: currentData });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ data: currentData, isAdmin: req.query.auth === adminPass });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
