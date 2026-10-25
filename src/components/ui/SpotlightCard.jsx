import { useRef } from 'react';
import { cn } from '@/lib/utils';

/** Glass card with a cursor-following spotlight. Uses CSS vars (no React re-renders on mouse move). */
export default function SpotlightCard({ className, children, as: Tag = 'div', ...props }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Tag ref={ref} onPointerMove={onMove} className={cn('glass group relative overflow-hidden rounded-2xl', className)} {...props}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(360px circle at var(--mx,50%) var(--my,50%), rgb(var(--accent) / .14), transparent 60%)' }}
      />
      <div className="relative">{children}</div>
    </Tag>
  );
}
