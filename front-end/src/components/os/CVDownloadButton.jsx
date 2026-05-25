import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../../context/LanguageContext';
import { generateCVPdf } from '../../utils/cvPdf';
import { TEMPLATES } from '../../utils/cvPdfTemplates';

/**
 * Descarga el CV como PDF limpio (sin cabecera/pie del navegador),
 * con selector de plantilla (clasico / azul / cyber).
 *
 * - Standalone (URL ya es /cv/:id) -> genera el PDF directamente sobre el CV visible.
 * - Cualquier otro contexto -> abre /cv/:id?download=1&template=<id>
 *   en pestana aparte; esa pestana detecta los flags y dispara la descarga.
 */
export default function CVDownloadButton({ userId, userName }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickAway = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClickAway);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickAway);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const triggerDownload = async (templateId) => {
    setOpen(false);
    if (busy) return;

    const isStandalone = window.location.pathname.startsWith('/cv/');
    const safeName = (userName || userId || 'portfolio').replace(/\s+/g, '_');
    const id = encodeURIComponent(userId || 'guest');

    if (isStandalone) {
      setBusy(true);
      try {
        await generateCVPdf({ filename: `CV_${safeName}.pdf`, templateId });
      } catch (err) {
        console.error('Error generando PDF:', err);
        alert(t('cv.downloadPdf'));
      } finally {
        setBusy(false);
      }
      return;
    }

    const url = `/cv/${id}?download=1&template=${encodeURIComponent(templateId)}`;
    const win = window.open(url, '_blank', 'noopener');
    if (!win) {
      alert(t('cv.downloadPdf') + ' - pop-ups bloqueados. Permitelos para descargar el PDF.');
    }
  };

  return (
    <div className="cv-download-wrap" ref={wrapRef}>
      <button
        className="cv-download-btn"
        type="button"
        onClick={() => setOpen(o => !o)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('cv.downloadPdf')}
        title={t('cv.downloadPdf')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>{busy ? '...' : t('cv.downloadPdf')}</span>
        <span className="cv-download-chevron" aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="cv-template-menu" role="menu">
          <div className="cv-template-menu-label">{t('cv.template.label')}</div>
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              type="button"
              role="menuitem"
              className="cv-template-option"
              onClick={() => triggerDownload(tpl.id)}
            >
              <span
                className="cv-template-swatch"
                style={{
                  background: `linear-gradient(135deg, ${tpl.swatch} 0%, ${tpl.swatch} 55%, ${tpl.swatchAccent} 55%, ${tpl.swatchAccent} 100%)`
                }}
                aria-hidden="true"
              />
              <span className="cv-template-meta">
                <span className="cv-template-name">{t(`cv.template.${tpl.id}`)}</span>
                <span className="cv-template-hint">{t(`cv.template.${tpl.id}Hint`)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
