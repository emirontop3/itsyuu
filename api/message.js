import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, data } = req.body;
    await kv.set(id, data);
    return res.status(200).json({ success: true });
  } 

  if (req.method === 'GET') {
    const { id } = req.query;
    const data = await kv.get(id);
    return res.status(200).json({ data });
  }
}
