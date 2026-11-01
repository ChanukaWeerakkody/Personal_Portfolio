import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Command, Menu, Moon, Sun, X, Mic, Settings } from 'lucide-react';
import { navItems } from '@/data/profile';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useTheme } from '@/lib/theme';
import { useApp } from '@/lib/app';
import { cn, scrollToId } from '@/lib/utils';
import AccentPicker from '@/components/ui/AccentPicker';
import Logo from '@/components/ui/Logo';

const ids = navItems.map((n) => n.id);

export default function Navbar({ onVoice, voiceListening }) {
  const active = useActiveSection(ids);
  const { theme, toggle } = useTheme();
  const { setPaletteOpen } = useApp();
  const [open, setOpen] = useState(false);
  const [showAccentPicker, setShowAccentPicker] = useState(false);

  const go = (id) => { setOpen(false); scrollToId(id); };

  const handleOpenPalette = () => {
    setPaletteOpen(true);
  };

  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <nav aria-label="Primary" className="glass flex w-full max-w-4xl items-center justify-between rounded-full py-2 pl-5 pr-2 shadow-lg shadow-black/10">
        <button
          onClick={() => go('home')}
          className="group flex items-center rounded-full p-1 transition-transform hover:scale-105"
          aria-label="Back to top"
        >
          <motion.div
            key={active === 'home' ? 'home-logo' : `nav-logo-${active}`}
            initial={{ opacity: 0.75, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-center"
          >
            <Logo size={32} triggerKey={active} />
          </motion.div>
        </button>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {navItems.filter((n) => n.id !== 'home').map((n) => (
            <li key={n.id} className="relative">
              <button
                onClick={() => go(n.id)}
                aria-current={active === n.id ? 'true' : undefined}
                className={cn('relative rounded-full px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-medium transition-colors', active === n.id ? 'text-foreground' : 'text-muted hover:text-foreground')}
              >
                {active === n.id && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-accent/15" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                {n.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          {onVoice && (
            <button onClick={onVoice} aria-label="Voice navigation" aria-pressed={voiceListening}
              className={cn('grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent/10', voiceListening && 'bg-accent/20 text-accent')}>
              <Mic size={16} className={voiceListening ? 'animate-pulse' : ''} />
            </button>
          )}

          <button onClick={handleOpenPalette} aria-label="Open command palette (Ctrl K)"
            className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs text-muted transition-colors hover:bg-accent/10 hover:text-foreground sm:flex">
            <Command size={14} /> K
          </button>

          {/* Settings icon හරහා Accent Picker එක toggle කිරීම */}
          <div className="relative hidden sm:block">
            <button 
              onClick={() => setShowAccentPicker((prev) => !prev)} 
              aria-label="Color Theme Settings"
              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent/10"
            >
              <Settings size={16} />
            </button>
            {showAccentPicker && (
              <div className="glass absolute right-0 top-11 z-50 rounded-2xl border border-line/10 p-2 shadow-xl">
                <AccentPicker compact />
              </div>
            )}
          </div>

          <button onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent/10">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent/10 lg:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }}
            className="glass absolute top-16 w-[calc(100%-1.5rem)] max-w-md rounded-3xl p-3 shadow-2xl lg:hidden"
          >
            {navItems.map((n) => (
              <button key={n.id} onClick={() => go(n.id)}
                className={cn('flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm', active === n.id ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:text-foreground')}>
                {n.label}<span className="font-mono text-[10px] opacity-50">#{n.id}</span>
              </button>
            ))}
            <div className="mt-2 border-t border-line/10 px-3 pt-2">
              <p className="pb-1 text-[11px] font-mono uppercase tracking-wider text-muted">Theme Accent</p>
              <AccentPicker compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}