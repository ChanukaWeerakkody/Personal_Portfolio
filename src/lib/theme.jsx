import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { safeStorage } from '@/lib/utils';

export const ACCENTS = [
  { name: 'Indigo', rgb: '99 102 241' },
  { name: 'Emerald', rgb: '52 211 153' },
  { name: 'Violet', rgb: '167 139 250' },
  { name: 'Rose', rgb: '251 113 133' },
  { name: 'Amber', rgb: '251 191 36' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => safeStorage.get('pf-theme', document.documentElement.dataset.theme || 'dark'));
  const [accent, setAccentState] = useState(() => safeStorage.get('pf-accent', ACCENTS[0].rgb));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#07080c' : '#f7f8fb');
  }, [theme]);

  useEffect(() => { document.documentElement.style.setProperty('--accent', accent); }, [accent]);

  const setTheme = useCallback((t) => { setThemeState(t); safeStorage.set('pf-theme', t); }, []);
  const setAccent = useCallback((a) => { setAccentState(a); safeStorage.set('pf-accent', a); }, []);
  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  const value = useMemo(() => ({ theme, accent, setTheme, setAccent, toggle }), [theme, accent, setTheme, setAccent, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
