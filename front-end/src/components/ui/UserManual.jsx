import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '../../context/LanguageContext';

/* UserManual — panel deslizante (estilo settings) que documenta TODAS las
   funciones del portfolio: navegación, zonas, apps, ajustes, mi habitación,
   privacidad/tokens, CV, cuenta. Pensado para el dueño y el visitante.
   Las secciones se leen de i18n (`manual.sections.*`) y se renderizan en
   orden fijo. */
const SECTION_KEYS = [
  'intro',
  'access',
  'navigation',
  'zones',
  'apps',
  'settings',
  'myRoom',
  'privacy',
  'cvKey',
  'cvView',
  'account',
  'help'
];

export default function UserManual({ open, onClose }) {
  const t = useT();
  const [active, setActive] = useState(SECTION_KEYS[0]);
  const [query, setQuery] = useState('');
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Filtrar secciones por texto de búsqueda (case-insensitive, busca en
  // title + body + items).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTION_KEYS;
    return SECTION_KEYS.filter(k => {
      const s = t(`manual.sections.${k}`);
      if (!s || typeof s !== 'object') return false;
      const hay = [
        s.title || '',
        s.body || '',
        ...(Array.isArray(s.items) ? s.items : [])
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query, t]);

  const scrollToSection = (id) => {
    setActive(id);
    const el = bodyRef.current?.querySelector(`[data-manual-section="${id}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className={`manual-overlay ${open ? 'manual-overlay--show' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <aside
        className={`manual-panel ${open ? 'manual-panel--show' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="manual-header">
          <div>
            <h2 className="manual-title">📖 {t('manual.title')}</h2>
            <p className="manual-subtitle">{t('manual.subtitle')}</p>
          </div>
          <button className="manual-close" onClick={onClose} aria-label={t('manual.close')}>×</button>
        </header>

        <div className="manual-search-wrap">
          <input
            type="search"
            className="manual-search"
            placeholder={t('manual.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="manual-body-grid">
          <nav className="manual-toc" aria-label={t('manual.tocTitle')}>
            <h3 className="manual-toc-title">{t('manual.tocTitle')}</h3>
            <ul>
              {filtered.map(k => {
                const s = t(`manual.sections.${k}`);
                return (
                  <li key={k}>
                    <button
                      type="button"
                      className={`manual-toc-link ${active === k ? 'active' : ''}`}
                      onClick={() => scrollToSection(k)}
                    >
                      {s?.title || k}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <section className="manual-content" ref={bodyRef}>
            {filtered.length === 0 && (
              <p className="manual-empty">{t('manual.searchEmpty')}</p>
            )}
            {filtered.map(k => {
              const s = t(`manual.sections.${k}`);
              if (!s || typeof s !== 'object') return null;
              return (
                <article
                  key={k}
                  data-manual-section={k}
                  className="manual-section"
                >
                  <h3 className="manual-section-title">{s.title}</h3>
                  {s.body && <p className="manual-section-body">{s.body}</p>}
                  {Array.isArray(s.items) && s.items.length > 0 && (
                    <ul className="manual-section-list">
                      {s.items.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  )}
                </article>
              );
            })}
          </section>
        </div>
      </aside>
    </div>
  );
}
