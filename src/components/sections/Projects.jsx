import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import {
  ArrowUpRight,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Search,
  Star,
  X,
} from 'lucide-react';
import { projects } from '@/data/profile';
import { SUMMARY_MODES, summarizeProject } from '@/lib/summaries';
import { cn } from '@/lib/utils';
import SectionHeading from '@/components/ui/SectionHeading';

/* ═══════════════════════════ Constants & helpers ═══════════════════════════ */
const EASE = [0.22, 1, 0.36, 1];
const categories = ['All', ...new Set(projects.map((p) => p.category))];

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const hue = (s) => [...String(s)].reduce((n, c) => n + c.charCodeAt(0), 0) % 360;
const liveOf = (p) => p.live ?? p.demo ?? p.liveUrl ?? p.url ?? p.link ?? null;
const mesh = (h) =>
  `radial-gradient(60% 70% at 100% 0%, hsl(${h} 80% 55% / .32), transparent 60%), radial-gradient(55% 60% at 0% 100%, hsl(${(h + 70) % 360} 80% 50% / .18), transparent 60%)`;

/* Brand colours (space-separated RGB) — unknown tags fall back to the site accent. */
const BRAND = {
  springboot: '109 179 63',
  nestjs: '224 35 78',
  laravel: '255 45 32',
  react: '97 218 251',
  reactnative: '97 218 251',
  nodejs: '104 160 99',
  typescript: '49 120 198',
  javascript: '240 219 79',
  php: '119 123 179',
  java: '237 139 0',
  mysql: '0 150 190',
  postgresql: '80 140 200',
  mongodb: '71 162 72',
  redis: '220 56 44',
  docker: '36 150 237',
  jwt: '251 1 91',
  tailwindcss: '56 189 248',
};
const brandOf = (tag) => BRAND[norm(tag)] ?? 'var(--accent)';

const FEATURED_STACK = ['Spring Boot', 'NestJS', 'Laravel', 'React'];
const FEATURED_KEYS = new Set(FEATURED_STACK.map(norm));

/* tag index: key → { key, label, count } */
const TAGS = (() => {
  const m = new Map();
  projects.forEach((p) =>
    (p.tags || []).forEach((t) => {
      const key = norm(t);
      const e = m.get(key) ?? { key, label: t, count: 0 };
      e.count += 1;
      m.set(key, e);
    }),
  );
  return m;
})();
const FEATURED_ITEMS = FEATURED_STACK.map((l) => TAGS.get(norm(l)) ?? { key: norm(l), label: l, count: 0 });
const OTHER_ITEMS = [...TAGS.values()]
  .filter((t) => !FEATURED_KEYS.has(t.key))
  .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
const MAX_COUNT = Math.max(1, ...FEATURED_ITEMS.map((t) => t.count));

/* Bento recipe: one hero (2 rows) + two stacked, then three across. Repeats. */
const SPANS = [
  { size: 'lg', cls: 'sm:col-span-2 lg:col-span-7 lg:row-span-2' },
  { size: 'md', cls: 'lg:col-span-5' },
  { size: 'md', cls: 'lg:col-span-5' },
  { size: 'sm', cls: 'lg:col-span-4' },
  { size: 'sm', cls: 'lg:col-span-4' },
  { size: 'sm', cls: 'sm:col-span-2 lg:col-span-4' },
];
const SIZE = {
  lg: { title: 'text-2xl md:text-3xl', desc: 'line-clamp-4 text-[15px]', pad: 'p-6 md:p-8', badges: 6, metrics: true, mark: 'text-[9rem]' },
  md: { title: 'text-xl', desc: 'line-clamp-3 text-sm', pad: 'p-5 md:p-6', badges: 4, metrics: false, mark: 'text-[6rem]' },
  sm: { title: 'text-lg', desc: 'line-clamp-2 text-sm', pad: 'p-5', badges: 3, metrics: false, mark: 'text-[5rem]' },
};

