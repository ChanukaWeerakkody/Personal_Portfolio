import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Clock } from 'lucide-react';
import { articles, profile } from '@/data/profile';
import { cn } from '@/lib/utils';
import SectionHeading from '@/components/ui/SectionHeading';

/* ═══════════════════════════ Constants & helpers ═══════════════════════════ */
const EASE = [0.22, 1, 0.36, 1];
const AUTOPLAY_SECONDS = 7;

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const hue = (s) => [...String(s)].reduce((n, c) => n + c.charCodeAt(0), 0) % 360;
const pad = (n) => String(n).padStart(2, '0');
const mesh = (h) =>
  `radial-gradient(55% 70% at 85% 10%, hsl(${h} 85% 55% / .34), transparent 62%), radial-gradient(50% 60% at 5% 95%, hsl(${(h + 70) % 360} 85% 50% / .2), transparent 62%)`;

/* Brand colours (space-separated RGB). Unknown topics fall back to the site accent. */
const BRAND = {
  springboot: '109 179 63',
  nestjs: '224 35 78',
  laravel: '255 45 32',
  react: '97 218 251',
  reactnative: '97 218 251',
  nodejs: '104 160 99',
  typescript: '49 120 198',
  java: '237 139 0',
  php: '119 123 179',
  mysql: '0 150 190',
  postgresql: '80 140 200',
  mongodb: '71 162 72',
  redis: '220 56 44',
  docker: '36 150 237',
  kubernetes: '50 108 229',
  jwt: '251 1 91',
  devops: '36 150 237',
  security: '251 1 91',
};
const brandOf = (tag) => BRAND[norm(tag)] ?? 'var(--accent)';
const FEATURED = ['Spring Boot', 'NestJS', 'Laravel', 'React'].map(norm);

/* topic index: featured stacks first, then by popularity */
const TOPICS = (() => {
  const m = new Map();
  articles.forEach((a) =>
    (a.tags || []).forEach((t) => {
      const key = norm(t);
      const e = m.get(key) ?? { key, label: t, count: 0 };
      e.count += 1;
      m.set(key, e);
    }),
  );
  const rank = (t) => (FEATURED.includes(t.key) ? FEATURED.indexOf(t.key) : 99);
  return [...m.values()].sort((a, b) => rank(a) - rank(b) || b.count - a.count || a.label.localeCompare(b.label));
})();

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

function useMedia(query) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/* ═══════════════════════════ Pieces ═══════════════════════════ */
function TechBadge({ tag, count, active = false, onToggle, variant = 'dark' }) {
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
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent',
        active
          ? 'border-[rgb(var(--c))] bg-[rgb(var(--c)/0.18)] shadow-[0_0_18px_-4px_rgb(var(--c)/0.9)]'
          : 'border-[rgb(var(--c)/0.2)] bg-[rgb(var(--c)/0.06)] hover:border-[rgb(var(--c)/0.65)] hover:bg-[rgb(var(--c)/0.14)]',
        dark
          ? active ? 'text-white' : 'text-slate-300 hover:text-white'
          : active ? 'text-foreground' : 'text-muted hover:text-foreground',
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--c))] shadow-[0_0_8px_rgb(var(--c))]" />
      {tag}
      {count !== undefined && <span className="font-mono text-[10px] opacity-60">{count}</span>}
    </motion.button>
  );
}

