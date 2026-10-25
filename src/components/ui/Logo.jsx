import { useCallback, useId, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Interactive monogram logo component inspired by backend/distributed systems:
 * Combines a code brace `{` with stylized `C` and `W` letters, integrated with
 * 3 illuminated network nodes / circuit nodes.
 *
 * Fully dynamic:
 * - Uses `rgb(var(--accent))` to blend with all portfolio accent themes.
 * - Interactive hover states with pulsing radar wave rings and node illumination.
 * - Micro-draw path animations on section entry / mount.
 *
 * @param {Object}  props
 * @param {number}  [props.size=32]        Width in pixels (proportional height)
 * @param {boolean} [props.animated=true]  Enable micro-animations
 * @param {string}  [props.className='']   Additional CSS classes
 * @param {string}  [props.triggerKey='']  Change key to re-trigger transition animation
 * @param {boolean} [props.showGlow=true]  Whether to render the backdrop neon aura
 */
export default function Logo({
  size = 32,
  animated = true,
  className = '',
  triggerKey = '',
  showGlow = true,
}) {
  const uid = useId().replace(/:/g, '');
  const glowId = `logo-glow-${uid}`;
  const filterId = `logo-bloom-${uid}`;
  const [hovered, setHovered] = useState(false);

  const handleEnter = useCallback(() => setHovered(true), []);
  const handleLeave = useCallback(() => setHovered(false), []);

  const accent = 'rgb(var(--accent))';
  const accentGlow = 'rgb(var(--accent) / 0.65)';
  const accentSoft = 'rgb(var(--accent) / 0.22)';
  const accentBright = 'rgb(var(--accent) / 0.95)';

  // Aspect ratio is 140 : 100
  const width = size;
  const height = Math.round(size * (100 / 140));

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      onMouseEnter={animated ? handleEnter : undefined}
      onMouseLeave={animated ? handleLeave : undefined}
      whileHover={animated ? { scale: 1.05 } : undefined}
      whileTap={animated ? { scale: 0.96 } : undefined}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
    >
      {/* Ambient ambient background glow behind logo on hover */}
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
        viewBox="0 0 140 100"
        width={width}
        height={height}
        fill="none"
        aria-label="Chanuka Weerakkody Monogram"
        className="overflow-visible"
      >
        <defs>
          {/* Intense neon bloom for circuit nodes */}
          <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle line glow for stroke highlights */}
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── 2. Letter 'C' outer sweep ── */}
        <motion.path
          d="M 76 22
             C 68 12, 46 10, 36 22
             C 24 36, 24 64, 36 78
             C 46 90, 68 88, 76 78"
          stroke={accent}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
        />

        {/* ── 3. Stylized inner diagonal connecting C & W ── */}
        <motion.path
          d="M 52 38 L 74 84"
          stroke={accent}
          strokeWidth="4.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
        />

        {/* ── 4. Letter 'W' body & right arm ── */}
        <motion.path
          d="M 74 84 L 90 48 L 104 84 L 126 30"
          stroke={accent}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.85, delay: 0.3, ease: 'easeOut' }}
        />

        {/* ── 5. Horizontal circuit interconnects between nodes ── */}
        <motion.path
          d="M 74 52 L 88 48 L 102 52"
          stroke={accentSoft}
          strokeWidth="2"
          strokeDasharray="3 3"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        />

        {/* ── 6. The 3 Glowing Network / Circuit Nodes ── */}
        {[
          { cx: 74, cy: 52, delay: 0.65 },
          { cx: 88, cy: 48, delay: 0.75 },
          { cx: 102, cy: 52, delay: 0.85 },
        ].map((node, i) => (
          <g key={`node-${i}`} filter={`url(#${glowId})`}>
            {/* Core glowing dot */}
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={hovered ? 4.5 : 3.8}
              fill={accentBright}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: node.delay,
                duration: 0.3,
                type: 'spring',
                stiffness: 350,
              }}
            />

            {/* Radiant white-hot center for cinematic neon depth */}
            <circle
              cx={node.cx}
              cy={node.cy}
              r={hovered ? 2.2 : 1.6}
              fill="#ffffff"
              opacity={0.9}
            />

            {/* Micro-pulsing ripple wave on hover or active */}
            {animated && (
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r={3.8}
                fill="none"
                stroke={accentGlow}
                strokeWidth={1.5}
                animate={
                  hovered
                    ? {
                        r: [3.8, 12, 16],
                        opacity: [0.9, 0.4, 0],
                      }
                    : {
                        r: [3.8, 8, 3.8],
                        opacity: [0.4, 0.1, 0.4],
                      }
                }
                transition={{
                  duration: hovered ? 1.2 : 2.4,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: i * 0.25,
                }}
              />
            )}
          </g>
        ))}
      </motion.svg>
    </motion.div>
  );
}
