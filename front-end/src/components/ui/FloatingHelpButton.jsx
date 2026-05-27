import React, { useState } from 'react';
import UserManual from './UserManual';
import { useT } from '../../context/LanguageContext';

/* FloatingHelpButton — botón flotante (esquina inferior derecha, justo encima
   del de ajustes) que abre el manual de usuario con TODAS las funciones del
   portfolio. Disponible en cualquier vista donde se monte. */
export default function FloatingHelpButton() {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fhb-trigger"
        onClick={() => setOpen(true)}
        aria-label={t('manual.btnLabel')}
        title={t('manual.btnLabel')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
      <UserManual open={open} onClose={() => setOpen(false)} />
    </>
  );
}
