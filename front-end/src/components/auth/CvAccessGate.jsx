import React, { useState } from 'react';
import { useT } from '../../context/LanguageContext';
import { API_BASE } from '../../config';

/* CvAccessGate — pantalla de control de acceso a CVs ajenos.
   El CV contiene datos personales (formación, experiencia, contacto). Para
   verlo, un visitante debe aportar la clave del CV compartida por el dueño,
   dejar su email y aceptar el tratamiento de datos. Cada acceso se registra
   en backend (audit log GDPR). El dueño no necesita pasar este gate. */
export default function CvAccessGate({ targetUserId, onUnlock }) {
  const t = useT();
  const [key, setKey] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = key.trim().length >= 10 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && consent;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError('');
    try {
      const params = new URLSearchParams({
        token: key.trim(),
        email: email.trim(),
        consent: 'true'
      });
      const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(targetUserId)}/cv?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.requiresKey) throw new Error(t('cvGate.errorKey'));
        if (data?.requiresEmail) throw new Error(t('cvGate.errorEmail'));
        if (data?.requiresConsent) throw new Error(t('cvGate.errorConsent'));
        throw new Error(data?.error || t('cvGate.errorGeneric'));
      }
      onUnlock(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cv-gate-wrap" style={{
      padding: 24,
      maxWidth: 520,
      margin: '0 auto',
      color: 'var(--text-color)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
      }}>
        <span style={{ fontSize: '2rem' }}>🔐</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('cvGate.title')}</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--muted-color, #999)' }}>
            @{targetUserId}
          </p>
        </div>
      </div>

      <div style={{
        padding: '12px 14px',
        background: 'rgba(245, 158, 11, 0.12)',
        borderLeft: '3px solid #f59e0b',
        borderRadius: 6,
        marginBottom: 18
      }}>
        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5, color: '#fbbf24' }}>
          ⚠️ <strong>{t('cvGate.legalTitle')}</strong>
        </p>
        <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', lineHeight: 1.55, color: 'var(--text-color)' }}>
          {t('cvGate.legalBody')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label">{t('cvGate.keyLabel')}</label>
          <input
            type="text"
            value={key}
            onChange={e => setKey(e.target.value)}
            className="auth-input"
            placeholder={t('cvGate.keyPh')}
            disabled={busy}
            autoComplete="off"
            spellCheck={false}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">{t('cvGate.emailLabel')}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="auth-input"
            placeholder="tu@email.com"
            disabled={busy}
            autoComplete="email"
          />
          <small style={{ color: 'var(--muted-color, #888)', fontSize: '0.75rem' }}>
            {t('cvGate.emailHint')}
          </small>
        </div>

        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '12px 0',
          cursor: 'pointer',
          fontSize: '0.82rem',
          lineHeight: 1.5
        }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            disabled={busy}
            style={{ marginTop: 3 }}
          />
          <span>
            {t('cvGate.consentLabel')}{' '}
            <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">{t('legal.privacyShort')}</a>.
          </span>
        </label>
        <p style={{ margin: '0 0 12px', fontSize: '0.75rem', color: 'var(--muted-color, #888)', lineHeight: 1.5 }}>
          📅 {t('cvGate.retentionNote')}
        </p>

        {error && <div className="auth-error" style={{ marginTop: 10 }}>{error}</div>}

        <div className="auth-actions" style={{ marginTop: 16 }}>
          <button
            type="submit"
            className="auth-btn auth-btn--primary"
            disabled={!canSubmit || busy}
          >
            {busy ? t('cvGate.unlocking') : t('cvGate.unlock')}
          </button>
        </div>
      </form>
    </div>
  );
}
