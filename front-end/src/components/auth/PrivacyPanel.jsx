import React, { useState } from 'react';
import { API_BASE } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../context/LanguageContext';

/* PrivacyPanel — el usuario logueado activa o desactiva la privacidad de
   su habitación. Khaled y Laura no pueden usarlo (perfiles dev públicos).
   El token solo se ve UNA vez al generarlo; si se pierde, hay que regenerar. */
export default function PrivacyPanel({ onClose, onStateChange }) {
  const t = useT();
  const { user, token, isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revealedToken, setRevealedToken] = useState(null);
  const [hasToken, setHasToken] = useState(!!user?.hasAccessToken);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const notifyChange = (next) => {
    if (typeof onStateChange === 'function') onStateChange(next);
  };

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
      if (action === 'generate') {
        setRevealedToken(data.accessToken);
        setHasToken(true);
        notifyChange(true);
      } else {
        setRevealedToken(null);
        setHasToken(false);
        setConfirmRemove(false);
        notifyChange(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

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
          <p className="privacy-explain">{t('privacy.explain')}</p>

          <div className="privacy-status">
            <span className={`privacy-dot ${hasToken ? 'private' : 'public'}`} />
            <span>{hasToken ? t('privacy.statusPrivate') : t('privacy.statusPublic')}</span>
          </div>

          {revealedToken && (
            <div className="privacy-token-reveal">
              <p className="privacy-token-warning">{t('privacy.revealWarning')}</p>
              <div className="privacy-token-box">{revealedToken}</div>
              <div className="privacy-token-actions">
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(revealedToken)}
                  className="auth-btn auth-btn--ghost"
                >
                  {t('privacy.copyToken')}
                </button>
                <button
                  type="button"
                  onClick={() => setRevealedToken(null)}
                  className="auth-btn auth-btn--primary"
                >
                  {t('privacy.savedClose')}
                </button>
              </div>
            </div>
          )}

          {!revealedToken && (
            <div className="privacy-actions">
              {!hasToken ? (
                <button
                  type="button"
                  onClick={() => callApi('generate')}
                  disabled={busy}
                  className="auth-btn auth-btn--primary"
                >
                  {busy ? '…' : t('privacy.generateBtn')}
                </button>
              ) : confirmRemove ? (
                <>
                  <p className="privacy-confirm-text">{t('privacy.removeConfirm')}</p>
                  <button type="button" onClick={() => setConfirmRemove(false)} className="auth-btn auth-btn--ghost" disabled={busy}>
                    {t('common.cancel')}
                  </button>
                  <button type="button" onClick={() => callApi('remove')} className="auth-btn auth-btn--primary" disabled={busy}>
                    {busy ? '…' : t('privacy.removeConfirmBtn')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => callApi('generate')}
                    disabled={busy}
                    className="auth-btn auth-btn--ghost"
                  >
                    {busy ? '…' : t('privacy.regenerateBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(true)}
                    disabled={busy}
                    className="auth-btn auth-btn--primary"
                  >
                    {t('privacy.removeBtn')}
                  </button>
                </>
              )}
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
        </>
      )}
    </div>
  );
}
