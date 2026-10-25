import { Palette } from 'lucide-react';
import { ACCENTS, useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export default function AccentPicker({ compact = false }) {
  const { accent, setAccent } = useTheme();

  return (
    <div className={cn('flex items-center gap-1.5', compact ? 'gap-1' : 'gap-2')} aria-label="Accent colour">
      {!compact && (
        <span className="mr-1 hidden items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted sm:flex">
          <Palette size={13} /> Accent
        </span>
      )}
      {ACCENTS.map((item) => {
        const selected = accent === item.rgb;
        return (
          <button
            key={item.name}
            type="button"
            title={`${item.name} accent`}
            aria-label={`${item.name} accent`}
            aria-pressed={selected}
            onClick={() => setAccent(item.rgb)}
            className={cn(
              'relative grid h-7 w-7 place-items-center rounded-full border transition-transform hover:scale-110 focus-visible:outline-none',
              selected ? 'border-foreground/60 scale-110' : 'border-line/10',
            )}
          >
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: `rgb(${item.rgb})` }}
            />
            {selected && <span className="absolute inset-0 rounded-full ring-2 ring-accent/30 ring-offset-1 ring-offset-background" />}
          </button>
        );
      })}
    </div>
  );
}
