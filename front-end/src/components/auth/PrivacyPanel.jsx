import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../context/LanguageContext';

/* PrivacyPanel — el usuario logueado activa o desactiva la privacidad de
   su habitación. La clave que protege la habitación privada es la MISMA
   `cvAccessToken` que ya protege el CV — el usuario gestiona una sola clave
   para ambos accesos. Khaled y Laura no pueden usarlo (perfiles dev públicos). */
export default function PrivacyPanel({ onClose, onStateChange }) {
  const t = useT();
  const { user, token, isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sharedKey, setSharedKey] = useState('');
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPrivate, setIsPrivate] = useState(!!user?.hasAccessToken);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const notifyChange = (next) => {
    if (typeof onStateChange === 'function') onStateChange(next);
  };

  // Carga la clave del CV (es la misma que desbloquea la habitación) para
  // poder mostrársela al dueño sin pedirle navegar a otra pestaña.
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    fetch(`${API_BASE}/api/users/me/cv-access-token`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setSharedKey(d?.cvAccessToken || ''))
      .catch(() => { /* silencioso — el usuario igual puede activar/desactivar */ });
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="privacy-panel">
        <p>{t('privacy.requiresAuth')}</p>
      </div>
    );
  }

  const isProtected = ['khaled', 'laura'].includes(user?.id);

  const callApi = async (action) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/users/me/access-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      const nextPrivate = action === 'enable' || action === 'generate';
      setIsPrivate(nextPrivate);
      if (data?.cvAccessToken) setSharedKey(data.cvAccessToken);
      if (nextPrivate) {
        setReveal(true); // mostramos la clave en cuanto se activa privacidad
      } else {
        setReveal(false);
        setConfirmRemove(false);
      }
      notifyChange(nextPrivate);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async () => {
    if (!sharedKey) return;
    try {
      await navigator.clipboard?.writeText(sharedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard bloqueado */ }
  };

  const masked = sharedKey ? '•'.repeat(Math.min(sharedKey.length, 40)) : '';

  return (
    <div className="privacy-panel">
      <header className="privacy-header">
        <h3>{t('privacy.title')}</h3>
        {onClose && (
          <button type="button" onClick={onClose} className="privacy-close" aria-label={t('common.close')}>×</button>
        )}
      </header>

      {isProtected ? (
        <p className="privacy-locked">{t('privacy.devProfileNote')}</p>
      ) : (
        <>
          <p className="privacy-explain">{t('privacy.explainUnified')}</p>

          <div className="privacy-status">
            <span className={`privacy-dot ${isPrivate ? 'private' : 'public'}`} />
            <span>{isPrivate ? t('privacy.statusPrivate') : t('privacy.statusPublic')}</span>
          </div>

          {isPrivate && sharedKey && (
            <div className="privacy-token-reveal">
              <p className="privacy-token-warning">{t('privacy.unifiedKeyNote')}</p>
              <div
                className="privacy-token-box"
                style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
              >
                {reveal ? sharedKey : masked}
              </div>
              <div className="privacy-token-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setReveal(r => !r)}
                  className="auth-btn auth-btn--ghost"
                >
                  {reveal ? t('cvKey.hide') : t('cvKey.reveal')}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="auth-btn auth-btn--ghost"
                  disabled={!sharedKey}
                >
                  {copied ? `✓ ${t('cvKey.copied')}` : `📋 ${t('cvKey.copy')}`}
                </button>
              </div>
            </div>
          )}

          <div className="privacy-actions">
            {!isPrivate ? (
              <button
                type="button"
                onClick={() => callApi('enable')}
                disabled={busy}
                className="auth-btn auth-btn--primary"
              >
                {busy ? '…' : t('privacy.enableBtn')}
              </button>
            ) : confirmRemove ? (
              <>
                <p className="privacy-confirm-text">{t('privacy.disableConfirm')}</p>
                <button type="button" onClick={() => setConfirmRemove(false)} className="auth-btn auth-btn--ghost" disabled={busy}>
                  {t('common.cancel')}
                </button>
                <button type="button" onClick={() => callApi('disable')} className="auth-btn auth-btn--primary" disabled={busy}>
                  {busy ? '…' : t('privacy.disableConfirmBtn')}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                disabled={busy}
                className="auth-btn auth-btn--primary"
              >
                {t('privacy.disableBtn')}
              </button>
            )}
          </div>

          {error && <div className="auth-error">{error}</div>}
        </>
      )}
    </div>
  );
}
