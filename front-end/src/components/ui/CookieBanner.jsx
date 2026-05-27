import React, { useEffect, useState } from 'react';
import { useT } from '../../context/LanguageContext';

const STORAGE_KEY = 'tfg_cookie_consent_v1';

/* CookieBanner — LSSI-CE art. 22.2.
   La app solo usa localStorage para datos estrictamente necesarios (JWT,
   preferencias UI). No hay cookies de seguimiento ni de terceros, así que
   el banner es meramente INFORMATIVO: aceptar/cerrar lo oculta y no se
   vuelve a mostrar. NO se bloquea el uso de la app antes de aceptar
   porque el almacenamiento que usamos es necesario para el funcionamiento. */
export default function CookieBanner() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) setVisible(true);
    } catch {
      // localStorage bloqueado — no mostrar
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch { /* */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite">
      <p>
        🍪 <strong>{t('cookies.title')}</strong> {t('cookies.body')}{' '}
        <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">{t('legal.privacyShort')}</a>.
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="primary" onClick={accept}>
          {t('cookies.accept')}
        </button>
      </div>
    </div>
  );
}
