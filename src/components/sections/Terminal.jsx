import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { ChevronRight, Terminal as TerminalIcon } from 'lucide-react';
import { articles, profile, projects, skills, timeline } from '@/data/profile';
import { ask } from '@/lib/assistant';
import { cn, scrollToId, safeStorage } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import SectionHeading from '@/components/ui/SectionHeading';

/* ════════════════════════════════════════════════════════════════════
 * Site bridge — the ONLY place that touches global site state.
 * Syncs directly with class="dark|light", data-theme, and --accent.
 * Writes to localStorage ('pf-theme', 'pf-accent') for cross-page persistence.
 * Every change fires a window CustomEvent so any component can subscribe.
 * ════════════════════════════════════════════════════════════════════ */
const SECTIONS = ['home', 'about', 'experience', 'skills', 'architecture', 'projects', 'github', 'writing', 'contact', 'terminal'];
const ACCENTS = {
  indigo: '99 102 241',
  emerald: '52 211 153',
  violet: '167 139 250',
  rose: '251 113 133',
  amber: '251 191 36',
  cyan: '34 211 238',
  sky: '14 165 233',
};
const HIST_KEY = 'terminal:history';

const html = () => document.documentElement;
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const parseRgb = (s) => (String(s).match(/\d+/g) || []).slice(0, 3).map(Number);
const rgbToHex = (s) => {
  const n = parseRgb(s);
  return n.length === 3 ? `#${n.map((v) => v.toString(16).padStart(2, '0')).join('')}` : '—';
};
const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

const SITE = {
  getTheme() {
    const el = html();
    return el.dataset.theme || (el.classList.contains('light') ? 'light' : 'dark');
  },
  setTheme(mode) {
    const el = html();
    el.classList.toggle('dark', mode === 'dark');
    el.classList.toggle('light', mode === 'light');
    el.dataset.theme = mode;
    el.style.colorScheme = mode;
    safeStorage.set('pf-theme', mode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#07080c' : '#f7f8fb');
    emit('site:theme', mode);
  },
  getAccent: () => getComputedStyle(html()).getPropertyValue('--accent').trim(),
  setAccent(rgb) {
    html().style.setProperty('--accent', rgb);
    safeStorage.set('pf-accent', rgb);
    emit('site:accent', rgb);
  },
};

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  },
};

/* ── Parsing ── */
const tokenize = (s) => {
  const out = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
};

