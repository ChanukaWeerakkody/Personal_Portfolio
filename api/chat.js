// Vercel serverless function: grounded LLM proxy for the portfolio assistant.
// Set ANTHROPIC_API_KEY in your Vercel project env. The key never reaches the browser.
const SYSTEM = `You are the portfolio assistant for Chanuka Weerakkody, a backend software engineer.
Answer ONLY from the CONTEXT provided. If the answer isn't in the context, say you don't know and suggest contacting him.
Be concise (max 90 words), friendly, and plain text only.`;

const hits = new Map(); // naive per-instance rate limit
const WINDOW = 60_000, MAX = 12;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'anon';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (recent.length >= MAX) return res.status(429).json({ error: 'Too many requests' });
  hits.set(ip, [...recent, now]);

  const { message, context = '', history = [] } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 500)
    return res.status(400).json({ error: 'Invalid message' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'Not configured' });

  const messages = [
    ...history.slice(-6).filter((m) => m && typeof m.text === 'string').map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant', content: String(m.text).slice(0, 800),
    })),
    { role: 'user', content: `CONTEXT:\n${String(context).slice(0, 4000)}\n\nQUESTION: ${message.trim()}` },
  ];

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.CHAT_MODEL || 'claude-haiku-4-5-20251001', max_tokens: 300, system: SYSTEM, messages }),
    });
    if (!r.ok) return res.status(502).json({ error: 'Upstream error' });
    const data = await r.json();
    const reply = data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('') ?? '';
    return res.status(200).json({ reply });
  } catch {
    return res.status(502).json({ error: 'Upstream error' });
  }
}
