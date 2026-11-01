import { useCallback, useId, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * "CW." monogram logo with "Chanuka" subtext.
 *
 * Layout: a solid disc with a knocked-out "C", and a "W" that straddles the
 * disc edge (knocked out where it overlaps the disc, solid where it sits
 * outside), followed by a round full-stop dot and a small subtext line.
 *
 * Fully dynamic:
 * - Uses `rgb(var(--accent))` so it adapts to every theme (light / dark).
 * - Hover: spring scale, ambient aura, ripple ring around the dot.
 * - Entry animation: disc, letters, dot and subtext fade / scale in.
 *
 * @param {Object}  props
 * @param {number}  [props.size=32]        Width in pixels (proportional height)
 * @param {boolean} [props.animated=true]  Enable micro-animations
 * @param {string}  [props.className='']   Additional CSS classes
 * @param {string}  [props.triggerKey='']  Change key to re-trigger entry animation
 * @param {boolean} [props.showGlow=true]  Whether to render the backdrop aura
 */

// Geometry (shared coordinate space, see viewBox below)
const DISC = { cx: 385, cy: 431, r: 254 };
const DOT = { cx: 970, cy: 505, r: 48 };

// "C": thick arc, open to the right
const C_PATH = 'M 455.9 382.7 A 86 86 0 1 0 455.9 493.3';
const C_STROKE = 66;

// "W": single polygon, straddles the disc edge
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

export default function Logo({
  size = 32,
  animated = true,
  className = '',
  triggerKey = '',
  showGlow = true,
}) {
  const uid = useId().replace(/:/g, '');
  const discMaskId = `logo-disc-mask-${uid}`;
  const wMaskId = `logo-w-mask-${uid}`;
  const [hovered, setHovered] = useState(false);

  const handleEnter = useCallback(() => setHovered(true), []);
  const handleLeave = useCallback(() => setHovered(false), []);

  const accent = 'rgb(var(--accent))';
  const accentGlow = 'rgb(var(--accent) / 0.65)';
  const accentSub = 'rgb(var(--accent) / 0.8)';

  // viewBox is 960 x 600
  const width = size;
  const height = Math.round(size * (600 / 960));

  const maskBounds = { x: 100, y: 150, width: 960, height: 600 };

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      onMouseEnter={animated ? handleEnter : undefined}
      onMouseLeave={animated ? handleLeave : undefined}
      whileHover={animated ? { scale: 1.05 } : undefined}
      whileTap={animated ? { scale: 0.96 } : undefined}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
    >
      {/* Ambient background glow behind logo on hover */}
      {showGlow && (
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-md"
          animate={{
            opacity: hovered ? 0.45 : 0.15,
            scale: hovered ? 1.4 : 1,
          }}
          style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
          transition={{ duration: 0.3 }}
        />
      )}

      <motion.svg
        key={triggerKey}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="100 150 960 600"
        width={width}
        height={height}
        fill="none"
        aria-label="Chanuka Weerakkody Monogram"
        className="overflow-visible"
      >
        <defs>
          {/* Disc with the "C" and the overlapping part of the "W" knocked out */}
          <mask id={discMaskId} maskUnits="userSpaceOnUse" {...maskBounds}>
            <rect {...maskBounds} fill="#fff" />
            <path
              d={C_PATH}
              stroke="#000"
              strokeWidth={C_STROKE}
              strokeLinecap="butt"
              fill="none"
            />
            <polygon points={W_POINTS} fill="#000" />
          </mask>

          {/* "W" only where it sits outside the disc */}
          <mask id={wMaskId} maskUnits="userSpaceOnUse" {...maskBounds}>
            <rect {...maskBounds} fill="#fff" />
            <circle cx={DISC.cx} cy={DISC.cy} r={DISC.r} fill="#000" />
          </mask>
        </defs>

        {/* ── Disc with knocked-out "C" ── */}
        <motion.circle
          cx={DISC.cx}
          cy={DISC.cy}
          r={DISC.r}
          fill={accent}
          mask={`url(#${discMaskId})`}
          style={{ transformOrigin: `${DISC.cx}px ${DISC.cy}px` }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* ── "W" outside the disc ── */}
        <motion.polygon
          points={W_POINTS}
          fill={accent}
          mask={`url(#${wMaskId})`}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
        />

        {/* ── Full-stop dot ── */}
        <motion.circle
          cx={DOT.cx}
          cy={DOT.cy}
          r={DOT.r}
          fill={accent}
          style={{ transformOrigin: `${DOT.cx}px ${DOT.cy}px` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: hovered ? 1.12 : 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, delay: hovered ? 0 : 0.55 }}
        />

        {/* Ripple ring around the dot */}
        {animated && (
          <motion.circle
            cx={DOT.cx}
            cy={DOT.cy}
            r={DOT.r}
            fill="none"
            stroke={accentGlow}
            strokeWidth={8}
            animate={
              hovered
                ? { r: [DOT.r, DOT.r + 70, DOT.r + 100], opacity: [0.9, 0.4, 0] }
                : { r: [DOT.r, DOT.r + 30, DOT.r], opacity: [0.35, 0.08, 0.35] }
            }
            transition={{
              duration: hovered ? 1.2 : 2.6,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}

        {/* ── Subtext ── */}
        <motion.text
          x={1015}
          y={705}
          textAnchor="end"
          fill={accentSub}
          fontSize={56}
          fontWeight={600}
          letterSpacing={6}
          style={{ fontFamily: 'inherit' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          Chanuka
        </motion.text>
      </motion.svg>
    </motion.div>
  );
}