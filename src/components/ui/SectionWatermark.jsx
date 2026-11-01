import { useEffect, useId, useMemo, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { navItems } from '@/data/profile';
import { useActiveSection } from '@/hooks/useActiveSection';

const defaultIds = navItems.map((n) => n.id);

/* ------------------------------------------------------------------ */
/*  Monogram geometry (same "CW." mark as the Logo component)          */
/* ------------------------------------------------------------------ */
const DISC = { cx: 385, cy: 431, r: 254 };
const DOT = { cx: 970, cy: 505, r: 48 };
const VIEWBOX = '110 160 920 540';

// Solid "C" = thick arc, open to the right
const C_ARC = 'M 455.9 382.7 A 86 86 0 1 0 455.9 493.3';
// Outline "C" (for the wireframe depth layers)
const C_OUTLINE =
  'M 481.2 361.5 A 119 119 0 1 0 481.2 514.5 L 430.6 472.1 A 53 53 0 1 1 430.6 403.9 Z';

const W_POINTS = [
  [585, 327],
  [648, 327],
  [698, 462],
  [722, 327],
  [752, 327],
  [795, 462],
  [850, 327],
  [918, 327],
  [835, 548],
  [770, 548],
  [737, 430],
  [672, 548],
  [612, 548],
]
  .map((p) => p.join(','))
  .join(' ');

const MASK_BOUNDS = { x: 110, y: 160, width: 920, height: 540 };

/**
 * Filled monogram: disc with knocked-out C + W, W solid outside the disc, dot.
 * Uses a soft accent gradient and an animated specular sweep that is clipped
 * to the letterforms themselves (no rectangular edges anywhere).
 */
function SolidMark({ color }) {
  const uid = useId().replace(/:/g, '');
  const discMask = `wm-disc-${uid}`;
  const wMask = `wm-w-${uid}`;
  const fillGrad = `wm-fill-${uid}`;
  const sweepGrad = `wm-sweep-${uid}`;

  const shapes = (fill) => (
    <>
      <circle cx={DISC.cx} cy={DISC.cy} r={DISC.r} fill={fill} mask={`url(#${discMask})`} />
      <polygon points={W_POINTS} fill={fill} mask={`url(#${wMask})`} />
      <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} fill={fill} />
    </>
  );

  return (
    <svg viewBox={VIEWBOX} className="h-full w-full" fill="none">
      <defs>
        <mask id={discMask} maskUnits="userSpaceOnUse" {...MASK_BOUNDS}>
          <rect {...MASK_BOUNDS} fill="#fff" />
          <path d={C_ARC} stroke="#000" strokeWidth={66} strokeLinecap="butt" fill="none" />
          <polygon points={W_POINTS} fill="#000" />
        </mask>
        <mask id={wMask} maskUnits="userSpaceOnUse" {...MASK_BOUNDS}>
          <rect {...MASK_BOUNDS} fill="#fff" />
          <circle cx={DISC.cx} cy={DISC.cy} r={DISC.r} fill="#000" />
        </mask>

        {/* depth gradient: bright top-left -> softer bottom-right */}
        <linearGradient id={fillGrad} x1="130" y1="180" x2="1020" y2="690" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0.45" />
        </linearGradient>

        {/* moving specular band */}
        <motion.linearGradient
          id={sweepGrad}
          gradientUnits="userSpaceOnUse"
          y1="160"
          y2="700"
          initial={{ x1: -260, x2: -60 }}
          animate={{ x1: [-260, 1180], x2: [-60, 1380] }}
          transition={{ duration: 3.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4.5 }}
        >
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </motion.linearGradient>
      </defs>

      {shapes(`url(#${fillGrad})`)}
      <g style={{ mixBlendMode: 'overlay' }}>{shapes(`url(#${sweepGrad})`)}</g>
    </svg>
  );
}

