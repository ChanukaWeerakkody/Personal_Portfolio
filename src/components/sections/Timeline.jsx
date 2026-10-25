import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Briefcase, ChevronDown, GraduationCap } from 'lucide-react';
import { timeline } from '@/data/profile';
import { cn } from '@/lib/utils';
import SectionHeading from '@/components/ui/SectionHeading';

const FILTERS = [
  ['all', 'All'],
  ['work', 'Work'],
  ['education', 'Education'],
];

const EASE = [0.22, 1, 0.36, 1];
const idOf = (t) => `${t.title}|${t.period}`;

/* ── Stagger variants for the expanded panel ── */
const panel = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};
const rise = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};
const chips = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const pop = {
  hidden: { opacity: 0, scale: 0.85, y: 6 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 420, damping: 24 },
  },
};

const TimelineItem = forwardRef(function TimelineItem({ item: t, open, onToggle, reduce }, ref) {
  const [lit, setLit] = useState(false); // true while the card crosses the viewport centre
  const mx = useMotionValue(-999);
  const my = useMotionValue(-999);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgb(var(--accent) / 0.16), transparent 65%)`;

  const Icon = t.type === 'work' ? Briefcase : GraduationCap;
  const expandable = Boolean(t.detail || t.tags?.length);
  const current = Boolean(t.status) || /present/i.test(t.period);

  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  return (
    <motion.li
      ref={ref}
      layout="position"
      initial={reduce ? false : { opacity: 0, x: -24, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={reduce ? undefined : { opacity: 0, x: 16, transition: { duration: 0.2 } }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative"
    >
      {/* ── Node ── */}
      <span className="absolute -left-8 top-5 md:-left-12">
        <motion.span
          animate={{ scale: lit ? 1.12 : 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          className={cn(
            'relative grid h-6 w-6 place-items-center rounded-full border bg-background transition-[border-color,box-shadow] duration-300 md:h-10 md:w-10',
            lit || open
              ? 'border-accent shadow-[0_0_18px_rgb(var(--accent)/0.55)]'
              : 'border-accent/40',
          )}
        >
          {lit && !reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border border-accent"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <Icon
            className={cn(
              'h-3.5 w-3.5 transition-colors duration-300 md:h-[18px] md:w-[18px]',
              lit || open ? 'text-accent' : 'text-accent/70',
            )}
          />
        </motion.span>
      </span>

      {/* ── Card ── */}
      <motion.div
        viewport={{ margin: '-40% 0px -40% 0px' }}
        onViewportEnter={() => setLit(true)}
        onViewportLeave={() => setLit(false)}
        whileHover={reduce ? undefined : { x: 4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <button
          onClick={() => expandable && onToggle()}
          onMouseMove={reduce ? undefined : handleMove}
          aria-expanded={expandable ? open : undefined}
          disabled={!expandable}
          className={cn(
            'group glass glass-hover relative w-full overflow-hidden rounded-2xl p-5 text-left transition-shadow duration-500 disabled:cursor-default',
            open && 'shadow-[0_0_44px_-14px_rgb(var(--accent)/0.55)]',
          )}
        >
          {/* Cursor-following spotlight */}
          {!reduce && (
            <motion.span
              aria-hidden
              style={{ background: spotlight }}
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 font-mono text-xs text-accent">
                {current && (
                  <span className="relative flex h-1.5 w-1.5" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                )}
                {t.period}
                {t.status && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px]">{t.status}</span>
                )}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{t.title}</h3>
              <p className="text-sm text-muted">{t.org}</p>
            </div>
            {expandable && (
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="mt-1 shrink-0 text-muted group-hover:text-foreground"
              >
                <ChevronDown size={18} />
              </motion.span>
            )}
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="relative overflow-hidden"
              >
                <motion.div variants={panel} initial="hidden" animate="show">
                  {t.detail && (
                    <motion.p variants={rise} className="mt-4 text-sm leading-relaxed text-muted">
                      {t.detail}
                    </motion.p>
                  )}
                  {t.tags?.length > 0 && (
                    <motion.div variants={chips} className="mt-4 flex flex-wrap gap-1.5">
                      {t.tags.map((x) => (
                        <motion.span
                          key={x}
                          variants={pop}
                          whileHover={reduce ? undefined : { y: -2 }}
                          className="chip"
                        >
                          {x}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Accent underline that draws in while open */}
          <motion.span
            aria-hidden
            initial={false}
            animate={{ scaleX: open ? 1 : 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-accent via-accent/50 to-transparent"
          />
        </button>
      </motion.div>
    </motion.li>
  );
});

export default function Timeline() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(() => {
    const first = timeline.find((t) => t.type === 'work' && (t.detail || t.tags));
    return first ? idOf(first) : null;
  });

  useEffect(() => {
    const h = (e) => setFilter(e.detail);
    window.addEventListener('timeline:filter', h);
    return () => window.removeEventListener('timeline:filter', h);
  }, []);

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const headTop = useTransform(progress, (v) => `${v * 100}%`);
  const blobY = useTransform(scrollYProgress, [0, 1], [-60, 80]);

  const items = timeline.filter((t) => filter === 'all' || t.type === filter);
  const count = (id) => (id === 'all' ? timeline.length : timeline.filter((t) => t.type === id).length);

  return (
    <section id="experience" className="section">
      <SectionHeading eyebrow="02 — Journey" title="Experience & education timeline.">
        Where I've worked and studied. Tap any entry to expand.
      </SectionHeading>

      {/* ── Filter pills ── */}
      <div role="tablist" aria-label="Filter timeline" className="mb-10 inline-flex rounded-full glass p-1">
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors',
              filter === id ? 'text-[rgb(7_8_12)]' : 'text-muted hover:text-foreground',
            )}
          >
            {filter === id && (
              <motion.span
                layoutId="tl-filter"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-accent shadow-[0_0_20px_rgb(var(--accent)/0.5)]"
              />
            )}
            {label}
            <span
              className={cn(
                'rounded-full px-1.5 font-mono text-[10px]',
                filter === id ? 'bg-black/15' : 'bg-white/5',
              )}
            >
              {count(id)}
            </span>
          </button>
        ))}
      </div>

      <div ref={ref} className="relative pl-8 md:pl-12">
        {/* Ambient glow that drifts with scroll */}
        {!reduce && (
          <motion.div
            aria-hidden
            style={{ y: blobY }}
            className="pointer-events-none absolute -right-20 top-10 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
          />
        )}

        {/* ── Spine: track, glowing progress and travelling head ── */}
        <div aria-hidden className="absolute bottom-2 left-[11px] top-2 w-px md:left-[19px]">
          <div className="absolute inset-0 bg-line/10" />
          <motion.div
            style={{ scaleY: progress }}
            className="absolute inset-0 origin-top bg-gradient-to-b from-accent/30 via-accent to-accent shadow-[0_0_12px_rgb(var(--accent)/0.8)]"
          />
          <motion.span
            style={{ top: headTop }}
            className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_3px_rgb(var(--accent)/0.7)]"
          />
        </div>

        <ol className="space-y-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((t) => {
              const id = idOf(t);
              return (
                <TimelineItem
                  key={id}
                  item={t}
                  reduce={reduce}
                  open={openId === id}
                  onToggle={() => setOpenId(openId === id ? null : id)}
                />
              );
            })}
          </AnimatePresence>
        </ol>
      </div>
    </section>
  );
}