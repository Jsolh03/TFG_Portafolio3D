import React, { useEffect, useState } from 'react';
import { useTheme, THEMES, FONTS, STYLES } from '../../context/ThemeContext';
import { useLanguage, useT } from '../../context/LanguageContext';
import { LANGUAGES } from '../../data/i18n';

const TABS = [
  { id: 'theme',  icon: '🎨' },
  { id: 'style',  icon: '✨' },
  { id: 'font',   icon: '🔤' },
  { id: 'language', icon: '🌐' },
  { id: 'accessibility', icon: '♿' },
  { id: 'about',  icon: 'ℹ️' }
];

export default function SettingsPanel({ open, onClose }) {
  const t = useT();
  const [tab, setTab] = useState('theme');
  const { theme, font, style, setTheme, setFont, setStyle, reset } = useTheme();
  const { lang, setLang } = useLanguage();

  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('reducedMotion') === '1');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === '1');

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion ? '1' : '0';
    localStorage.setItem('reducedMotion', reducedMotion ? '1' : '0');
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.dataset.highContrast = highContrast ? '1' : '0';
    localStorage.setItem('highContrast', highContrast ? '1' : '0');
  }, [highContrast]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`settings-overlay ${open ? 'settings-overlay--show' : ''}`} onClick={onClose}>
      <aside
        className={`settings-panel ${open ? 'settings-panel--show' : ''}`}
        onClick={e => e.stopPropagation()}
        aria-hidden={!open}
      >
        <header className="settings-header">
          <h2 className="settings-title">{t('settings.title')}</h2>
          <button className="settings-close" onClick={onClose} aria-label={t('common.close')}>×</button>
        </header>

        <div className="settings-body">
          <nav className="settings-tabs">
            {TABS.map(tk => (
              <button
                key={tk.id}
                className={`settings-tab ${tab === tk.id ? 'active' : ''}`}
                onClick={() => setTab(tk.id)}
              >
                <span className="settings-tab-icon">{tk.icon}</span>
                <span className="settings-tab-label">{t(`settings.${tk.id}`)}</span>
              </button>
            ))}
          </nav>

          <section className="settings-content">

            {tab === 'theme' && (
              <div className="settings-section">
                <h3 className="settings-section-title">{t('settings.theme')}</h3>
                <div className="settings-themes">
                  {THEMES.map(th => (
                    <button
                      key={th.id}
                      className={`settings-theme-chip ${theme === th.id ? 'active' : ''}`}
                      onClick={() => setTheme(th.id)}
                      style={{
                        background: `linear-gradient(135deg, ${th.swatch[0]} 0%, ${th.swatch[0]} 50%, ${th.swatch[1]} 50%, ${th.swatch[1]} 100%)`
                      }}
                    >
                      <span className="settings-theme-name">{th.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'style' && (
              <div className="settings-section">
                <h3 className="settings-section-title">{t('settings.style')}</h3>
                <div className="settings-styles">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      className={`settings-style-card ${style === s.id ? 'active' : ''}`}
                      onClick={() => setStyle(s.id)}
                    >
                      <span className="settings-style-icon">{s.icon}</span>
                      <span className="settings-style-meta">
                        <span className="settings-style-name">{t(`settings.styles.${s.id}.label`)}</span>
                        <span className="settings-style-hint">{t(`settings.styles.${s.id}.hint`)}</span>
                      </span>
                      {style === s.id && <span className="settings-style-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'font' && (
              <div className="settings-section">
                <h3 className="settings-section-title">{t('settings.font')}</h3>
                <div className="settings-fonts">
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      className={`settings-font ${font === f.id ? 'active' : ''}`}
                      onClick={() => setFont(f.id)}
                      style={{ fontFamily: `"${f.id}", sans-serif` }}
                    >
                      <span>{f.label}</span>
                      <span className="settings-font-sample">Aa Bb 123</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'language' && (
              <div className="settings-section">
                <h3 className="settings-section-title">{t('settings.language')}</h3>
                <div className="settings-languages">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.id}
                      className={`settings-language ${lang === l.id ? 'active' : ''}`}
                      onClick={() => setLang(l.id)}
                    >
                      <span className="settings-language-flag">{l.flag}</span>
                      <div className="settings-language-text">
                        <span className="settings-language-native">{l.label}</span>
                        <span className="settings-language-translated">{l.name[lang]}</span>
                      </div>
                      {lang === l.id && <span className="settings-language-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'accessibility' && (
              <div className="settings-section">
                <h3 className="settings-section-title">{t('settings.accessibility')}</h3>

                <label className="settings-toggle">
                  <input type="checkbox" checked={reducedMotion} onChange={e => setReducedMotion(e.target.checked)} />
                  <span className="settings-toggle-slider"></span>
                  <div className="settings-toggle-text">
                    <span className="settings-toggle-label">{t('settings.reducedMotion')}</span>
                    <span className="settings-toggle-hint">{t('settings.reducedMotionHint')}</span>
                  </div>
                </label>

                <label className="settings-toggle">
                  <input type="checkbox" checked={highContrast} onChange={e => setHighContrast(e.target.checked)} />
                  <span className="settings-toggle-slider"></span>
                  <div className="settings-toggle-text">
                    <span className="settings-toggle-label">{t('settings.highContrast')}</span>
                    <span className="settings-toggle-hint">{t('settings.highContrastHint')}</span>
                  </div>
                </label>

                <button
                  className="settings-reset"
                  onClick={() => {
                    reset();
                    setReducedMotion(false);
                    setHighContrast(false);
                  }}
                >
                  {t('settings.reset')}
                </button>
              </div>
            )}

            {tab === 'about' && (
              <div className="settings-section">
                <h3 className="settings-section-title">{t('settings.about')}</h3>
                <div className="settings-about">
                  <div className="settings-about-row">
                    <span>{t('settings.project')}</span>
                    <strong>KyL Portfolio</strong>
                  </div>
                  <div className="settings-about-row">
                    <span>{t('settings.versionLabel')}</span>
                    <strong>2.0.0</strong>
                  </div>
                  <div className="settings-about-row">
                    <span>{t('settings.authors')}</span>
                    <strong>Khaled Solh · Laura Jara</strong>
                  </div>
                  <div className="settings-about-row">
                    <span>{t('settings.stack')}</span>
                    <strong>React · Spline · MongoDB</strong>
                  </div>
                </div>
              </div>
            )}

          </section>
        </div>
      </aside>
    </div>
  );
}