/* ═══════════════════════════ Interactive tech badge ═══════════════════════════ */
function TechBadge({ tag, active = false, onToggle, variant = 'dark', className }) {
  const dark = variant === 'dark';
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      title={`Filter by ${tag}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
      style={{ '--c': brandOf(tag) }}
      className={cn(
        'pointer-events-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent',
        active
          ? 'border-[rgb(var(--c))] bg-[rgb(var(--c)/0.18)] shadow-[0_0_18px_-4px_rgb(var(--c)/0.9)]'
          : 'border-[rgb(var(--c)/0.2)] bg-[rgb(var(--c)/0.06)] hover:border-[rgb(var(--c)/0.65)] hover:bg-[rgb(var(--c)/0.14)]',
        dark
          ? active ? 'text-white' : 'text-slate-300 hover:text-white'
          : active ? 'text-foreground' : 'text-muted hover:text-foreground',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--c))] shadow-[0_0_8px_rgb(var(--c))]" />
      {tag}
    </motion.button>
  );
}

/* Big stack tile used in the explorer row */
function StackTile({ item, active, onToggle }) {
  const empty = item.count === 0;
  return (
    <motion.button
      type="button"
      disabled={empty}
      onClick={onToggle}
      aria-pressed={active}
      whileHover={empty ? undefined : { y: -3 }}
      whileTap={empty ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      style={{ '--c': brandOf(item.label) }}
      className={cn(
        'group glass relative overflow-hidden rounded-2xl border p-4 text-left outline-none transition-[border-color,background-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40',
        active
          ? 'border-[rgb(var(--c))] bg-[rgb(var(--c)/0.12)] shadow-[0_0_34px_-12px_rgb(var(--c)/0.9)]'
          : 'border-line/10 hover:border-[rgb(var(--c)/0.55)]',
      )}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--c))] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[rgb(var(--c))] shadow-[0_0_10px_rgb(var(--c))]" />
        <span className="text-sm font-semibold">{item.label}</span>
      </span>
      <span className="mt-1 block font-mono text-[11px] text-muted">
        {item.count} project{item.count === 1 ? '' : 's'}
      </span>
      <span className="mt-3 block h-1 overflow-hidden rounded-full bg-line/10">
        <motion.span
          initial={{ width: 0 }}
          whileInView={{ width: `${(item.count / MAX_COUNT) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
          className="block h-full rounded-full bg-[rgb(var(--c))]"
        />
      </span>
    </motion.button>
  );
}

/* ═══════════════════════════ Bento card ═══════════════════════════ */
const BentoCard = forwardRef(function BentoCard({ project: p, size, span, index, activeTag, onOpen, onTag, reduce }, ref) {
  const s = SIZE[size];
  const h = hue(p.id);
  const live = liveOf(p);
  const tags = p.tags || [];
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(280px circle at ${mx}px ${my}px, rgb(var(--accent) / 0.75), transparent 65%)`;
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgb(var(--accent) / 0.13), transparent 60%)`;

  const onMove = (e) => {
    if (reduce || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    mx.set(x);
    my.set(y);
    ry.set((x / r.width - 0.5) * 6);
    rx.set(-(y / r.height - 0.5) * 6);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.li
      ref={ref}
      layout="position"
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: EASE, delay: Math.min(index, 6) * 0.06 }}
      className={cn('min-h-[15rem]', span)}
    >
      <div className="group h-full [perspective:1000px]" onPointerMove={onMove} onPointerLeave={onLeave}>
        <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative h-full rounded-3xl bg-white/10 p-px">
          {/* cursor-following border glow */}
          <motion.span
            aria-hidden
            style={{ background: glow }}
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          <article className="relative flex h-full flex-col overflow-hidden rounded-[23px] bg-[rgb(10_11_16)] text-slate-100">
            {/* layered cinematic backdrop */}
            <div aria-hidden className="absolute inset-0 origin-top-right transition-transform duration-700 ease-out group-hover:scale-110" style={{ background: mesh(h) }} />
            <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/.14)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(160deg,#000,transparent_65%)]" />
            <motion.span
              aria-hidden
              style={{ background: spot }}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span aria-hidden className={cn('pointer-events-none absolute -bottom-6 -right-2 select-none font-display font-bold leading-none text-white/[0.045] transition-transform duration-700 group-hover:-translate-x-2', s.mark)}>
              {p.title.split(/[\s–-]/)[0]}
            </span>

            {/* stretched click target (keeps nested links/badges valid HTML) */}
            <button
              type="button"
              onClick={onOpen}
              aria-label={`Open ${p.title}`}
              className="absolute inset-0 z-0 rounded-[23px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
            />

            <div className={cn('pointer-events-none relative z-10 flex h-full flex-col', s.pad)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-400">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur">{p.category}</span>
                  <span>{p.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  {p.featured && <Star size={15} aria-label="Featured" className="fill-accent text-accent" />}
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 backdrop-blur transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-[rgb(7_8_12)]">
                    <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-10">
                <h3 className={cn('font-semibold leading-tight tracking-tight', s.title)}>{p.title}</h3>
                <p className={cn('mt-2 text-slate-300/80', s.desc)}>{p.description}</p>

                {s.metrics && p.metrics?.length > 0 && (
                  <dl className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
                    {p.metrics.slice(0, 3).map(([k, v]) => (
                      <div key={k} className="px-4 py-3">
                        <dt className="text-[11px] text-slate-400">{k}</dt>
                        <dd className="mt-0.5 text-sm font-medium text-white">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, s.badges).map((t) => (
                      <TechBadge key={t} tag={t} active={activeTag === norm(t)} onToggle={() => onTag(norm(t))} />
                    ))}
                    {tags.length > s.badges && (
                      <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[11px] text-slate-500">+{tags.length - s.badges}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {live && (
                      <a
                        href={live}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Live demo of ${p.title}`}
                        className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-slate-200 outline-none transition hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        Live <ExternalLink size={12} />
                      </a>
                    )}
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`GitHub repository for ${p.title}`}
                        className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-200 outline-none transition hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Github size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </motion.div>
      </div>
    </motion.li>
  );
});

/* ═══════════════════════════ Detail modal ═══════════════════════════ */
function Modal({ project: p, total, onClose, onNav, onTag }) {
  const [mode, setMode] = useState('recruiter');
  const [typed, setTyped] = useState('');
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const summary = useMemo(() => summarizeProject(p, mode), [p, mode]);
  const live = liveOf(p);
  const h = hue(p.id);
  const typing = typed.length < summary.length;

  /* focus management + scroll lock */
  useEffect(() => {
    const prev = document.activeElement;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, []);

  /* keyboard: Esc, ←/→ between projects, Tab trap */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && total > 1) onNav(-1);
      else if (e.key === 'ArrowRight' && total > 1) onNav(1);
      else if (e.key === 'Tab') {
        const f = dialogRef.current?.querySelectorAll('a[href], button:not([disabled])');
        if (!f?.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onNav, total]);

  /* streamed summary */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setTyped(summary); return undefined; }
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 3;
      setTyped(summary.slice(0, i));
      if (i >= summary.length) clearInterval(id);
    }, 14);
    return () => clearInterval(id);
  }, [summary]);

  const navBtn = 'grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/30 text-slate-200 backdrop-blur transition hover:border-accent/60 hover:text-accent';

  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="proj-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="scroll-thin relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[rgb(10_11_16)] text-slate-100 shadow-[0_30px_120px_-20px_rgb(0_0_0/0.9)]"
      >
        {/* banner */}
        <div className="relative h-40 overflow-hidden border-b border-white/10" style={{ background: mesh(h) }}>
          <div aria-hidden className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/.16)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(160deg,#000,transparent_75%)]" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgb(10_11_16)] to-transparent" />
          <div className="absolute inset-x-5 top-5 flex items-center justify-between">
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-slate-300 backdrop-blur">
              {p.category} · {p.year}
            </span>
            <div className="flex items-center gap-2">
              {total > 1 && (
                <>
                  <button type="button" onClick={() => onNav(-1)} aria-label="Previous project" className={navBtn}><ChevronLeft size={17} /></button>
                  <button type="button" onClick={() => onNav(1)} aria-label="Next project" className={navBtn}><ChevronRight size={17} /></button>
                </>
              )}
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={navBtn}><X size={17} /></button>
            </div>
          </div>
        </div>

        <div className="-mt-10 p-6 pt-0 md:p-8 md:pt-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              <h3 id="proj-title" className="relative text-2xl font-semibold tracking-tight md:text-3xl">{p.title}</h3>
              <p className="mt-3 text-slate-300/85">{p.description}</p>

              {/* auto summary */}
              <div className="mt-6 rounded-2xl border border-accent/25 bg-accent/5 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-accent"><Bot size={14} /> Auto summary</span>
                  <div role="tablist" aria-label="Summary audience" className="flex gap-1 rounded-full border border-white/10 bg-black/20 p-0.5">
                    {SUMMARY_MODES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        role="tab"
                        aria-selected={mode === m.id}
                        onClick={() => setMode(m.id)}
                        className={cn('relative isolate rounded-full px-3 py-1 text-xs transition-colors', mode === m.id ? 'text-[rgb(7_8_12)]' : 'text-slate-400 hover:text-slate-100')}
                      >
                        {mode === m.id && <motion.span layoutId="sum-mode" transition={{ type: 'spring', stiffness: 400, damping: 32 }} className="absolute inset-0 -z-10 rounded-full bg-accent" />}
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="min-h-[5.5rem] text-sm leading-relaxed text-slate-200" aria-live="polite">
                  {typed}
                  {typing && <span aria-hidden className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-accent" />}
                </p>
              </div>

              {p.metrics?.length > 0 && (
                <dl className="mt-6 grid grid-cols-3 gap-3">
                  {p.metrics.map(([k, v]) => (
                    <motion.div key={k} whileHover={{ y: -2 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <dt className="text-[11px] text-slate-400">{k}</dt>
                      <dd className="mt-0.5 text-sm font-medium">{v}</dd>
                    </motion.div>
                  ))}
                </dl>
              )}

              <div className="mt-5 flex flex-wrap gap-1.5">
                {(p.tags || []).map((t) => <TechBadge key={t} tag={t} onToggle={() => onTag(norm(t))} />)}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {p.github && (
                  <a href={p.github} target="_blank" rel="noreferrer noopener" className="btn btn-primary">
                    <Github size={15} /> {p.githubRepoHint ? `Find ${p.githubRepoHint}` : 'View on GitHub'} <ArrowUpRight size={15} />
                  </a>
                )}
                {live && (
                  <a href={live} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/60 hover:bg-white/5 hover:text-accent">
                    Live demo <ExternalLink size={14} />
                  </a>
                )}
                {total > 1 && <span className="ml-auto hidden font-mono text-[11px] text-slate-500 sm:block">← → browse · Esc close</span>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════ Section ═══════════════════════════ */
export default function Projects() {
  const reduce = useReducedMotion();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [tag, setTag] = useState(null); // normalised tag key
  const [moreTech, setMoreTech] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const searchRef = useRef(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (cat === 'All' || p.category === cat) &&
        (!tag || (p.tags || []).some((t) => norm(t) === tag)) &&
        (!needle || `${p.title} ${p.description} ${(p.tags || []).join(' ')}`.toLowerCase().includes(needle)),
    );
  }, [cat, tag, q]);

  const selected = projects.find((p) => p.id === selectedId) ?? null;
  const closeModal = useCallback(() => setSelectedId(null), []);
  const toggleTag = useCallback((key) => setTag((t) => (t === key ? null : key)), []);
  const modalTag = useCallback((key) => { setTag(key); setSelectedId(null); }, []);
  const onNav = useCallback(
    (dir) => {
      const i = shown.findIndex((p) => p.id === selectedId);
      if (i >= 0) setSelectedId(shown[(i + dir + shown.length) % shown.length].id);
    },
    [shown, selectedId],
  );
  const resetFilters = () => { setCat('All'); setTag(null); setQ(''); };
  const filtered = cat !== 'All' || tag || q.trim();

  /* "/" focuses search */
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target;
      const typing = el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if (e.key === '/' && !typing && !selectedId) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedId]);

  const layout = shown.length === 1
    ? [{ size: 'lg', cls: 'sm:col-span-2 lg:col-span-12' }]
    : shown.length === 2
      ? [{ size: 'md', cls: 'lg:col-span-6' }, { size: 'md', cls: 'lg:col-span-6' }]
      : null;

  return (
    <section id="projects" className="section">
      <SectionHeading eyebrow="04 — Projects" title="Selected work.">
        Explore by stack, category or keyword — then open any project for a summary tailored to your role.
      </SectionHeading>

      {/* ── Stack explorer ── */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {FEATURED_ITEMS.map((item) => (
          <StackTile key={item.key} item={item} active={tag === item.key} onToggle={() => toggleTag(item.key)} />
        ))}
      </div>

      {OTHER_ITEMS.length > 0 && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setMoreTech((m) => !m)}
            aria-expanded={moreTech}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted transition-colors hover:text-foreground"
          >
            More tech ({OTHER_ITEMS.length})
            <ChevronDown size={14} className={cn('transition-transform duration-300', moreTech && 'rotate-180')} />
          </button>
          <AnimatePresence initial={false}>
            {moreTech && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-3">
                  {OTHER_ITEMS.map((t) => (
                    <TechBadge key={t.key} variant="page" tag={t.label} active={tag === t.key} onToggle={() => toggleTag(t.key)} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="glass mb-3 flex flex-col gap-3 rounded-2xl p-2.5 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn('relative isolate rounded-full px-3.5 py-1.5 text-sm transition-colors', cat === c ? 'text-accent' : 'text-muted hover:text-foreground')}
            >
              {cat === c && (
                <motion.span layoutId="proj-cat" transition={{ type: 'spring', stiffness: 400, damping: 32 }} className="absolute inset-0 -z-10 rounded-full bg-accent/15 ring-1 ring-accent/40" />
              )}
              {c}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <label htmlFor="proj-search" className="sr-only">Search projects</label>
          <input
            id="proj-search"
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && (setQ(''), e.currentTarget.blur())}
            placeholder="Search projects…"
            className="w-full rounded-xl border border-line/10 bg-line/5 py-2 pl-10 pr-10 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
          />
          {q ? (
            <button type="button" onClick={() => setQ('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"><X size={14} /></button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line/10 px-1.5 font-mono text-[10px] text-muted md:block">/</kbd>
          )}
        </div>
      </div>

      <p className="mb-6 flex min-h-[1.5rem] flex-wrap items-center gap-2 font-mono text-[11px] text-muted" aria-live="polite">
        <span>{shown.length} of {projects.length} projects</span>
        {tag && TAGS.get(tag) && <span className="rounded-full border border-accent/40 px-2 py-0.5 text-accent">{TAGS.get(tag).label}</span>}
        {filtered && <button type="button" onClick={resetFilters} className="text-accent underline-offset-4 hover:underline">reset</button>}
      </p>

      {/* ── Bento grid ── */}
      <ul className="grid grid-flow-dense gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(15rem,auto)] lg:grid-cols-12">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p, i) => {
            const slot = layout ? layout[i] : SPANS[i % SPANS.length];
            return (
              <BentoCard
                key={p.id}
                project={p}
                index={i}
                size={slot.size}
                span={slot.cls}
                activeTag={tag}
                reduce={reduce}
                onOpen={() => setSelectedId(p.id)}
                onTag={toggleTag}
              />
            );
          })}
        </AnimatePresence>
      </ul>

      {shown.length === 0 && (
        <div className="glass mx-auto mt-4 max-w-md rounded-2xl p-10 text-center">
          <Search size={22} className="mx-auto text-muted" />
          <p className="mt-3 font-medium">No projects match</p>
          <p className="mt-1 text-sm text-muted">Try a different stack or keyword.</p>
          <button type="button" onClick={resetFilters} className="mt-4 text-sm text-accent underline-offset-4 hover:underline">Reset filters</button>
        </div>
      )}

      <AnimatePresence>
        {selected && <Modal key="modal" project={selected} total={shown.length} onClose={closeModal} onNav={onNav} onTag={modalTag} />}
      </AnimatePresence>
    </section>
  );
}