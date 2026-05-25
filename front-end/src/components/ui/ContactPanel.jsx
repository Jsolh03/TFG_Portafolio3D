import React, { useEffect } from 'react';
import { useT } from '../../context/LanguageContext';

/* ContactPanel — modal con información de los desarrolladores, formas de
   contacto directo y aviso de copyright/licencia. Se abre desde el botón
   flotante en el topbar de la Landing. */
export default function ContactPanel({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const t = useT();
  if (!open) return null;

  return (
    <div className="contact-overlay" onClick={onClose}>
      <div className="contact-panel" onClick={e => e.stopPropagation()}>
        <header className="contact-header">
          <h2 className="contact-title">{t('contact.title')}</h2>
          <button type="button" className="contact-close" onClick={onClose} aria-label={t('common.close')}>×</button>
        </header>

        <section className="contact-section">
          <h3 className="contact-section-title">{t('contact.devsTitle')}</h3>
          <div className="contact-devs">
            <div className="contact-dev">
              <strong>Khaled Solh El Hajji</strong>
              <span className="contact-dev-role">Full-Stack Developer</span>
              <a href="mailto:khaledsolhelhajji@gmail.com" className="contact-link">khaledsolhelhajji@gmail.com</a>
            </div>
            <div className="contact-dev">
              <strong>Laura Jara Loro</strong>
              <span className="contact-dev-role">Back-End Developer</span>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <h3 className="contact-section-title">{t('contact.directTitle')}</h3>
          <p className="contact-direct-text">{t('contact.directText')}</p>
          <a href="mailto:khaledsolhelhajji@gmail.com?subject=Contacto%20desde%20K-ROOM" className="contact-cta">
            ✉ {t('contact.emailMe')}
          </a>
        </section>

        <section className="contact-section contact-section--legal">
          <h3 className="contact-section-title">{t('contact.licenseTitle')}</h3>
          <p className="contact-legal-text">{t('contact.licenseText')}</p>
          <p className="contact-copyright">© 2026 Khaled Solh El Hajji & Laura Jara Loro · {t('contact.allRights')}</p>
        </section>
      </div>
    </div>
  );
}
