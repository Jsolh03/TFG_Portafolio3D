import React, { useEffect, useState } from 'react';
import { useT } from '../../context/LanguageContext';

export default function GalleryApp({ fullData }) {
  const t = useT();
  const [selected, setSelected] = useState(null);
  const projects = fullData?.projects || [];

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  if (projects.length === 0) {
    return (
      <div className="gallery-app">
        <div className="gallery-empty">
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🖼️</div>
          <div>{t('gallery.empty')}</div>
          <div style={{ marginTop: 8, fontSize: '0.78rem' }}>{t('gallery.emptyHint')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-app">
      <div className="gallery-header">
        <h2>{t('gallery.title')}</h2>
      </div>

      <div className="gallery-grid">
        {projects.map((p, i) => (
          <div key={i} className="gallery-card" onClick={() => setSelected(p)}>
            <div className="gallery-card-image">
              {p.image ? <img src={p.image} alt={p.title} /> : '🖼️'}
            </div>
            <div className="gallery-card-body">
              <h3 className="gallery-card-title">{p.title || t('gallery.untitled')}</h3>
              {p.description && <p className="gallery-card-desc">{p.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="gallery-lightbox" onClick={() => setSelected(null)}>
          <button className="gallery-lightbox-close" onClick={() => setSelected(null)}>×</button>
          <div className="gallery-lightbox-content" onClick={e => e.stopPropagation()}>
            {selected.image && <img src={selected.image} alt={selected.title} />}
            <div className="gallery-lightbox-body">
              <h3>{selected.title}</h3>
              {selected.description && <p>{selected.description}</p>}
              {selected.url && <a href={selected.url} target="_blank" rel="noreferrer">{t('gallery.viewProject')}</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
