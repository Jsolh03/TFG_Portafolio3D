import React, { useEffect, useState } from 'react';
import { useT } from '../../context/LanguageContext';

const CONTACT_EMAIL = 'khaledsolhelhajji@gmail.com';
const MAILTO_URL = `mailto:${CONTACT_EMAIL}?subject=Contacto%20desde%20K-ROOM`;
const GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=Contacto%20desde%20K-ROOM`;

/* ContactPanel — modal con información de los desarrolladores, formas de
   contacto directo y aviso de copyright/licencia. Se abre desde el botón
   flotante en el topbar de la Landing.

   El botón principal de contacto:
   1) intenta abrir el cliente de mail nativo (mailto:),
   2) deja al usuario un botón explícito para abrir Gmail en el navegador,
   3) ofrece copiar el email al portapapeles como tercer fallback.
   Antes solo había un <a href="mailto:"> que en navegadores sin cliente de
   correo configurado no hacía nada visible y daba la impresión de "no funciona". */
export default function ContactPanel({ open, onClose }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCopied(false);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copyEmail = async () => {
    try {
      await navigator.clipboard?.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard bloqueado */ }
  };

  const openMailto = () => {
    // window.open con _self evita popup blockers y respeta el handler nativo
    window.location.href = MAILTO_URL;
  };

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
              <a href={`mailto:${CONTACT_EMAIL}`} className="contact-link">{CONTACT_EMAIL}</a>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" onClick={openMailto} className="contact-cta">
              ✉ {t('contact.emailMe')}
            </button>
            <a
              href={GMAIL_COMPOSE}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-cta"
              style={{
                background: 'transparent',
                border: '1px solid var(--glass-border, rgba(255,255,255,0.18))',
                color: 'var(--text-color)'
              }}
            >
              🌐 Gmail (web)
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="contact-cta"
              style={{
                background: 'transparent',
                border: '1px solid var(--glass-border, rgba(255,255,255,0.18))',
                color: 'var(--text-color)'
              }}
            >
              {copied ? `✓ ${CONTACT_EMAIL}` : `📋 ${CONTACT_EMAIL}`}
            </button>
          </div>
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