const splitPipes = (s) => {
  const parts = [];
  let cur = '';
  let quote = null;
  for (const ch of s) {
    if (quote) {
      if (ch === quote) quote = null;
      cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === '|') {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
};

/* ── Formatting helpers ── */
const ok = (t) => ({ text: t, kind: 'ok' });
const info = (t) => ({ text: t, kind: 'info' });
const dim = (t) => ({ text: t, kind: 'dim' });

const fmtUptime = (ms) => {
  const s = Math.floor((Date.now() - ms) / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

const ghJson = async (path, signal) => {
  const r = await fetch(`https://api.github.com/${path}`, {
    signal,
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!r.ok) throw new Error(r.status === 403 ? 'GitHub rate limit reached — try again later.' : `GitHub API error (${r.status})`);
  return r.json();
};
const skillCats = () => [...new Set(skills.map((s) => s.cat))];
const work = timeline.filter((t) => t.type === 'work');

/* ── Pipe filters (operate on text) ── */
const countArg = (args, def) => {
  const i = args.indexOf('-n');
  const raw = i >= 0 ? args[i + 1] : args.find((a) => /^\d+$/.test(a));
  const n = parseInt(raw ?? def, 10);
  return Number.isFinite(n) ? n : def;
};
const FILTERS = {
  grep: (text, args) => {
    const pat = args.find((a) => !a.startsWith('-'));
    if (!pat) throw new Error('usage: grep [-v] <text>');
    const inv = args.includes('-v');
    const p = pat.toLowerCase();
    return text.split('\n').filter((l) => l.toLowerCase().includes(p) !== inv).join('\n');
  },
  head: (text, args) => text.split('\n').slice(0, countArg(args, 10)).join('\n'),
  tail: (text, args) => text.split('\n').slice(-countArg(args, 10)).join('\n'),
  wc: (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return `${text.split('\n').length} lines · ${words} words · ${text.length} chars`;
  },
  sort: (text, args) => {
    const l = text.split('\n').sort((a, b) => a.localeCompare(b));
    return (args.includes('-r') ? l.reverse() : l).join('\n');
  },
};

/* ════════════════════════ Command registry ════════════════════════ */
const GROUPS = ['Navigate', 'Site', 'Info', 'Actions', 'Shell'];
const COMMANDS = [
  /* ── Navigate ── */
  {
    name: 'goto', aliases: ['cd'], group: 'Navigate', usage: 'goto <section>',
    desc: 'Smooth-scroll to a section (alias: cd)',
    complete: () => [...SECTIONS, 'blogs'],
    run: ([raw]) => {
      if (raw === undefined) throw new Error(`usage: goto <${SECTIONS.join('|')}>`);
      let clean = raw.replace(/^~?\/?/, '').toLowerCase();
      if (clean === 'blogs') clean = 'writing';
      const id = raw === '..' ? 'home' : clean || 'home';
      if (!SECTIONS.includes(id)) throw new Error(`no such section: ${id}. Try "ls".`);
      if (!document.getElementById(id)) throw new Error(`section "${id}" is not on this page.`);
      scrollToId(id);
      return info(`→ ~/${id}`);
    },
  },
  {
    name: 'ls', group: 'Navigate', usage: 'ls', desc: 'List sections on the page',
    run: (_, { section }) =>
      SECTIONS.filter((id) => document.getElementById(id))
        .map((id) => `${id === section ? '▸' : ' '} ${id}/`)
        .join('\n'),
  },
  { name: 'pwd', group: 'Navigate', usage: 'pwd', desc: 'Show the current section', run: (_, { section }) => `~/${section}` },
  {
    name: 'scroll', group: 'Navigate', usage: 'scroll <top|bottom|0-100%>', desc: 'Scroll the page',
    complete: () => ['top', 'bottom'],
    run: ([arg = '']) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      let y;
      if (arg === 'top') y = 0;
      else if (arg === 'bottom') y = max;
      else if (/^\d{1,3}%$/.test(arg)) y = (max * Math.min(100, parseInt(arg, 10))) / 100;
      else throw new Error('usage: scroll <top|bottom|0-100%>');
      window.scrollTo({ top: y, behavior: 'smooth' });
      return info(`scrolling → ${arg}`);
    },
  },
  {
    name: 'palette', group: 'Navigate', usage: 'palette', desc: 'Open the ⌘K command palette',
    run: () => {
      const mac = /Mac|iPhone|iPad/.test(navigator.platform);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', bubbles: true, metaKey: mac, ctrlKey: !mac }));
      return info('opening command palette…');
    },
  },

  /* ── Site ── */
  {
    name: 'theme', group: 'Site', usage: 'theme [dark|light|toggle]', desc: 'Get or switch the site theme',
    complete: () => ['dark', 'light', 'toggle'],
    run: ([arg], ctx) => {
      const cur = SITE.getTheme();
      if (!arg) return `theme: ${cur}`;
      const next = arg === 'toggle' ? (cur === 'dark' ? 'light' : 'dark') : arg;
      if (!['dark', 'light'].includes(next)) throw new Error('usage: theme [dark|light|toggle]');
      SITE.setTheme(next);
      ctx.refresh();
      return ok(`theme → ${next}`);
    },
  },
  {
    name: 'accent', group: 'Site', usage: 'accent <name|#hex|random>', desc: 'Change the accent colour live',
    complete: () => [...Object.keys(ACCENTS), 'random'],
    run: ([arg], ctx) => {
      if (!arg) {
        return `current: ${rgbToHex(SITE.getAccent())}\n` + Object.entries(ACCENTS).map(([n, v]) => `  ${n.padEnd(8)} ${rgbToHex(v)}`).join('\n');
      }
      const key = arg.toLowerCase();
      const rgb = key === 'random'
        ? Object.values(ACCENTS)[Math.floor(Math.random() * Object.keys(ACCENTS).length)]
        : ACCENTS[key] || hexToRgb(arg);
      if (!rgb) throw new Error('usage: accent <name|#hex|random>');
      SITE.setAccent(rgb);
      ctx.refresh();
      return ok(`accent → ${rgbToHex(rgb)}`);
    },
  },
  {
    name: 'timeline', group: 'Site', usage: 'timeline <all|work|education>', desc: 'Filter the experience timeline',
    complete: () => ['all', 'work', 'education'],
    run: ([arg]) => {
      if (!['all', 'work', 'education'].includes(arg)) throw new Error('usage: timeline <all|work|education>');
      emit('timeline:filter', arg);
      scrollToId('experience');
      return ok(`timeline filter → ${arg}`);
    },
  },
  {
    name: 'settings', group: 'Site', usage: 'settings', desc: 'Open the settings panel',
    run: () => {
      const btn = document.querySelector('[aria-label*="ettings" i]');
      if (btn) btn.click();
      else emit('site:open-settings');
      return info('opening settings…');
    },
  },
  {
    name: 'status', group: 'Site', usage: 'status', desc: 'Show live site state',
    run: (_, { section }) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return [
        `theme      ${SITE.getTheme()}`,
        `accent     ${rgbToHex(SITE.getAccent())}`,
        `section    ~/${section}`,
        `scroll     ${pct}%`,
        `viewport   ${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}x`,
        `motion     ${reduced ? 'reduced' : 'full'}`,
        `locale     ${navigator.language} · ${profile.timezone}`,
      ].join('\n');
    },
  },
  {
    name: 'reset', group: 'Site', usage: 'reset', desc: 'Restore the original theme and accent',
    run: (_, ctx) => {
      if (ctx.initial) {
        SITE.setTheme(ctx.initial.theme);
        if (ctx.initial.accent) SITE.setAccent(ctx.initial.accent);
        else html().style.removeProperty('--accent');
      }
      ctx.refresh();
      return ok('site restored to initial theme & accent');
    },
  },

  /* ── Info ── */
  {
    name: 'whoami', group: 'Info', usage: 'whoami', desc: 'Who is this?',
    run: () => `${profile.name} — ${profile.role}\n${profile.location}\n${profile.tagline}`,
  },
  {
    name: 'skills', group: 'Info', usage: 'skills [category]', desc: 'List skills by category',
    complete: () => skillCats().map((c) => c.toLowerCase()),
    run: ([cat]) => {
      const cats = skillCats().filter((c) => !cat || c.toLowerCase() === cat.toLowerCase());
      if (!cats.length) throw new Error(`unknown category: ${cat}`);
      return cats.map((c) => `${c.padEnd(13)}: ${skills.filter((s) => s.cat === c).map((s) => s.name).join(', ')}`).join('\n');
    },
  },
  {
    name: 'experience', aliases: ['exp'], group: 'Info', usage: 'experience', desc: 'Work history',
    run: () => work.map((w) => `${w.period.padEnd(20)} ${w.title} @ ${w.org}`).join('\n'),
  },
  {
    name: 'projects', group: 'Info', usage: 'projects [number]', desc: 'List projects, or inspect one',
    complete: () => projects.map((_, i) => String(i + 1)),
    run: ([n]) => {
      if (!n) {
        return projects
          .map((p, i) => `${String(i + 1).padStart(2)}. ${p.title.padEnd(30)} [${p.category}] — ${p.tags.slice(0, 3).join(', ')}`)
          .join('\n');
      }
      const idx = parseInt(n, 10) - 1;
      const p = projects[idx];
      if (!p) throw new Error(`no project #${n} (1-${projects.length})`);
      return [
        `${p.title} (${p.year}) · ${p.category}`,
        '─'.repeat(40),
        p.description,
        `Stack: ${p.tags.join(', ')}`,
        p.metrics ? `Metrics: ${p.metrics}` : null,
        p.challenge ? `Challenge: ${p.challenge}` : null,
        p.solution ? `Solution: ${p.solution}` : null,
        p.github ? `Repo: ${p.github}` : null,
        p.demo ? `Demo: ${p.demo}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    },
  },
  {
    name: 'articles', aliases: ['blogs'], group: 'Info', usage: 'articles', desc: 'Published articles & blog posts',
    run: () => articles.map((a, i) => `${String(i + 1).padStart(2)}. ${a.title.padEnd(46)} (${a.date || 'Medium'})`).join('\n'),
  },
  {
    name: 'find', group: 'Info', usage: 'find <term>', desc: 'Search projects, skills, articles and experience',
    run: (args) => {
      const q = args.join(' ').toLowerCase();
      if (!q) throw new Error('usage: find <term>');
      const has = (o) => JSON.stringify(o).toLowerCase().includes(q);
      const rows = [
        ...projects.map((p, i) => has(p) && `project    ${i + 1}. ${p.title}`),
        ...skills.map((s) => has(s) && `skill      ${s.name} (${s.cat})`),
        ...articles.map((a) => has(a) && `article    ${a.title}`),
        ...timeline.map((t) => has(t) && `${t.type.padEnd(10)} ${t.title} @ ${t.org}`),
      ].filter(Boolean);
      return rows.length ? rows.join('\n') : dim(`no matches for "${q}"`);
    },
  },
  {
    name: 'neofetch', group: 'Info', usage: 'neofetch', desc: 'System summary',
    run: (_, ctx) => {
      const logo = [
        '┌──────────────┐',
        '│   { C W }    │',
        '│   Backend    │',
        '│  Architect   │',
        '└──────────────┘',
      ];
      const rows = [
        `${profile.github}@portfolio`,
        '─'.repeat(26),
        'OS       Backend Architecture OS',
        `Host     ${profile.location}`,
        `Role     ${profile.role}`,
        'Stack    Spring Boot · NestJS · Laravel · Kafka',
        'Shell    portfolio-shell v2.1',
        `Theme    ${SITE.getTheme()} · ${rgbToHex(SITE.getAccent())}`,
        `Uptime   ${fmtUptime(ctx.startedAt)}`,
        `Status   ${profile.available ? 'available for hire ✔' : 'booked'}`,
      ];
      return rows.map((l, i) => (logo[i] ?? '').padEnd(18) + l).join('\n');
    },
  },
  {
    name: 'github', group: 'Info', usage: 'github', desc: 'Live stats from the GitHub API',
    run: async (_, { signal }) => {
      const u = profile.github;
      const [user, repos] = await Promise.all([ghJson(`users/${u}`, signal), ghJson(`users/${u}/repos?sort=updated&per_page=5`, signal)]);
      const head = `@${user.login} — ${user.public_repos} repos · ${user.followers} followers · ${user.following} following`;
      const rows = repos.map((r) => `★ ${String(r.stargazers_count).padEnd(3)} ${r.name.padEnd(26)} ${(r.language || '—').padEnd(12)} ${r.description ? r.description.slice(0, 48) : ''}`);
      return ok(`${head}\n\nrecently updated\n${rows.join('\n')}`);
    },
  },

  /* ── Actions ── */
  {
    name: 'chat', group: 'Actions', usage: 'chat [open|close|toggle|ask <question>]',
    desc: 'Control AI assistant or ask a question directly',
    complete: () => ['open', 'close', 'toggle', 'ask'],
    run: async ([action = 'toggle', ...rest]) => {
      const act = action.toLowerCase();
      if (act === 'open') {
        emit('site:chat', true);
        return ok('opened AI assistant modal');
      }
      if (act === 'close') {
        emit('site:chat', false);
        return ok('closed AI assistant modal');
      }
      if (act === 'toggle') {
        emit('site:chat');
        return ok('toggled AI assistant modal');
      }
      if (act === 'ask') {
        const query = rest.join(' ').replace(/^["']|["']$/g, '').trim();
        if (!query) throw new Error('usage: chat ask <question>');
        const res = await ask(query);
        if (res.section && res.section !== 'contact') {
          scrollToId(res.section);
        }
        return ok(`[AI Assistant] ${res.text}${res.section ? `\n(Navigated to ~/${res.section})` : ''}`);
      }
      throw new Error('usage: chat [open|close|toggle|ask <question>]');
    },
  },
  {
    name: 'open', group: 'Actions', usage: 'open <github|linkedin|cv|mail>', desc: 'Open a link',
    complete: () => ['github', 'linkedin', 'cv', 'mail'],
    run: ([w]) => {
      const key = (w || '').toLowerCase();
      const urls = { github: profile.githubUrl, linkedin: profile.linkedin, cv: profile.cv, mail: profile.email && `mailto:${profile.email}` };
      if (!urls[key]) throw new Error('usage: open <github|linkedin|cv|mail>');
      if (key === 'mail') window.location.href = urls[key];
      else window.open(urls[key], '_blank', 'noopener,noreferrer');
      return info(`opening ${key}…`);
    },
  },
  {
    name: 'copy', group: 'Actions', usage: 'copy <email|phone>', desc: 'Copy a contact detail',
    complete: () => ['email', 'phone'],
    run: async ([w]) => {
      const val = { email: profile.email, phone: profile.phone }[(w || '').toLowerCase()];
      if (!val) throw new Error('usage: copy <email|phone>');
      await navigator.clipboard.writeText(val);
      return ok(`copied ${w} to clipboard`);
    },
  },
  {
    name: 'hire', group: 'Actions', usage: 'hire', desc: 'Jump to contact and copy my email',
    run: async () => {
      scrollToId('contact');
      try {
        await navigator.clipboard.writeText(profile.email);
      } catch {
        /* clipboard blocked */
      }
      return ok(profile.available ? `Great call. Email copied → ${profile.email}` : `Currently booked, but say hi → ${profile.email}`);
    },
  },

  /* ── Shell ── */
  {
    name: 'samples', aliases: ['examples'], group: 'Shell', usage: 'samples [category]',
    desc: 'Interactive command samples & cheat-sheet',
    complete: () => ['quick', 'site', 'nav', 'info', 'pipes', 'actions'],
    run: ([cat]) => {
      const allSamples = [
        {
          group: '⚡ QUICK SHORTCUTS',
          items: [
            ['help', 'List all commands & syntax'],
            ['samples', 'Show this command sample cheat-sheet'],
            ['neofetch', 'System info, specs & ASCII banner'],
            ['hire', 'Scroll to contact & copy email to clipboard'],
          ],
        },
        {
          group: '🎨 LIVE SITE CONTROL',
          items: [
            ['theme toggle', 'Switch dark/light mode live'],
            ['theme dark', 'Force cinematic dark theme'],
            ['theme light', 'Force clean light theme'],
            ['accent emerald', 'Change primary color accent to emerald'],
            ['accent violet', 'Change accent to violet (or: indigo, rose, amber, cyan)'],
            ['accent #38bdf8', 'Set custom hex accent color'],
            ['timeline work', 'Filter journey timeline to work experience'],
            ['timeline education', 'Filter journey timeline to education'],
            ['timeline all', 'Reset journey timeline filter'],
            ['status', 'View live theme, accent, scroll %, and current section'],
            ['reset', 'Restore initial theme and accent'],
          ],
        },
        {
          group: '🚀 PAGE NAVIGATION',
          items: [
            ['goto projects', 'Smooth-scroll directly to projects (alias: cd)'],
            ['goto skills', 'Jump to interactive skills matrix'],
            ['goto blogs', 'Jump to engineering articles'],
            ['goto contact', 'Jump to contact section'],
            ['scroll top', 'Smooth scroll to top of page'],
            ['scroll bottom', 'Smooth scroll to page footer'],
            ['scroll 50%', 'Scroll to 50% scroll position'],
            ['palette', 'Trigger ⌘K quick command palette'],
            ['ls', 'List all available page sections'],
            ['pwd', 'Print current active section'],
          ],
        },
        {
          group: '💻 DEEP INFO & SEARCH',
          items: [
            ['whoami', 'Bio, title, location and summary'],
            ['skills Backend', 'List all backend technologies'],
            ['projects 1', 'Detailed view of flagship project'],
            ['find kafka', 'Search entire portfolio for keyword "kafka"'],
            ['github', 'Live GitHub followers, public repos and recent commits'],
            ['articles', 'List published technical articles'],
          ],
        },
        {
          group: '🔧 PIPES & FILTERS',
          items: [
            ['skills | grep Java', 'Filter skill matrix matching "Java"'],
            ['projects | head -n 3', 'Output only the top 3 projects'],
            ['skills | wc', 'Count lines, words, and characters'],
            ['experience | grep Software', 'Filter work experience with grep'],
            ['articles | sort', 'Sort articles alphabetically'],
          ],
        },
        {
          group: '🤖 AI ASSISTANT & ACTIONS',
          items: [
            ['chat open', 'Open interactive AI assistant modal'],
            ['chat ask "what are his key backend skills?"', 'Ask AI questions directly in terminal'],
            ['chat ask "tell me about his projects"', 'Query portfolio intelligence engine'],
            ['open cv', 'Download or view resume/CV'],
            ['open github', 'Open GitHub profile in new tab'],
            ['copy email', 'Copy email address to clipboard'],
          ],
        },
      ];

      const c = (cat || '').toLowerCase();
      const filtered = c
        ? allSamples.filter((g) => g.group.toLowerCase().includes(c))
        : allSamples;

      if (!filtered.length) {
        throw new Error(`unknown samples category "${cat}". Try: quick, site, nav, info, pipes, actions`);
      }

      const out = filtered
        .map((g) => `${g.group}\n` + g.items.map(([cmd, desc]) => `  ${cmd.padEnd(28)} ${desc}`).join('\n'))
        .join('\n\n');

      return ok(`${out}\n\n💡 Tip: Click any sample chip above the prompt to execute it instantly!`);
    },
  },
  {
    name: 'help', aliases: ['?'], group: 'Shell', usage: 'help [command]', desc: 'List commands',
    complete: () => ALL_NAMES,
    run: ([name]) => {
      if (name) {
        const c = LOOKUP.get(name.toLowerCase());
        if (!c) throw new Error(`no help for "${name}"`);
        return `${c.usage}\n${c.desc}${c.aliases ? `\naliases: ${c.aliases.join(', ')}` : ''}`;
      }
      const body = GROUPS.map((g) => `${g.padEnd(9)} ${COMMANDS.filter((c) => c.group === g).map((c) => c.name).join('  ')}`).join('\n');
      return `${body}\n\nsamples   type "samples" to view categorized examples\npipes     cmd | grep <text> | head -n 3   (grep head tail wc sort)\nkeys      Tab complete · ↑↓ history · Ctrl+L clear · Ctrl+C cancel\ntip       help <command> for usage`;
    },
  },
  { name: 'echo', group: 'Shell', usage: 'echo <text>', desc: 'Print text', run: (args) => args.join(' ') },
  {
    name: 'date', group: 'Shell', usage: 'date', desc: 'Current date and time',
    run: () => new Date().toLocaleString('en-GB', { timeZone: profile.timezone, dateStyle: 'full', timeStyle: 'medium' }),
  },
  { name: 'uptime', group: 'Shell', usage: 'uptime', desc: 'Session uptime', run: (_, ctx) => `up ${fmtUptime(ctx.startedAt)}` },
  {
    name: 'history', group: 'Shell', usage: 'history', desc: 'Recent commands',
    run: (_, { history }) => (history.length ? [...history].reverse().slice(-20).map((h, i) => `${String(i + 1).padStart(3)}  ${h}`).join('\n') : dim('history is empty')),
  },
  { name: 'clear', aliases: ['cls'], group: 'Shell', usage: 'clear', desc: 'Clear the screen', run: (_, ctx) => { ctx.clear(); } },
  { name: 'exit', group: 'Shell', usage: 'exit', desc: 'Minimise the terminal', run: (_, ctx) => { ctx.minimize(); } },
  { name: 'sudo', group: 'Shell', usage: 'sudo', desc: 'Nice try', run: () => ({ text: 'sudo: permission denied. Nice try — hire me the normal way (type: hire).', kind: 'err' }) },
];

const LOOKUP = new Map();
COMMANDS.forEach((c) => [c.name, ...(c.aliases || [])].forEach((n) => LOOKUP.set(n, c)));
const ALL_NAMES = [...LOOKUP.keys()].filter((n) => n !== '?').sort();

/* ── Interactive Command Sample Categories for Toolbar ── */
const SAMPLE_CATEGORIES = [
  {
    id: 'quick',
    label: '⚡ Quick',
    samples: [
      { cmd: 'help', desc: 'List commands' },
      { cmd: 'samples', desc: 'Show sample guide' },
      { cmd: 'neofetch', desc: 'System specs & logo' },
      { cmd: 'theme toggle', desc: 'Switch dark / light' },
      { cmd: 'accent random', desc: 'Random accent color' },
      { cmd: 'goto projects', desc: 'Jump to projects' },
      { cmd: 'chat open', desc: 'Open AI chatbot' },
    ],
  },
  {
    id: 'site',
    label: '🎨 Site Control',
    samples: [
      { cmd: 'theme toggle', desc: 'Toggle dark & light mode' },
      { cmd: 'theme dark', desc: 'Cinematic dark theme' },
      { cmd: 'theme light', desc: 'Clean light theme' },
      { cmd: 'accent emerald', desc: 'Emerald green accent' },
      { cmd: 'accent violet', desc: 'Violet accent' },
      { cmd: 'accent #06b6d4', desc: 'Custom cyan hex accent' },
      { cmd: 'timeline work', desc: 'Filter timeline: work' },
      { cmd: 'timeline education', desc: 'Filter timeline: education' },
      { cmd: 'timeline all', desc: 'Reset timeline filter' },
      { cmd: 'status', desc: 'Live status: theme & scroll' },
      { cmd: 'reset', desc: 'Reset theme & accent' },
    ],
  },
  {
    id: 'nav',
    label: '🚀 Navigation',
    samples: [
      { cmd: 'goto projects', desc: 'Jump to Projects' },
      { cmd: 'goto skills', desc: 'Jump to Skills' },
      { cmd: 'goto experience', desc: 'Jump to Journey' },
      { cmd: 'goto blogs', desc: 'Jump to Blogs' },
      { cmd: 'goto contact', desc: 'Jump to Contact' },
      { cmd: 'scroll top', desc: 'Scroll to top' },
      { cmd: 'scroll bottom', desc: 'Scroll to bottom' },
      { cmd: 'scroll 50%', desc: 'Scroll to 50%' },
      { cmd: 'palette', desc: 'Open ⌘K palette' },
      { cmd: 'ls', desc: 'List all sections' },
    ],
  },
  {
    id: 'info',
    label: '💻 Deep Info',
    samples: [
      { cmd: 'whoami', desc: 'Bio & summary' },
      { cmd: 'skills Backend', desc: 'Filter backend skills' },
      { cmd: 'skills Cloud', desc: 'Filter cloud skills' },
      { cmd: 'projects 1', desc: 'Inspect project #1' },
      { cmd: 'find kafka', desc: 'Search for "kafka"' },
      { cmd: 'find microservices', desc: 'Search microservices' },
      { cmd: 'github', desc: 'Live GitHub stats' },
      { cmd: 'articles', desc: 'Engineering articles' },
    ],
  },
  {
    id: 'pipes',
    label: '🔧 Pipes & Filters',
    samples: [
      { cmd: 'skills | grep Java', desc: 'Grep skills with Java' },
      { cmd: 'projects | head -n 3', desc: 'First 3 projects' },
      { cmd: 'skills | wc', desc: 'Word & line count' },
      { cmd: 'experience | grep Software', desc: 'Filter experience' },
      { cmd: 'articles | sort', desc: 'Sort articles' },
    ],
  },
  {
    id: 'actions',
    label: '🤖 AI & Actions',
    samples: [
      { cmd: 'chat open', desc: 'Open AI chatbot' },
      { cmd: 'chat ask "what are his key backend skills?"', desc: 'Ask AI assistant' },
      { cmd: 'chat ask "tell me about his projects"', desc: 'Ask AI about projects' },
      { cmd: 'hire', desc: 'Copy email & jump to contact' },
      { cmd: 'copy email', desc: 'Copy email' },
      { cmd: 'open cv', desc: 'Open resume' },
      { cmd: 'open github', desc: 'Open GitHub profile' },
    ],
  },
];

/* ── Autocomplete ── */
function getCompletions(input) {
  if (!input.trim()) return { prefix: '', list: [] };
  const piped = input.includes('|');
  const seg = (piped ? input.slice(input.lastIndexOf('|') + 1) : input).replace(/^\s+/, '');
  const trailing = /\s$/.test(seg);
  const toks = seg.split(/\s+/).filter(Boolean);
  const atName = toks.length === 0 || (toks.length === 1 && !trailing);

  let pool;
  let prefix;
  if (atName) {
    pool = piped ? Object.keys(FILTERS) : ALL_NAMES;
    prefix = toks[0] ?? '';
  } else {
    const name = toks[0]?.toLowerCase();
    const cmd = LOOKUP.get(name);
    pool = (cmd?.complete ? cmd.complete() : []) || [];
    prefix = trailing ? '' : toks[toks.length - 1] ?? '';
  }

  const list = pool.filter((c) => c.toLowerCase().startsWith(prefix.toLowerCase()) && c.toLowerCase() !== prefix.toLowerCase());
  return { prefix, list };
}

/* ── Visual bits ── */
const getKindClass = (kind, isDark) => {
  const darkKinds = {
    in: 'text-slate-100',
    out: 'text-slate-300',
    ok: 'text-emerald-400',
    info: 'text-sky-300',
    dim: 'text-slate-500',
    err: 'text-rose-400',
  };
  const lightKinds = {
    in: 'text-slate-900 font-semibold',
    out: 'text-slate-700',
    ok: 'text-emerald-600 font-medium',
    info: 'text-sky-600 font-medium',
    dim: 'text-slate-500',
    err: 'text-rose-600 font-medium',
  };
  return (isDark ? darkKinds : lightKinds)[kind] || (isDark ? darkKinds.out : lightKinds.out);
};

const URL_RE = /(https?:\/\/[^\s)]+)/g;
function Linkified({ text }) {
  const parts = String(text).split(URL_RE);
  return parts.map((p, i) =>
    URL_RE.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:opacity-80">
        {p}
      </a>
    ) : (
      p
    ),
  );
}

function Prompt({ cwd = 'home', isDark = true }) {
  return (
    <span className="mr-2 inline-flex select-none items-center gap-1 font-mono text-xs">
      <span className="text-accent font-semibold">~/portfolio</span>
      <span className={isDark ? "text-sky-400" : "text-sky-600 font-medium"}>({cwd})</span>
      <span className="text-accent font-bold">❯</span>
    </span>
  );
}

function Line({ line, reduce, isDark = true }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="leading-relaxed"
    >
      {line.k === 'in' ? (
        <div className="flex flex-wrap items-baseline">
          <Prompt cwd={line.cwd} isDark={isDark} />
          <span className={cn("break-all", isDark ? "text-slate-100" : "text-slate-900 font-semibold")}>{line.t}</span>
        </div>
      ) : (
        <pre className={cn('whitespace-pre-wrap break-words font-mono', getKindClass(line.k, isDark))}>
          <Linkified text={line.t} />
        </pre>
      )}
    </motion.div>
  );
}

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
function Spinner({ isDark = true }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % FRAMES.length), 80);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={cn("flex items-center gap-2", isDark ? "text-slate-400" : "text-slate-600")}>
      <span className="text-accent font-bold">{FRAMES[i]}</span> running… <span className={isDark ? "text-slate-600" : "text-slate-400"}>Ctrl+C to cancel</span>
    </div>
  );
}

function useCurrentSection() {
  const [cur, setCur] = useState('home');
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCur(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return cur;
}

/* ═══════════════════════════ Component ═══════════════════════════ */
export default function Terminal() {
  const reduce = useReducedMotion();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const wrapRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(0);
  const abortRef = useRef(null);
  const initialRef = useRef(null);
  const startRef = useRef(Date.now());
  const inView = useInView(wrapRef, { once: true, amount: 0.3 });
  const section = useCurrentSection();

  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [hist, setHist] = useState(() => store.get(HIST_KEY, []));
  const [hi, setHi] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [size, setSize] = useState('normal');
  const [sel, setSel] = useState(0);
  const [site, setSite] = useState({ theme: 'dark', accent: '' });
  const [activeCategory, setActiveCategory] = useState('quick');

  const currentSamples = useMemo(() => {
    return SAMPLE_CATEGORIES.find((c) => c.id === activeCategory)?.samples || [];
  }, [activeCategory]);

  const refresh = useCallback(() => setSite({ theme: SITE.getTheme(), accent: SITE.getAccent() }), []);
  const push = useCallback((k, t, extra) => {
    const id = ++idRef.current;
    setLines((l) => [...l.slice(-299), { id, k, t, ...extra }]);
  }, []);

  /* Capture the starting theme and keep the header chips in sync with
     changes made elsewhere (e.g. the navbar toggle). */
  useEffect(() => {
    initialRef.current = { theme: SITE.getTheme(), accent: SITE.getAccent() };
    refresh();
    const mo = new MutationObserver(refresh);
    mo.observe(html(), { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
    return () => mo.disconnect();
  }, [refresh]);

  /* Boot sequence once the terminal scrolls into view */
  useEffect(() => {
    if (!inView) return undefined;
    const boot = [
      ['dim', 'portfolio-shell v2.1 · type "help" or "samples" to explore'],
      ['ok', `✔ loaded ${projects.length} projects · ${skills.length} skills · ${articles.length} articles`],
      ['info', 'Tab autocomplete · pipes (grep, head, wc) · live site control · try sample chips above!'],
    ];
    const timers = boot.map(([k, t], i) => setTimeout(() => push(k, t), reduce ? 0 : i * 220));
    return () => timers.forEach(clearTimeout);
  }, [inView, push, reduce]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
  }, [lines, busy, reduce]);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => setSel(0), [input]);

  const comp = useMemo(() => getCompletions(input), [input]);
  const current = comp.list[Math.min(sel, comp.list.length - 1)];
  const ghost = current ? current.slice(comp.prefix.length) : '';

  const applyCompletion = (candidate) => setInput(`${input.slice(0, input.length - comp.prefix.length)}${candidate} `);

  /* ── Execute a full command line ── */
  const submit = async (raw) => {
    const line = raw.trim();
    if (!line || busy) return;

    push('in', line, { cwd: section });
    const next = [line, ...hist.filter((h) => h !== line)].slice(0, 50);
    setHist(next);
    store.set(HIST_KEY, next);
    setHi(-1);
    setInput('');

    const ac = new AbortController();
    abortRef.current = ac;
    setBusy(true);
    const ctx = {
      section,
      history: next,
      startedAt: startRef.current,
      signal: ac.signal,
      initial: initialRef.current,
      refresh,
      clear: () => setLines([]),
      minimize: () => setSize('min'),
    };

    try {
      const [first, ...pipes] = splitPipes(line);
      const [name, ...args] = tokenize(first);
      const cmd = LOOKUP.get((name || '').toLowerCase());
      if (!cmd) throw new Error(`command not found: ${name}. Try "help" or "samples".`);

      const res = await cmd.run(args, ctx);
      if (res === undefined || ac.signal.aborted) return;
      let { text, kind } = typeof res === 'string' ? { text: res, kind: 'out' } : res;

      for (const p of pipes) {
        const [fn, ...fa] = tokenize(p);
        const filter = FILTERS[(fn || '').toLowerCase()];
        if (!filter) throw new Error(`pipe: unknown filter "${fn}" (${Object.keys(FILTERS).join(', ')})`);
        text = filter(text, fa);
      }
      if (text !== '') push(kind, text);
    } catch (e) {
      if (!ac.signal.aborted) push('err', e.message || String(e));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  /* ── Key navigation ── */
  const onKeyDown = (e) => {
    const menuOpen = comp.list.length > 1;

    // Ctrl+C: cancel running command or clear current input
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      if (busy) {
        abortRef.current?.abort();
        push('dim', '^C');
        setBusy(false);
      } else {
        setInput('');
      }
      return;
    }

    // Ctrl+L: clear terminal
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setLines([]);
      return;
    }

    // Tab: accept ghost completion or cycle suggestion
    if (e.key === 'Tab') {
      e.preventDefault();
      if (current) applyCompletion(current);
      return;
    }

    // Enter: accept active dropdown item, or submit
    if (e.key === 'Enter') {
      e.preventDefault();
      if (menuOpen && comp.list[sel]) {
        applyCompletion(comp.list[sel]);
      } else {
        submit(input);
      }
      return;
    }

    // Escape: close dropdown
    if (e.key === 'Escape') {
      if (menuOpen) {
        e.preventDefault();
        setInput(input.trimEnd());
      }
      return;
    }

    // Up / Down: dropdown selection, or command history
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const dir = e.key === 'ArrowUp' ? -1 : 1;
      if (menuOpen) {
        setSel((s) => (s + dir + comp.list.length) % comp.list.length);
      } else if (dir === -1) {
        const n = Math.min(hi + 1, hist.length - 1);
        if (hist[n] !== undefined) { setHi(n); setInput(hist[n]); }
      } else {
        const n = hi - 1;
        setHi(n);
        setInput(n < 0 ? '' : hist[n]);
      }
    }
  };

  const accentRgb = parseRgb(site.accent).join(' ');
  const height = size === 'min' ? 0 : size === 'max' ? 620 : 420;

  return (
    <section id="terminal" className="section !pt-0">
      <SectionHeading eyebrow="09 — Terminal" title="Prefer the command line?">
        A real shell for this site. Change the theme, jump between sections, query my GitHub, or pipe output — type <code className="font-mono text-accent">help</code> or <code className="font-mono text-accent">samples</code>.
      </SectionHeading>

      <div ref={wrapRef} className={cn(
        'rounded-2xl p-px shadow-2xl transition-shadow duration-500 focus-within:shadow-[0_0_70px_-24px_rgb(var(--accent)/0.65)]',
        isDark
          ? 'bg-gradient-to-br from-accent/40 via-white/10 to-transparent'
          : 'bg-gradient-to-br from-accent/30 via-line/15 to-transparent',
      )}>
        <div className={cn(
          "overflow-hidden rounded-[15px] font-mono text-sm backdrop-blur-xl transition-colors duration-300",
          isDark
            ? "bg-[#07080c]/95 text-slate-200"
            : "bg-white/95 text-slate-800 shadow-xl border border-line/10"
        )}>
          {/* ── Title bar ── */}
          <div className={cn(
            "flex items-center gap-3 border-b px-4 py-2.5 transition-colors duration-300",
            isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-100/70"
          )}>
            <div className="flex items-center gap-2">
              {[
                ['Clear terminal', 'bg-red-400/80 hover:bg-red-400', () => setLines([])],
                [size === 'min' ? 'Restore terminal' : 'Minimise terminal', 'bg-amber-400/80 hover:bg-amber-400', () => setSize((s) => (s === 'min' ? 'normal' : 'min'))],
                [size === 'max' ? 'Restore size' : 'Maximise terminal', 'bg-emerald-400/80 hover:bg-emerald-400', () => setSize((s) => (s === 'max' ? 'normal' : 'max'))],
              ].map(([label, cls, fn]) => (
                <button key={label} type="button" aria-label={label} onClick={fn} className={cn('relative h-3 w-3 rounded-full transition before:absolute before:-inset-1.5 before:content-[""]', cls)} />
              ))}
            </div>
            <span className={cn(
              "flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate text-xs",
              isDark ? "text-slate-400" : "text-slate-600 font-medium"
            )}>
              <TerminalIcon size={12} /> {profile.github}@portfolio — zsh
            </span>
            <div className={cn(
              "hidden items-center gap-1.5 text-[11px] sm:flex",
              isDark ? "text-slate-400" : "text-slate-600"
            )}>
              <span className={cn(
                "rounded-full border px-2 py-0.5",
                isDark ? "border-white/10" : "border-slate-300 bg-slate-200/50"
              )}>{site.theme}</span>
              <span className={cn(
                "flex items-center gap-1.5 rounded-full border px-2 py-0.5",
                isDark ? "border-white/10" : "border-slate-300 bg-slate-200/50"
              )}>
                <span className="h-2 w-2 rounded-full" style={{ background: accentRgb ? `rgb(${accentRgb})` : undefined }} />
                {rgbToHex(site.accent)}
              </span>
              <span className={cn(
                "rounded-full border px-2 py-0.5",
                isDark ? "border-white/10 text-sky-400" : "border-slate-300 bg-slate-200/50 text-sky-600"
              )}>~/{section}</span>
            </div>
          </div>

          {/* ── Collapsible body ── */}
          <motion.div
            initial={false}
            animate={{ height }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex h-full flex-col">
              {/* ── Command Samples Toolbar ── */}
              <div className={cn(
                "border-b transition-colors duration-300",
                isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/70"
              )}>
                {/* Category tabs */}
                <div className={cn(
                  "flex items-center gap-1 overflow-x-auto border-b px-3 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  isDark ? "border-white/5" : "border-slate-200/60"
                )}>
                  <span className={cn(
                    "mr-1 text-[10px] font-semibold uppercase tracking-wider shrink-0",
                    isDark ? "text-slate-500" : "text-slate-500"
                  )}>Samples:</span>
                  {SAMPLE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium transition',
                        activeCategory === cat.id
                          ? 'bg-accent/20 text-accent font-semibold shadow-xs'
                          : isDark
                            ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900',
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Runnable sample chips for current category */}
                <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {currentSamples.map((item) => (
                    <button
                      key={item.cmd}
                      type="button"
                      title={item.desc}
                      disabled={busy}
                      onClick={() => {
                        submit(item.cmd);
                        inputRef.current?.focus({ preventScroll: true });
                      }}
                      className={cn(
                        "group flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition disabled:opacity-40",
                        isDark
                          ? "border-white/10 bg-white/[0.03] text-slate-300 hover:border-accent/60 hover:bg-accent/15 hover:text-accent"
                          : "border-slate-200 bg-white text-slate-700 hover:border-accent/60 hover:bg-accent/10 hover:text-accent shadow-xs"
                      )}
                    >
                      <span className="font-mono font-medium">{item.cmd}</span>
                      <span className={cn(
                        "hidden text-[10px] sm:inline transition-colors",
                        isDark ? "text-slate-500 group-hover:text-accent/80" : "text-slate-400 group-hover:text-accent"
                      )}>
                        · {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Output + prompt */}
              <div
                ref={bodyRef}
                className="scroll-thin min-h-0 flex-1 overflow-y-auto p-4"
                onClick={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true }); }}
              >
                <div role="log" aria-live="polite" className="space-y-1">
                  {lines.map((l) => <Line key={l.id} line={l} reduce={reduce} isDark={isDark} />)}
                </div>
                {busy && <div className="mt-1"><Spinner isDark={isDark} /></div>}

                <div className={cn('mt-1 flex items-center', busy && 'opacity-40')}>
                  <Prompt cwd={section} isDark={isDark} />
                  <div className="relative min-w-0 flex-1">
                    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center whitespace-pre text-base sm:text-sm">
                      <span className="invisible">{input}</span>
                      <span className={isDark ? "text-slate-600" : "text-slate-400"}>{ghost}</span>
                    </div>
                    <label htmlFor="term-input" className="sr-only">Terminal command</label>
                    <input
                      id="term-input"
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="send"
                      placeholder={lines.length ? '' : 'help'}
                      className={cn(
                        "relative w-full bg-transparent text-base caret-accent outline-none sm:text-sm",
                        isDark ? "text-slate-100 placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"
                      )}
                    />
                  </div>
                  <ChevronRight size={14} className={cn("hidden shrink-0 sm:block", isDark ? "text-slate-700" : "text-slate-400")} />
                </div>
              </div>

              {/* Suggestions */}
              <AnimatePresence initial={false}>
                {comp.list.length > 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn("overflow-hidden border-t", isDark ? "border-white/5" : "border-slate-200 bg-slate-50/50")}
                  >
                    <div className="flex flex-wrap gap-1.5 px-4 py-2">
                      {comp.list.slice(0, 10).map((c, i) => (
                        <button
                          key={c}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => { applyCompletion(c); inputRef.current?.focus({ preventScroll: true }); }}
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[11px] transition',
                            i === Math.min(sel, comp.list.length - 1)
                              ? 'bg-accent/20 text-accent font-semibold'
                              : isDark
                                ? 'bg-white/5 text-slate-400 hover:text-slate-200'
                                : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300/70 hover:text-slate-900',
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className={cn(
                "flex items-center justify-between gap-4 border-t px-4 py-1.5 text-[11px]",
                isDark ? "border-white/5 bg-white/[0.02] text-slate-500" : "border-slate-200 bg-slate-100/60 text-slate-500"
              )}>
                <span className="hidden truncate sm:inline">Tab complete · ↑↓ history · Ctrl+L clear · Ctrl+C cancel · | grep head tail wc sort</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className={cn('h-1.5 w-1.5 rounded-full', busy ? 'animate-pulse bg-amber-400' : 'bg-emerald-400')} />
                  {busy ? 'running' : 'ready'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}