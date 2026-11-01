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
  { id: 'intro', section: 'about', kw: 'who introduction about summary background overview engineer specialise specialize specialisation specialization specialist role roles expertise focus positioning',
    answer: () => `${profile.name} is a ${profile.role} based in ${profile.location}. ${profile.tagline}` },
  { id: 'experience', section: 'experience', kw: 'experience work job career company employer aventure redcode intern associate software engineer role current years',
    answer: () => work.map((w) => `• ${w.title} — ${w.org} (${w.period}): ${w.detail}`).join('\n\n') },
  { id: 'education', section: 'experience', kw: 'education degree university study studied school diploma ijse wrexham gdse bsc qualification computing',
    answer: () => edu.slice(0, 3).map((e) => `• ${e.title} — ${e.org} (${e.period})${e.detail ? `: ${e.detail}` : ''}`).join('\n') },
  { id: 'skills', section: 'skills', kw: 'skills tech stack technologies languages tools expertise proficient strongest specialise specialize specialty speciality',
    answer: () => `Core Technologies: Spring Boot, NestJS, Node.js, PHP/Laravel, Java, TypeScript, MySQL, PostgreSQL, MongoDB, Redis, Apache Kafka, Docker, and REST API design.` },
  { id: 'architecture', section: 'architecture', kw: 'architecture system design microservices event driven kafka streaming rbac security database optimization scaling patterns',
    answer: () => `Chanuka designs decoupled, production-grade systems: Event-driven pipelines with Apache Kafka and WebSockets, modular NestJS and Spring Boot microservices, high-throughput database tuning with composite indexing and Redis caching, and defense-in-depth security with stateless JWT & RBAC guards.` },
  { id: 'projects', section: 'projects', kw: 'projects portfolio built work samples applications apps',
    answer: () => projects.map((p) => `• ${p.title} (${p.year}) [${p.category}]: ${p.tags.slice(0, 3).join(', ')}`).join('\n') },
  { id: 'contact', section: 'contact', kw: 'contact email hire reach phone call linkedin message available availability freelance opportunity',
    answer: () => `Email: ${profile.email} · Phone: ${profile.phone} · LinkedIn: ${profile.linkedin}. ${profile.available ? 'Currently open to high-impact backend & full-stack opportunities.' : ''}` },
  { id: 'location', section: 'contact', kw: 'location live based country city where timezone remote sri lanka colombo',
    answer: () => `Based in ${profile.location} (UTC+5:30), fully available for remote engineering roles and global distributed teams.` },
  { id: 'writing', section: 'writing', kw: 'blog articles writing medium posts write publish nginx microservices prisma security aes ' + articles.map(a => a.title).join(' '),
    answer: () => `He writes technical architecture deep dives on Medium:\n${articles.map(a => `• "${a.title}" (${a.readingTime}): ${a.summary}`).join('\n')}` },
  { id: 'github', section: 'github', kw: 'github open source contributions repos repositories commits activity',
    answer: () => `Public GitHub profile: ${profile.githubUrl}. The GitHub Activity section displays verified repository metrics and contribution frequency.` },
  ...skills.map((s) => ({
    id: `skill-${s.name}`, section: 'skills',
    kw: `${s.name} ${s.aliases.join(' ')} ${s.cat}`,
    answer: () => {
      const used = projects.filter((p) => p.tags.some((t) => t.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]))).map((p) => p.title.split(' – ')[0]);
      return `${s.name} (${s.cat}): Self-rated ${s.level}/5.${used.length ? ` Implemented in ${used.slice(0, 3).join(', ')}.` : ''}`;
    },
  })),
  ...projects.map((p) => ({
    id: `project-${p.id}`, section: 'projects',
    kw: `${p.title} ${p.tags.join(' ')} ${p.description} ${p.category} ${p.challenge} ${p.solution} ${p.architecture?.overview || ''}`,
    answer: () => {
      const arch = p.architecture ? `\nArchitecture: ${p.architecture.overview}\nSecurity & DB: ${p.architecture.security} | ${p.architecture.databaseDesign}` : '';
      return `${p.title} (${p.year}) [${p.category}]:\n${p.description}\nKey Challenge: ${p.challenge}\nEngineered Solution: ${p.solution}${arch}\nRepo: ${p.github}`;
    },
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

export const SUGGESTIONS = [
  'What is Chanuka’s backend stack?',
  'Explain the Kafka crypto architecture',
  'Tell me about the Boat Fishing System',
  'How does he implement RBAC & security?',
  'Is he available for hire?',
];

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

export const COMMAND_FALLBACK = "Command not recognized. Type '/help' for available options.";

export const CHAT_COMMAND_ALIASES = {
  '?': 'help',
  bio: 'about',
  intro: 'about',
  journey: 'experience',
  timeline: 'experience',
  stack: 'skills',
  tech: 'skills',
  work: 'projects',
  articles: 'writing',
  blogs: 'writing',
  blog: 'writing',
  hire: 'contact',
  email: 'contact',
};

export const CHAT_COMMANDS = {
  help: {
    name: 'help',
    description: 'List all available chatbot commands',
    execute: () => ({
      text: [
        'Available commands:',
        '• /help — Show available commands',
        '• /about — Overview & background',
        '• /skills — Technical stack & core tools',
        '• /projects — Key projects & portfolio',
        '• /architecture — System architecture & patterns',
        '• /experience — Career journey & education',
        '• /writing — Technical articles & blogs',
        '• /github — GitHub activity & repos',
        '• /contact — Contact details & availability',
        '• /clear — Clear conversation history',
      ].join('\n'),
      section: null,
    }),
  },
  about: {
    name: 'about',
    description: 'Learn about Chanuka',
    execute: () => ({
      text: `${profile.name} is a ${profile.role} based in ${profile.location}. ${profile.tagline}`,
      section: 'about',
    }),
  },
  skills: {
    name: 'skills',
    description: 'Core technologies and technical stack',
    execute: () => ({
      text: 'Core Technologies: Spring Boot, NestJS, Node.js, PHP/Laravel, Java, TypeScript, MySQL, PostgreSQL, MongoDB, Redis, Apache Kafka, Docker, and REST API design.',
      section: 'skills',
    }),
  },
  projects: {
    name: 'projects',
    description: 'Featured engineering projects',
    execute: () => ({
      text: projects.map((p) => `• ${p.title} (${p.year}) [${p.category}]: ${p.tags.slice(0, 3).join(', ')}`).join('\n'),
      section: 'projects',
    }),
  },
  architecture: {
    name: 'architecture',
    description: 'Architecture and system design patterns',
    execute: () => ({
      text: 'Chanuka designs decoupled, production-grade systems: Event-driven pipelines with Apache Kafka and WebSockets, modular NestJS and Spring Boot microservices, high-throughput database tuning with composite indexing and Redis caching, and defense-in-depth security with stateless JWT & RBAC guards.',
      section: 'architecture',
    }),
  },
  experience: {
    name: 'experience',
    description: 'Career journey and education',
    execute: () => ({
      text: work.map((w) => `• ${w.title} — ${w.org} (${w.period}): ${w.detail}`).join('\n\n'),
      section: 'experience',
    }),
  },
  writing: {
    name: 'writing',
    description: 'Technical articles on Medium',
    execute: () => ({
      text: `He writes technical architecture deep dives on Medium:\n${articles.map((a) => `• "${a.title}" (${a.readingTime}): ${a.summary}`).join('\n')}`,
      section: 'writing',
    }),
  },
  github: {
    name: 'github',
    description: 'GitHub repositories and verified metrics',
    execute: () => ({
      text: `Public GitHub profile: ${profile.githubUrl}. The GitHub Activity section displays verified repository metrics and contribution frequency.`,
      section: 'github',
    }),
  },
  contact: {
    name: 'contact',
    description: 'Contact info and hiring availability',
    execute: () => ({
      text: `Email: ${profile.email} · Phone: ${profile.phone} · LinkedIn: ${profile.linkedin}. ${profile.available ? 'Currently open to high-impact backend & full-stack opportunities.' : ''}`,
      section: 'contact',
    }),
  },
  clear: {
    name: 'clear',
    description: 'Clear chat history',
    execute: () => ({
      action: 'clear',
      text: 'Chat history cleared.',
      section: null,
    }),
  },
};

export function isCommand(raw) {
  if (typeof raw !== 'string') return false;
  return raw.trim().startsWith('/');
}

export function validateAndSanitizeCommand(raw) {
  if (typeof raw !== 'string') {
    return { valid: false, error: 'invalid_type' };
  }

  const trimmed = raw.trim();
  if (!trimmed.startsWith('/')) {
    return { valid: false, error: 'not_a_command' };
  }

  // Remove leading slashes and whitespace
  const clean = trimmed.replace(/^\/+/, '').trim();
  if (!clean) {
    return { valid: false, error: 'empty_command' };
  }

  const tokens = clean.split(/\s+/);
  const rawCommandName = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  // Validate command name against registry and aliases
  const resolvedName = CHAT_COMMAND_ALIASES[rawCommandName] || rawCommandName;
  const commandDef = CHAT_COMMANDS[resolvedName];

  if (!commandDef || typeof commandDef.execute !== 'function') {
    return { valid: false, error: 'unknown_command', commandName: rawCommandName };
  }

  return {
    valid: true,
    name: resolvedName,
    rawName: rawCommandName,
    command: commandDef,
    args,
  };
}

export async function executeChatCommand(raw) {
  try {
    const check = validateAndSanitizeCommand(raw);
    if (!check.valid) {
      return {
        success: false,
        text: COMMAND_FALLBACK,
        error: check.error,
      };
    }

    const res = await check.command.execute(check.args);
    if (!res || typeof res !== 'object') {
      return {
        success: false,
        text: COMMAND_FALLBACK,
        error: 'malformed_response',
      };
    }

    if (res.action === 'clear') {
      return {
        success: true,
        action: 'clear',
        text: res.text || 'Chat history cleared.',
        section: null,
      };
    }

    if (!res.text || typeof res.text !== 'string') {
      return {
        success: false,
        text: COMMAND_FALLBACK,
        error: 'missing_response_text',
      };
    }

    return {
      success: true,
      text: res.text,
      section: res.section || null,
      source: 'command',
    };
  } catch (err) {
    return {
      success: false,
      text: COMMAND_FALLBACK,
      error: err instanceof Error ? err.message : String(err),
    };
  }
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
