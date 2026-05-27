import React, { useEffect, useState } from 'react';
import { useT } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config';

/* CvKeyPanel — el dueño autenticado ve y gestiona su cvAccessToken.
   La clave del CV es OBLIGATORIA para cualquier visitante (GDPR), así
   que no se "activa/desactiva" como el accessToken de habitación: siempre
   existe. Solo se puede ver, copiar o regenerar. También muestra el
   historial de quién ha accedido al CV. */
export default function CvKeyPanel() {
  const t = useT();
  const { token } = useAuth();
  const [keyValue, setKeyValue] = useState('');
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [views, setViews] = useState([]);

  // Carga inicial: pide la clave actual y el historial
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/users/me/cv-access-token`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setKeyValue(d.cvAccessToken || ''))
      .catch(() => setError(t('cvKey.errorGeneric') || 'Error'));

    fetch(`${API_BASE}/api/users/me/cv-views`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setViews(Array.isArray(d.views) ? d.views : []))
      .catch(() => { /* silencioso, no crítico */ });
  }, [token, t]);

  const handleCopy = async () => {
    if (!keyValue) return;
    try {
      await navigator.clipboard?.writeText(keyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard bloqueado */ }
  };

  const handleRegenerate = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/users/me/cv-access-token`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error');
      setKeyValue(data.cvAccessToken);
      setReveal(true);
      setConfirmRegen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const masked = keyValue ? '•'.repeat(Math.min(keyValue.length, 40)) : '';

  return (
    <div className="cv-key-panel">
      <h3 className="settings-section-title">{t('cvKey.title')}</h3>
      <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--muted-color, #999)', marginBottom: 18 }}>
        {t('cvKey.desc')}
      </p>

      <div style={{
        background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        borderRadius: 8,
        padding: 14,
        marginBottom: 16
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted-color, #888)', marginBottom: 6 }}>
          {t('cvKey.currentKey')}
        </div>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 4,
          wordBreak: 'break-all',
          color: reveal ? '#58a6ff' : 'var(--muted-color, #999)',
          marginBottom: 10
        }}>
          {reveal ? keyValue : masked}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setReveal(!reveal)}
            className="auth-btn auth-btn--ghost"
            disabled={!keyValue}
            style={{ fontSize: '0.8rem' }}
          >
            {reveal ? t('cvKey.hide') : t('cvKey.reveal')}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="auth-btn auth-btn--ghost"
            disabled={!keyValue}
            style={{ fontSize: '0.8rem' }}
          >
            {copied ? `✓ ${t('cvKey.copied')}` : `📋 ${t('cvKey.copy')}`}
          </button>
        </div>
      </div>

      {confirmRegen ? (
        <div style={{
          padding: 12,
          background: 'rgba(248, 113, 113, 0.1)',
          borderLeft: '3px solid #f87171',
          borderRadius: 6,
          marginBottom: 12
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#f87171' }}>
            ⚠️ {t('cvKey.regenerateWarn')}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setConfirmRegen(false)}
              className="auth-btn auth-btn--ghost"
              disabled={busy}
              style={{ fontSize: '0.8rem' }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              className="auth-btn auth-btn--primary"
              disabled={busy}
              style={{ fontSize: '0.8rem' }}
            >
              {busy ? t('cvKey.regenerating') : t('cvKey.regenerate')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmRegen(true)}
          className="auth-btn auth-btn--ghost"
          style={{ fontSize: '0.85rem', marginBottom: 20 }}
          disabled={busy}
        >
          🔄 {t('cvKey.regenerate')}
        </button>
      )}

      {error && <div className="auth-error" style={{ marginTop: 10 }}>{error}</div>}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))', margin: '20px 0' }} />

      <h4 style={{ fontSize: '0.95rem', margin: '0 0 8px 0' }}>{t('cvKey.viewsTitle')}</h4>
      <p style={{ fontSize: '0.78rem', color: 'var(--muted-color, #999)', margin: '0 0 12px 0' }}>
        {views.length === 0 ? t('cvKey.viewsEmpty') : t('cvKey.viewsCount', { n: views.length })}
      </p>

      {views.length > 0 && (
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          maxHeight: 220,
          overflowY: 'auto',
          fontSize: '0.82rem'
        }}>
          {views.map((v, i) => (
            <li
              key={i}
              style={{
                padding: '8px 10px',
                borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.06))',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8
              }}
            >
              <span style={{ wordBreak: 'break-all' }}>{v.viewerEmail}</span>
              <span style={{ color: 'var(--muted-color, #888)', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                {new Date(v.viewedAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
