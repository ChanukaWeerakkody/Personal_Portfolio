// Vercel serverless function: grounded multi-provider LLM proxy for the portfolio assistant.
// Supports ANTHROPIC_API_KEY, GROQ_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in Vercel env.
// The secret keys never reach the browser. Client-side local retrieval serves as zero-latency fallback.

const SYSTEM = `You are the AI portfolio assistant for Chanuka Weerakkody, a Backend-Focused Software Engineer building scalable systems, intelligent applications, and real-time experiences.

Rules:
1. Answer ONLY from the CONTEXT provided.
2. If the user asks something not covered in the context, politely state that you can only answer from verified portfolio records and encourage them to contact Chanuka directly at chanuka.weerakkody123@gmail.com.
3. NEVER fabricate, hallucinate, or assume experience, companies, qualifications, or client details not explicitly stated.
4. Keep answers concise (max 100 words), direct, and highly professional. Plain text only, no markdown headers.`;

const hits = new Map();
const WINDOW = 60_000;
const MAX_REQUESTS = 15;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting per IP
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || 'anon';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  if (recent.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment or explore the site directly.' });
  }
  hits.set(ip, [...recent, now]);

  const { message, context = '', history = [] } = req.body || {};
  if (typeof message !== 'string' || !message.trim() || message.length > 500) {
    return res.status(400).json({ error: 'Invalid message length or format.' });
  }

  const promptContext = String(context).slice(0, 4500);
  const userQuery = message.trim();

  // 1. Anthropic Claude (Primary if configured)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const messages = [
        ...history.slice(-4).filter((m) => m && typeof m.text === 'string').map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.text).slice(0, 600),
        })),
        { role: 'user', content: `VERIFIED CONTEXT:\n${promptContext}\n\nQUESTION: ${userQuery}` },
      ];

      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.CHAT_MODEL || 'claude-3-5-haiku-20241022',
          max_tokens: 300,
          system: SYSTEM,
          messages,
        }),
      });

      if (r.ok) {
        const data = await r.json();
        const reply = data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('') ?? '';
        if (reply) return res.status(200).json({ reply, provider: 'anthropic' });
      }
    } catch {
      // Continue to next provider or fallback
    }
  }

  // 2. Groq (High-speed open models)
  if (process.env.GROQ_API_KEY) {
    try {
      const messages = [
        { role: 'system', content: `${SYSTEM}\n\nVERIFIED CONTEXT:\n${promptContext}` },
        ...history.slice(-4).filter((m) => m && typeof m.text === 'string').map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.text).slice(0, 600),
        })),
        { role: 'user', content: userQuery },
      ];

      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages,
          max_tokens: 250,
          temperature: 0.2,
        }),
      });

      if (r.ok) {
        const data = await r.json();
        const reply = data.choices?.[0]?.message?.content ?? '';
        if (reply) return res.status(200).json({ reply, provider: 'groq' });
      }
    } catch {
      // Continue
    }
  }

  // 3. OpenAI compatible
  if (process.env.OPENAI_API_KEY) {
    try {
      const messages = [
        { role: 'system', content: `${SYSTEM}\n\nVERIFIED CONTEXT:\n${promptContext}` },
        ...history.slice(-4).filter((m) => m && typeof m.text === 'string').map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.text).slice(0, 600),
        })),
        { role: 'user', content: userQuery },
      ];

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages,
          max_tokens: 250,
          temperature: 0.2,
        }),
      });

      if (r.ok) {
        const data = await r.json();
        const reply = data.choices?.[0]?.message?.content ?? '';
        if (reply) return res.status(200).json({ reply, provider: 'openai' });
      }
    } catch {
      // Continue
    }
  }

  // If no upstream provider is configured or all fail, return 503 so client cleanly uses verified local engine
  return res.status(503).json({ error: 'LLM proxy not configured — using local verified knowledge engine.' });
}