/* Title that slides up word by word */
function WordReveal({ text, reduce, className }) {
  return (
    <h3 className={className}>
      {text.split(' ').map((w, i) => (
        <span key={`${w}-${i}`} className="mr-[0.25em] inline-block overflow-hidden py-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.045 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </h3>
  );
}

const CORNERS = [
  'left-4 top-4 border-l border-t',
  'right-4 top-4 border-r border-t',
  'bottom-4 left-4 border-b border-l',
  'bottom-4 right-4 border-b border-r',
];

/* ── Cinematic preview panel (desktop) ── */
function Preview({ article: a, index, total, latest, activeTag, onTag, reduce }) {
  const h = hue(a.title);
  const tags = a.tags || [];
  const excerpt = a.excerpt ?? a.summary ?? a.description;

  return (
    <div className="relative min-h-[34rem] overflow-hidden rounded-3xl border border-white/10 bg-[rgb(10_11_16)] text-slate-100 shadow-[0_30px_100px_-30px_rgb(0_0_0/0.9)]">
      {/* aurora crossfades with each article's hue */}
      <AnimatePresence initial={false}>
        <motion.div
          key={a.url}
          aria-hidden
          className="absolute inset-0"
          style={{ background: mesh(h) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        />
      </AnimatePresence>
      <div aria-hidden className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/.04)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]" />
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-accent/[0.07] to-transparent"
          initial={{ y: -120 }}
          animate={{ y: 720 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {CORNERS.map((c) => (
        <span key={c} aria-hidden className={cn('pointer-events-none absolute h-4 w-4 border-accent/60', c)} />
      ))}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={a.url}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          className="relative z-10 flex min-h-[34rem] flex-col p-8 xl:p-10"
        >
          {/* outlined issue number */}
          <motion.span
            aria-hidden
            initial={reduce ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="pointer-events-none absolute -right-2 -top-6 select-none font-mono text-[13rem] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.14)]"
          >
            {pad(index + 1)}
          </motion.span>

          <motion.div variants={rise} className="relative flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur">
              Issue {pad(index + 1)} / {pad(total)}
            </span>
            {latest && (
              <span className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-accent">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                Latest
              </span>
            )}
            <span>{a.date}</span>
          </motion.div>

          <div className="relative mt-auto pt-28">
            <WordReveal text={a.title} reduce={reduce} className="max-w-[22ch] text-4xl font-semibold leading-[1.08] tracking-tight xl:text-5xl" />

            {excerpt && (
              <motion.p variants={rise} className="mt-5 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-slate-300/85">
                {excerpt}
              </motion.p>
            )}

            <motion.div variants={rise} className="mt-6 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <TechBadge key={t} tag={t} active={activeTag === norm(t)} onToggle={() => onTag(norm(t))} />
              ))}
            </motion.div>

            <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-accent py-2 pl-6 pr-2 text-sm font-semibold text-[rgb(7_8_12)] shadow-[0_0_40px_-8px_rgb(var(--accent)/0.8)] outline-none transition-shadow hover:shadow-[0_0_56px_-6px_rgb(var(--accent)/0.95)] focus-visible:ring-2 focus-visible:ring-white"
              >
                Read on Medium
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[rgb(7_8_12)] text-accent transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={16} />
                </span>
              </a>
              {a.read && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400">
                  <Clock size={13} /> {a.read}
                </span>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Index row ── */
function IndexRow({ article: a, index, active, playing, onActivate, onAdvance, reduce }) {
  const tags = a.tags || [];
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index, 8) * 0.05 }}
    >
      <a
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        onPointerEnter={(e) => e.pointerType === 'mouse' && onActivate()}
        onFocus={onActivate}
        className="group relative block rounded-2xl px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {active && (
          <>
            <motion.span
              layoutId="writing-active"
              aria-hidden
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="absolute inset-0 rounded-2xl bg-accent/[0.07] ring-1 ring-accent/30"
            />
            <motion.span
              layoutId="writing-bar"
              aria-hidden
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="absolute bottom-4 left-0 top-4 w-0.5 rounded-full bg-accent shadow-[0_0_12px_rgb(var(--accent))]"
            />
          </>
        )}

        <div className="relative grid grid-cols-[auto_1fr_auto] items-start gap-4">
          <span className={cn('pt-1 font-mono text-xs transition-colors', active ? 'text-accent' : 'text-muted')}>{pad(index + 1)}</span>
          <div className="min-w-0">
            <h3 className={cn('text-base font-medium leading-snug transition-opacity md:text-[1.05rem]', active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100')}>
              {a.title}
            </h3>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
              <span>{a.date}</span>
              {a.read && <span className="inline-flex items-center gap-1"><Clock size={11} /> {a.read}</span>}
            </p>
            {/* tags are visible inline when the preview panel is hidden */}
            {tags.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-1.5 lg:hidden">
                {tags.slice(0, 4).map((t) => <span key={t} className="chip">{t}</span>)}
              </p>
            )}
          </div>
          <ArrowUpRight
            size={18}
            className={cn('mt-0.5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent', active ? 'text-accent' : 'text-muted')}
          />
        </div>

        {/* autoplay progress / static underline */}
        {active && (
          playing ? (
            <motion.span
              key="run"
              aria-hidden
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTOPLAY_SECONDS, ease: 'linear' }}
              onAnimationComplete={onAdvance}
              className="absolute inset-x-4 bottom-0 h-px origin-left bg-accent"
            />
          ) : (
            <span aria-hidden className="absolute inset-x-4 bottom-0 h-px bg-accent/40" />
          )
        )}
      </a>
    </motion.li>
  );
}

