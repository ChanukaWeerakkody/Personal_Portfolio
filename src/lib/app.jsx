import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

const AppContext = createContext(null);
const ICONS = { success: CheckCircle2, info: Info, error: AlertCircle };

/** App-wide UI state: assistant + palette visibility, and a tiny accessible toast system. */
export function AppProvider({ children }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const toast = useCallback((message, type = 'success') => {
    const id = ++nextId.current;
    setToasts((t) => [...t.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const value = useMemo(
    () => ({ chatOpen, setChatOpen, paletteOpen, setPaletteOpen, toast }),
    [chatOpen, paletteOpen, toast],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-24 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] ?? Info;
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}
                className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-xl">
                <Icon size={15} className={t.type === 'error' ? 'text-red-400' : 'text-accent'} />
                {t.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  return ctx || {};
};
