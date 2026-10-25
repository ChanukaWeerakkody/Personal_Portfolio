import { profile, projects, skills, timeline, articles } from '@/data/profile';

/**
 * Retrieval-grounded assistant. Works fully offline (BM25-style scoring over a corpus generated from
 * profile data, so answers never drift from the site). If VITE_CHAT_ENDPOINT is set, the retrieved
 * context is sent to an LLM proxy (see /api/chat.js) and the local answer is the fallback.
 */

const STOP = new Set('a an the is are was were be been of in on at to for and or but with about what who how why when where which do does did can could would should tell me you your his he she it its this that these those i my we us our please give show any some there have has had from as by'.split(' '));
const tokenize = (s) => s.toLowerCase().split(/[^a-z0-9+#.]+/).filter((w) => w.length > 1 && !STOP.has(w));
const stem = (w) => w.replace(/(ing|ed|es|s)$/, '');

const work = timeline.filter((t) => t.type === 'work');
const edu = timeline.filter((t) => t.type === 'education');

// Each doc: id, text for retrieval, answer builder, optional navigation target.
const DOCS = [
  { id: 'intro', section: 'about', kw: 'who introduction about summary background overview engineer specialise specialize specialisation specialization specialist role roles expertise focus',
    answer: () => `${profile.name} is a ${profile.role} specialising in ${profile.roles.join(', ')}. ${profile.tagline}` },
  { id: 'experience', section: 'experience', kw: 'experience work job career company employer aventure redcode intern associate role current years',
    answer: () => work.map((w) => `• ${w.title} — ${w.org} (${w.period})`).join('\n') + '\nHe has built production APIs with JWT auth, RBAC and optimised MySQL.' },
  { id: 'education', section: 'experience', kw: 'education degree university study studied school diploma ijse wrexham gdse bsc qualification',
    answer: () => edu.slice(0, 3).map((e) => `• ${e.title} — ${e.org} (${e.period})`).join('\n') },
  { id: 'skills', section: 'skills', kw: 'skills tech stack technologies languages tools expertise proficient strongest specialise specialize specialty speciality',
    answer: () => `Strongest (5/5): ${skills.filter((s) => s.level === 5).map((s) => s.name).join(', ')}. Also: ${skills.filter((s) => s.level < 5).map((s) => s.name).join(', ')}.` },
  { id: 'projects', section: 'projects', kw: 'projects portfolio built work samples applications apps',
    answer: () => projects.map((p) => `• ${p.title} (${p.year})`).join('\n') },
  { id: 'contact', section: 'contact', kw: 'contact email hire reach phone call linkedin message available availability freelance opportunity',
    answer: () => `Email ${profile.email} · Phone ${profile.phone} · LinkedIn ${profile.linkedin}. ${profile.available ? 'Currently open to new opportunities.' : ''}` },
  { id: 'location', section: 'contact', kw: 'location live based country city where timezone remote sri lanka',
    answer: () => `Based in ${profile.location} (UTC+5:30), open to remote collaboration with teams worldwide.` },
  { id: 'writing', section: 'writing', kw: 'blog articles writing medium posts write publish',
    answer: () => `He writes on Medium. Latest: “${articles[0].title}”, plus ${articles.length - 1} more on architecture, security and DevOps.` },
  { id: 'github', section: 'github', kw: 'github open source contributions repos repositories commits activity',
    answer: () => `His GitHub is ${profile.githubUrl}. The GitHub section shows live contribution stats.` },
  ...skills.map((s) => ({
    id: `skill-${s.name}`, section: 'skills',
    kw: `${s.name} ${s.aliases.join(' ')} ${s.cat}`,
    answer: () => {
      const used = projects.filter((p) => p.tags.some((t) => t.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]))).map((p) => p.title.split(' – ')[0]);
      return `${s.name}: self-rated ${s.level}/5 (${s.cat}).${used.length ? ` Used in ${used.slice(0, 3).join(', ')}.` : ''}`;
    },
  })),
  ...projects.map((p) => ({
    id: `project-${p.id}`, section: 'projects',
    kw: `${p.title} ${p.tags.join(' ')} ${p.description} ${p.category}`,
    answer: () => `${p.title} (${p.year}): ${p.description}\nChallenge: ${p.challenge}\nSolution: ${p.solution}`,
  })),
];

const corpus = DOCS.map((d) => ({ ...d, tokens: tokenize(d.kw).map(stem) }));
const df = new Map();
corpus.forEach((d) => new Set(d.tokens).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1)));
const idf = (t) => Math.log(1 + (corpus.length - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));

export function retrieve(query, k = 3) {
  const q = tokenize(query).map(stem);
  if (!q.length) return [];
  return corpus
    .map((d) => {
      const tf = new Map();
      d.tokens.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
      const score = q.reduce((sum, t) => {
        const f = tf.get(t) ?? 0;
        return sum + (f ? idf(t) * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.tokens.length / 25)))) : 0);
      }, 0);
      return { doc: d, score };
    })
    .filter((r) => r.score > 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export const SUGGESTIONS = ['What does Chanuka specialise in?', 'Tell me about Kafka experience', 'Is he available for hire?', 'Show recent projects'];

export function localAnswer(query) {
  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/i.test(query.trim()))
    return { text: `Hi! I'm Chanuka's portfolio assistant. Ask about his skills, experience, projects or availability.`, section: null };
  if (/\b(thanks|thank you|cheers)\b/i.test(query))
    return { text: `Happy to help! Anything else you'd like to know?`, section: null };
  const hits = retrieve(query);
  if (!hits.length)
    return { text: `I can only answer from what's on this site. Try asking about his skills, projects, experience, or how to contact him.`, section: null, miss: true };
  const [top, ...rest] = hits;
  const extra = rest.filter((r) => r.score > top.score * 0.75 && r.doc.id.startsWith('project-') && top.doc.id.startsWith('project-')).slice(0, 1);
  return { text: [top, ...extra].map((r) => r.doc.answer()).join('\n\n'), section: top.doc.section };
}

/** Context block handed to an LLM proxy so it stays grounded in site data. */
export function buildContext(query) {
  return retrieve(query, 5).map((r) => r.doc.answer()).join('\n---\n');
}

export async function ask(query, history = []) {
  const endpoint = import.meta.env.VITE_CHAT_ENDPOINT;
  const local = localAnswer(query);
  if (!endpoint) return { ...local, source: 'local' };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(endpoint, {
      method: 'POST', signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, context: buildContext(query), history: history.slice(-6) }),
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (!data.reply) throw new Error('empty');
    return { text: data.reply, section: local.section, source: 'llm' };
  } catch {
    return { ...local, source: 'local' };
  }
}