/* ═══════════════════════════ Section ═══════════════════════════ */
export default function Writing() {
  const reduce = useReducedMotion();
  const isLg = useMedia('(min-width: 1024px)');
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.3 });

  const [tag, setTag] = useState(null); // normalised topic key
  const [activeUrl, setActiveUrl] = useState(articles[0]?.url ?? null);
  const [hovering, setHovering] = useState(false);
  const [focusIn, setFocusIn] = useState(false);

  const shown = useMemo(
    () => articles.filter((a) => !tag || (a.tags || []).some((t) => norm(t) === tag)),
    [tag],
  );
  const idx = Math.max(0, shown.findIndex((a) => a.url === activeUrl));
  const active = shown[idx];
  const playing = !reduce && isLg && inView && !hovering && !focusIn && shown.length > 1;

  const advance = useCallback(() => {
    if (shown.length > 1) setActiveUrl(shown[(idx + 1) % shown.length].url);
  }, [shown, idx]);
  const toggleTag = useCallback((key) => setTag((t) => (t === key ? null : key)), []);

  return (
    <section id="writing" ref={sectionRef} className="section">
      <SectionHeading eyebrow="06 — Writing" title="Notes on backend engineering.">
        Articles on architecture, security and DevOps, published on Medium.
      </SectionHeading>

      {/* ── Channels (topic filter) ── */}
      {TOPICS.length > 0 && (
        <div className="glass mb-8 flex flex-wrap items-center gap-1.5 rounded-2xl p-2.5" role="group" aria-label="Filter articles by topic">
          <button
            type="button"
            onClick={() => setTag(null)}
            aria-pressed={!tag}
            className={cn('relative isolate rounded-full px-3.5 py-1.5 text-sm transition-colors', !tag ? 'text-accent' : 'text-muted hover:text-foreground')}
          >
            {!tag && (
              <motion.span layoutId="writing-all" transition={{ type: 'spring', stiffness: 400, damping: 32 }} className="absolute inset-0 -z-10 rounded-full bg-accent/15 ring-1 ring-accent/40" />
            )}
            All <span className="ml-1 font-mono text-[11px] opacity-60">{articles.length}</span>
          </button>
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-line/10 sm:block" />
          {TOPICS.map((t) => (
            <TechBadge key={t.key} variant="page" tag={t.label} count={t.count} active={tag === t.key} onToggle={() => toggleTag(t.key)} />
          ))}
          <span className="ml-auto hidden font-mono text-[11px] text-muted md:block" aria-live="polite">
            {shown.length} / {articles.length} issues
          </span>
        </div>
      )}

      {/* ── Reader ── */}
      {shown.length > 0 ? (
        <div
          className="grid items-start gap-6 lg:grid-cols-12"
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocus={() => setFocusIn(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusIn(false); }}
        >
          <motion.aside
            aria-label="Article preview"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: EASE }}
            className="sticky top-24 hidden lg:col-span-7 lg:block"
          >
            <Preview
              article={active}
              index={idx}
              total={shown.length}
              latest={active.url === articles[0]?.url}
              activeTag={tag}
              onTag={toggleTag}
              reduce={reduce}
            />
          </motion.aside>

          <div className="glass rounded-3xl p-2 lg:col-span-5">
            <ol>
              {shown.map((a, i) => (
                <IndexRow
                  key={a.url}
                  article={a}
                  index={i}
                  active={i === idx}
                  playing={playing}
                  reduce={reduce}
                  onActivate={() => setActiveUrl(a.url)}
                  onAdvance={advance}
                />
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="glass mx-auto max-w-md rounded-2xl p-10 text-center">
          <BookOpen size={22} className="mx-auto text-muted" />
          <p className="mt-3 font-medium">No articles on that topic yet</p>
          <button type="button" onClick={() => setTag(null)} className="mt-4 text-sm text-accent underline-offset-4 hover:underline">Show all articles</button>
        </div>
      )}

      {/* ── Medium CTA with orbiting border ── */}
      <motion.a
        href={profile.medium}
        target="_blank"
        rel="noopener noreferrer"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: EASE }}
        className="group relative mt-8 block overflow-hidden rounded-3xl p-px outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span aria-hidden className="absolute inset-0 bg-line/10" />
        {!reduce && (
          <span
            aria-hidden
            className="absolute -inset-[150%] animate-[spin_7s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_70%,rgb(var(--accent))_100%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <span className="glass relative flex flex-col gap-4 rounded-[23px] bg-background p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <span>
            <span className="block font-mono text-[11px] uppercase tracking-widest text-accent">Medium</span>
            <span className="mt-1 block text-lg font-semibold md:text-xl">Read everything I've published</span>
            <span className="mt-1 block text-sm text-muted">Deep dives on architecture, security and DevOps — new notes as I write them.</span>
          </span>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-[rgb(7_8_12)]">
            All articles on Medium
            <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </span>
      </motion.a>
    </section>
  );
}