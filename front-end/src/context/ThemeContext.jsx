import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export const THEMES = [
  { id: 'dark',     label: 'Grafito',   swatch: ['#0e0f14', '#8b5cf6'] },
  { id: 'midnight', label: 'Midnight',  swatch: ['#0a0f1e', '#22d3ee'] },
  { id: 'royal',    label: 'Royal',     swatch: ['#1a0f2e', '#d946ef'] },
  { id: 'emerald',  label: 'Emerald',   swatch: ['#0d1410', '#10b981'] },
  { id: 'khaled',   label: 'Khaled',    swatch: ['#1a2a1f', '#a3e635'] },
  { id: 'crimson',  label: 'Crimson',   swatch: ['#150a0a', '#ef4444'] },
  { id: 'mono',     label: 'Mono',      swatch: ['#1a1a1a', '#e5e5e5'] },
  { id: 'light',    label: 'Slate',     swatch: ['#f1f3f6', '#4338ca'] }
];

export const FONTS = [
  { id: 'Inter',              label: 'Inter' },
  { id: 'Roboto',             label: 'Roboto' },
  { id: 'Open Sans',          label: 'Open Sans' },
  { id: 'Lato',               label: 'Lato' },
  { id: 'JetBrains Mono',     label: 'JetBrains Mono' },
  { id: 'Space Grotesk',      label: 'Space Grotesk' },
  { id: 'Manrope',            label: 'Manrope' },
  { id: 'Orbitron',           label: 'Orbitron' },
  { id: 'Press Start 2P',     label: 'Press Start 2P' },
  { id: 'Cormorant Garamond', label: 'Cormorant Garamond' }
];

export const STYLES = [
  { id: 'current',    label: 'Actual',      icon: '🎨', hint: 'Equilibrio: gradientes, neón y profundidad.' },
  { id: 'minimal',    label: 'Minimalista', icon: '◻',  hint: 'Flat, mucho aire, sin gradientes ni glow.' },
  { id: 'futuristic', label: 'Futurista',   icon: '✦',  hint: 'Cyber máximo: glow, bordes neón, holográfico.' }
];

const DEFAULT_THEME = 'dark';
const DEFAULT_FONT = 'Inter';
const DEFAULT_STYLE = 'current';

const STYLE_LOAD_MS = 1200;
const HEAVY_STYLES = new Set(['futuristic']);

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  font: DEFAULT_FONT,
  style: DEFAULT_STYLE,
  styleLoading: false,
  setTheme: () => {},
  setFont: () => {},
  setStyle: () => {},
  reset: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    return THEMES.find(t => t.id === saved) ? saved : DEFAULT_THEME;
  });

  const [font, setFontState] = useState(() => {
    const saved = localStorage.getItem('font');
    return FONTS.find(f => f.id === saved) ? saved : DEFAULT_FONT;
  });

  const [style, setStyleState] = useState(() => {
    const saved = localStorage.getItem('style');
    return STYLES.find(s => s.id === saved) ? saved : DEFAULT_STYLE;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', `"${font}"`);
    localStorage.setItem('font', font);
  }, [font]);

  useEffect(() => {
    document.documentElement.dataset.style = style;
    localStorage.setItem('style', style);
  }, [style]);

  const [styleLoading, setStyleLoading] = useState(false);
  const loaderTimerRef = useRef(null);

  const setStyle = useCallback((next) => {
    setStyleState(prev => {
      if (prev === next) return prev;
      const heavy = HEAVY_STYLES.has(next) || HEAVY_STYLES.has(prev);
      if (heavy) {
        setStyleLoading(true);
        if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = setTimeout(() => setStyleLoading(false), STYLE_LOAD_MS);
      }
      return next;
    });
  }, []);

  useEffect(() => () => {
    if (loaderTimerRef.current) clearTimeout(loaderTimerRef.current);
  }, []);

  const value = {
    theme,
    font,
    style,
    styleLoading,
    setTheme: setThemeState,
    setFont: setFontState,
    setStyle,
    reset: () => {
      setThemeState(DEFAULT_THEME);
      setFontState(DEFAULT_FONT);
      setStyleState(DEFAULT_STYLE);
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {styleLoading && <StyleLoader target={style} />}
    </ThemeContext.Provider>
  );
}

function StyleLoader({ target }) {
  const label = target === 'futuristic' ? 'Cargando interfaz futurista' : 'Cambiando estilo';
  return (
    <div className="style-loader" role="status" aria-live="polite">
      <div className="style-loader-spinner" />
      <div className="style-loader-text">{label}</div>
      <div className="style-loader-sub">compilando shaders visuales</div>
    </div>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