/** Wireframe monogram used for the stacked depth layers. */
function OutlineMark({ color, width = 3 }) {
  return (
    <svg viewBox={VIEWBOX} className="h-full w-full" fill="none">
      <g stroke={color} strokeWidth={width} strokeLinejoin="round">
        <circle cx={DISC.cx} cy={DISC.cy} r={DISC.r} />
        <path d={C_OUTLINE} />
        <polygon points={W_POINTS} />
        <circle cx={DOT.cx} cy={DOT.cy} r={DOT.r} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene config                                                       */
/* ------------------------------------------------------------------ */
// Depth layers behind / in front of the solid face (translateZ in px)
const DEPTH_LAYERS = [
  { z: -150, opacity: 0.25 },
  { z: -110, opacity: 0.35 },
  { z: -75, opacity: 0.5 },
  { z: -40, opacity: 0.7 },
  { z: 45, opacity: 0.4 },
];

// Orbits: no visible track, just a fading comet trail + glowing head
const ORBITS = [
  { size: 118, tiltX: 74, tiltY: 0, z: 0, duration: 26 },
  { size: 96, tiltX: 74, tiltY: 28, z: 20, duration: 34, reverse: true },
  { size: 74, tiltX: 62, tiltY: -34, z: -20, duration: 20 },
];

// Floating backend chips (borderless: glowing node + label)
const CHIPS = [
  { label: 'Spring Boot', x: 4, y: 20, z: 90, delay: 0 },
  { label: 'NestJS', x: 78, y: 10, z: 60, delay: 0.6 },
  { label: 'Node.js', x: 86, y: 62, z: 130, delay: 1.1 },
  { label: 'Laravel', x: 0, y: 66, z: 40, delay: 1.6 },
  { label: 'REST', x: 66, y: 88, z: 160, delay: 0.3 },
  { label: 'JWT', x: 20, y: 90, z: 100, delay: 0.9 },
];

// Tiny depth particles
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  z: ((i * 71) % 260) - 80,
  size: 2 + (i % 3),
  delay: (i % 5) * 0.5,
}));

/**
 * Ambient 3D background watermark.
 *
 * - Hidden on the home section; reveals with a blur/scale/tilt transition on every other section.
 * - Borderless design: no boxes or outlined rings. Depth comes from stacked layers, comet-trail
 *   orbits, a fading perspective grid, glowing nodes and floating particles.
 * - Reacts to the pointer (parallax tilt), to scroll (slow roll) and to the active section
 *   (each section gets its own resting rotation).
 * - Theme aware via `rgb(var(--accent))`; ultra-subtle opacity so content stays readable.
 * - Respects prefers-reduced-motion.
 */
