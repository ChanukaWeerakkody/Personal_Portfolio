import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { navItems } from '@/data/profile';
import { useActiveSection } from '@/hooks/useActiveSection';

const defaultIds = navItems.map((n) => n.id);

/**
 * Ambient background section watermark logo.
 *
 * Requirements fulfilled:
 * - Except home screen, animates with a smooth fade-out/reveal as users scroll into sections (About, Projects, etc.).
 * - Theme balance: Ultra-subtle cinematic opacity (0.04 - 0.08) with soft radial gradient mask so section content,
 *   cards, and code blocks display cleanly and readably on top.
 * - Reactive to active section changes: re-triggers an elegant trace animation.
 * - Automatically respects prefers-reduced-motion.
 */
export default function SectionWatermark({ activeSection: customActive }) {
  const [mounted, setMounted] = useState(false);
  const detectedActive = useActiveSection(defaultIds);
  const active = customActive || detectedActive || 'home';
  const isHome = active === 'home';

  useEffect(() => {
    setMounted(true);
  }, []);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !mounted) return null;

  const accent = 'rgb(var(--accent))';
  const accentSoft = 'rgb(var(--accent) / 0.35)';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!isHome && (
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
            transition={{
              duration: 0.75,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex items-center justify-center"
          >
            {/* Subtle radial ambient bloom behind the watermark */}
            <div
              className="absolute h-[380px] w-[380px] rounded-full blur-[90px] pointer-events-none opacity-20"
              style={{
                background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
              }}
            />

            {/* Large cinematic SVG Monogram Watermark */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 140 100"
              className="h-[32vh] max-h-[380px] min-h-[220px] w-auto opacity-[0.045] dark:opacity-[0.06] select-none"
              fill="none"
              style={{
                maskImage:
                  'radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 80% 80% at 50% 50%, #000 40%, transparent 100%)',
              }}
            >
              <defs>
                <filter id="watermark-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Bracket { */}
              <motion.path
                d="M 18 16 
                   C 18 10, 24 8, 30 8 
                   L 32 8
                   M 18 16
                   L 18 42
                   C 18 48, 12 50, 8 50
                   C 12 50, 18 52, 18 58
                   L 18 84
                   C 18 90, 24 92, 30 92
                   L 32 92"
                stroke={accent}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />

              {/* Letter C */}
              <motion.path
                d="M 76 22
                   C 68 12, 46 10, 36 22
                   C 24 36, 24 64, 36 78
                   C 46 90, 68 88, 76 78"
                stroke={accent}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.1, ease: 'easeOut' }}
              />

              {/* Diagonal C-W connector */}
              <motion.path
                d="M 52 38 L 74 84"
                stroke={accent}
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
              />

              {/* Letter W */}
              <motion.path
                d="M 74 84 L 90 48 L 104 84 L 126 30"
                stroke={accent}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.25, ease: 'easeOut' }}
              />

              {/* Network connecting dash lines */}
              <motion.path
                d="M 74 52 L 88 48 L 102 52"
                stroke={accentSoft}
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />

              {/* 3 Glowing nodes */}
              {[
                { cx: 74, cy: 52 },
                { cx: 88, cy: 48 },
                { cx: 102, cy: 52 },
              ].map((node, i) => (
                <g key={`wm-node-${i}`} filter="url(#watermark-glow)">
                  <motion.circle
                    cx={node.cx}
                    cy={node.cy}
                    r={4}
                    fill={accent}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                  />
                  <circle cx={node.cx} cy={node.cy} r={2} fill="#ffffff" opacity={0.6} />
                </g>
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
