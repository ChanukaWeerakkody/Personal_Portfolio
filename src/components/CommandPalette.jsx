import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  Download,
  Github,
  Linkedin,
  Mail,
  Moon,
  Palette,
  Search,
  Sun,
} from 'lucide-react';

import { navItems, profile } from '@/data/profile';
import { ACCENTS, useTheme } from '@/lib/theme';
import { useApp } from '@/lib/app';
import { cn, scrollToId } from '@/lib/utils';

export default function CommandPalette({ isOpen: propIsOpen, onClose: propOnClose } = {}) {
  const {
    paletteOpen: appPaletteOpen = false,
    setPaletteOpen: appSetPaletteOpen,
    setChatOpen = () => {},
    toast = () => {},
  } = useApp();

  const isControlled = propIsOpen !== undefined;
  const open = isControlled ? propIsOpen : appPaletteOpen;
  const setOpen = useCallback(
    (nextVal) => {
      const nextOpen = typeof nextVal === 'function' ? nextVal(open) : nextVal;
      if (!nextOpen && propOnClose) {
        propOnClose();
      }
      appSetPaletteOpen?.(nextOpen);
    },
    [open, propOnClose, appSetPaletteOpen],
  );

  const { theme = 'dark', toggle = () => {}, setAccent = () => {} } = useTheme();

  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const paletteRef = useRef(null);

  /**
   * Command definitions
   */
  const commands = useMemo(
    () => [
      // Navigation
      ...navItems.map((n) => ({
        id: `go-${n.id}`,
        group: 'Navigate',
        label: `Go to ${n.label}`,
        icon: Search,
        run: () => scrollToId(n.id),
      })),

      // Actions
      {
        id: 'chat',
        group: 'Actions',
        label: 'Ask the AI assistant',
        icon: Bot,
        run: () => setChatOpen(true),
      },

      {
        id: 'theme',
        group: 'Actions',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`,
        icon: theme === 'dark' ? Sun : Moon,
        run: toggle,
      },

      {
        id: 'copy',
        group: 'Actions',
        label: 'Copy email address',
        icon: Mail,
        run: () =>
          navigator.clipboard
            ?.writeText(profile.email)
            .then(
              () => toast('Email copied'),
              () => toast('Copy failed', 'error'),
            ),
      },

      {
        id: 'cv',
        group: 'Actions',
        label: 'Download CV',
        icon: Download,
        run: () => {
          const a = document.createElement('a');
          a.href = profile.cv;
          a.download = '';
          a.click();
        },
      },

      // Accent colours
      ...ACCENTS.map((a) => ({
        id: `acc-${a.name}`,
        group: 'Accent colour',
        label: `${a.name} accent`,
        icon: Palette,
        run: () => setAccent(a.rgb),
      })),

      // External links
      {
        id: 'gh',
        group: 'Links',
        label: 'Open GitHub',
        icon: Github,
        run: () => window.open(profile.githubUrl, '_blank', 'noopener'),
      },

      {
        id: 'li',
        group: 'Links',
        label: 'Open LinkedIn',
        icon: Linkedin,
        run: () => window.open(profile.linkedin, '_blank', 'noopener'),
      },
    ],
    [theme, toggle, setAccent, setChatOpen, toast],
  );

  /**
   * Filter commands based on search query
   */
  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) {
      return commands;
    }

    return commands.filter((command) =>
      `${command.label} ${command.group}`.toLowerCase().includes(search),
    );
  }, [q, commands]);

  /**
   * Global keyboard shortcuts
   *
   * Cmd/Ctrl + K -> Open / close command palette
   * Escape -> Close command palette
   */
  useEffect(() => {
    const onKey = (e) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [setOpen]);

  /**
   * Dismiss command palette when an outside-click or pointer event occurs
   * outside the command palette container boundaries.
   * Cleans up event listeners on unmount or when closed to prevent memory leaks.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleOutsideClick = (event) => {
      if (
        paletteRef.current &&
        event.target &&
        !paletteRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open, setOpen]);

  /**
   * Reset search and focus input whenever palette opens.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setQ('');
    setIdx(0);

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  /**
   * Reset selected command whenever search changes.
   */
  useEffect(() => {
    setIdx(0);
  }, [q]);

  /**
   * Keep selected command visible while navigating
   * with ArrowUp / ArrowDown.
   */
  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({
        block: 'nearest',
      });
  }, [idx]);

  /**
   * Prevent the underlying page from scrolling while
   * the command palette is open.
   *
   * Also compensates for the browser scrollbar width
   * to prevent layout shifting when overflow is disabled.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const body = document.body;

    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
    };
  }, [open]);

  /**
   * Execute selected command.
   */
  const run = (command) => {
    setOpen(false);

    window.setTimeout(() => {
      command.run();
    }, 120);
  };

  /**
   * Keyboard navigation inside palette.
   */
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();

      setIdx((current) =>
        Math.min(current + 1, Math.max(filtered.length - 1, 0)),
      );

      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();

      setIdx((current) => Math.max(current - 1, 0));

      return;
    }

    if (e.key === 'Enter' && filtered[idx]) {
      e.preventDefault();
      run(filtered[idx]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 px-4 pt-[15vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            ref={paletteRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              y: -12,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
            }}
            className="glass w-full max-w-lg overflow-hidden rounded-2xl bg-background/90 shadow-2xl"
          >
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-line/10 px-4">
              <Search
                size={16}
                className="shrink-0 text-muted"
              />

              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-list"
                aria-activedescendant={
                  filtered[idx]
                    ? `cmd-${filtered[idx].id}`
                    : undefined
                }
                placeholder="Type a command or search…"
                className="w-full bg-transparent py-4 text-base outline-none placeholder:text-muted sm:text-sm"
              />

              <kbd className="hidden shrink-0 rounded border border-line/10 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
                ESC
              </kbd>
            </div>

            {/* Commands */}
            <ul
              id="cmd-list"
              ref={listRef}
              role="listbox"
              className="scroll-thin max-h-[50vh] overflow-y-auto overscroll-contain p-2"
            >
              {filtered.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">
                  No results
                </li>
              )}

              {filtered.map((command, i) => {
                const showGroup =
                  i === 0 ||
                  filtered[i - 1].group !== command.group;

                const Icon = command.icon;
                const selected = i === idx;

                return (
                  <li
                    key={command.id}
                    role="presentation"
                  >
                    {showGroup && (
                      <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-muted">
                        {command.group}
                      </p>
                    )}

                    <button
                      id={`cmd-${command.id}`}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onMouseMove={() => setIdx(i)}
                      onClick={() => run(command)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                        selected
                          ? 'bg-accent/15 text-foreground'
                          : 'text-muted',
                      )}
                    >
                      <Icon
                        size={15}
                        className={selected ? 'text-accent' : ''}
                      />

                      <span>{command.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}