export default function SectionWatermark({ activeSection: customActive }) {
  const [mounted, setMounted] = useState(false);
  const detectedActive = useActiveSection(defaultIds);
  const active = customActive || detectedActive || 'home';
  const isHome = active === 'home';

  const accent = 'rgb(var(--accent))';
  const accentMid = 'rgb(var(--accent) / 0.55)';
  const accentFaint = 'rgb(var(--accent) / 0.1)';

  /* ---- motion values (hooks must run before any early return) ---- */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const baseY = useMotionValue(0);
  const baseX = useMotionValue(0);

  const sPointerX = useSpring(pointerX, { stiffness: 55, damping: 18, mass: 0.8 });
  const sPointerY = useSpring(pointerY, { stiffness: 55, damping: 18, mass: 0.8 });
  const sBaseY = useSpring(baseY, { stiffness: 40, damping: 16 });
  const sBaseX = useSpring(baseX, { stiffness: 40, damping: 16 });

  const { scrollYProgress } = useScroll();
  const sScroll = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });

  const rotateY = useTransform([sBaseY, sPointerX], ([b, p]) => b + p * 24);
  const rotateX = useTransform([sBaseX, sPointerY], ([b, p]) => b - p * 16);
  const rotateZ = useTransform(sScroll, [0, 1], [-5, 5]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Each section gets its own resting pose
  useEffect(() => {
    const idx = Math.max(0, defaultIds.indexOf(active));
    baseY.set(((idx % 4) - 1.5) * 16);
    baseX.set(idx % 2 === 0 ? 10 : 4);
  }, [active, baseX, baseY]);

  // Pointer parallax
  useEffect(() => {
    if (!mounted) return undefined;
    const onMove = (e) => {
      pointerX.set(e.clientX / window.innerWidth - 0.5);
      pointerY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mounted, pointerX, pointerY]);

  const chips = useMemo(() => CHIPS, []);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !mounted) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!isHome && (
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.88, filter: 'blur(14px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
            style={{
              maskImage:
                'radial-gradient(ellipse 72% 72% at 50% 50%, #000 35%, transparent 100%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 72% 72% at 50% 50%, #000 35%, transparent 100%)',
            }}
          >
            {/* ambient bloom: two soft layers for a richer glow */}
            <div
              className="absolute h-[64vmin] w-[64vmin] rounded-full opacity-[0.16] blur-[110px]"
              style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
            />
            <div
              className="absolute h-[32vmin] w-[32vmin] rounded-full opacity-[0.12] blur-[60px]"
              style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
            />

            {/* 3D stage (no border / background of its own) */}
            <div
              className="relative aspect-square w-[min(78vmin,720px)]"
              style={{ perspective: 1400 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ transformStyle: 'preserve-3d', rotateX, rotateY, rotateZ }}
              >
                {/* ── perspective grid floor (fades out in every direction) ── */}
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[170%] w-[170%] opacity-[0.5]"
                  style={{
                    transform: 'translate(-50%, 4%) rotateX(80deg) translateZ(-60px)',
                    backgroundImage: `linear-gradient(${accentFaint} 1.5px, transparent 1.5px), linear-gradient(90deg, ${accentFaint} 1.5px, transparent 1.5px)`,
                    backgroundSize: '56px 56px',
                    maskImage:
                      'radial-gradient(ellipse 45% 45% at 50% 50%, #000 5%, transparent 70%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 45% 45% at 50% 50%, #000 5%, transparent 70%)',
                  }}
                  animate={{ backgroundPosition: ['0px 0px', '0px 56px'] }}
                  transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
                />

                {/* ── orbits: comet trail + glowing head, no outline ── */}
                {ORBITS.map((o, i) => (
                  <div
                    key={`orbit-${i}`}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      width: `${o.size}%`,
                      height: `${o.size}%`,
                      transformStyle: 'preserve-3d',
                      transform: `translate(-50%, -50%) rotateX(${o.tiltX}deg) rotateY(${o.tiltY}deg) translateZ(${o.z}px)`,
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full opacity-[0.3] dark:opacity-[0.45]"
                      style={{
                        // fading arc trail (transparent -> accent), masked to a thin ring band
                        background: `conic-gradient(from 0deg, transparent 0deg, transparent 230deg, ${accentMid} 350deg, ${accent} 360deg)`,
                        WebkitMask:
                          'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
                        mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))',
                      }}
                      animate={{ rotate: o.reverse ? -360 : 360 }}
                      transition={{ duration: o.duration, ease: 'linear', repeat: Infinity }}
                    >
                      {/* head of the comet sits at the end of the trail (top) */}
                      <span
                        className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background: accent,
                          boxShadow: `0 0 18px 4px ${accentMid}`,
                        }}
                      />
                    </motion.div>
                  </div>
                ))}

                {/* ── depth particles ── */}
                {PARTICLES.map((p, i) => (
                  <div
                    key={`p-${i}`}
                    className="absolute"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: `translateZ(${p.z}px)`,
                    }}
                  >
                    <motion.span
                      className="block rounded-full"
                      style={{
                        width: p.size,
                        height: p.size,
                        background: accent,
                        boxShadow: `0 0 10px 2px ${accentMid}`,
                      }}
                      animate={{ y: [0, -16, 0], opacity: [0.1, 0.35, 0.1] }}
                      transition={{
                        duration: 6 + p.delay,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: p.delay,
                      }}
                    />
                  </div>
                ))}

                {/* ── floating monogram stack ── */}
                <motion.div
                  className="absolute left-1/2 top-1/2 w-[64%]"
                  style={{
                    aspectRatio: '920 / 540',
                    transformStyle: 'preserve-3d',
                    translateX: '-50%',
                    translateY: '-50%',
                  }}
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
                >
                  {/* wireframe depth layers */}
                  {DEPTH_LAYERS.map((layer, i) => (
                    <div
                      key={`layer-${i}`}
                      className="absolute inset-0 opacity-[0.1] dark:opacity-[0.14]"
                      style={{ transform: `translateZ(${layer.z}px)` }}
                    >
                      <div style={{ opacity: layer.opacity }} className="h-full w-full">
                        <OutlineMark
                          color={accent}
                          width={i === DEPTH_LAYERS.length - 1 ? 3.5 : 2.5}
                        />
                      </div>
                    </div>
                  ))}

                  {/* solid face with gradient + specular sweep */}
                  <div
                    className="absolute inset-0 opacity-[0.09] dark:opacity-[0.13]"
                    style={{
                      transform: 'translateZ(0px)',
                      filter: `drop-shadow(0 0 28px ${accentMid})`,
                    }}
                  >
                    <SolidMark color={accent} />
                  </div>
                </motion.div>

                {/* ── floating backend labels: borderless glowing nodes ── */}
                {chips.map((chip) => (
                  <div
                    key={chip.label}
                    className="absolute"
                    style={{
                      left: `${chip.x}%`,
                      top: `${chip.y}%`,
                      transform: `translateZ(${chip.z}px)`,
                    }}
                  >
                    <motion.div
                      className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] opacity-[0.2] dark:opacity-[0.32]"
                      style={{ color: accent }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 5 + chip.delay,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: chip.delay,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: accent, boxShadow: `0 0 10px 2px ${accentMid}` }}
                      />
                      {chip.label}
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* section tag */}
            <div
              className="absolute bottom-[6vh] left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.35em] opacity-[0.14] dark:opacity-[0.2]"
              style={{ color: accent }}
            >
              CW // {active}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}