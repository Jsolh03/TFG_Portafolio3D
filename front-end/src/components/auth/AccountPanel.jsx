import React, { useEffect, useState } from 'react';
import { useT } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config';

/* AccountPanel — gestión de la cuenta del usuario autenticado.
   - Muestra ID y email
   - Toggle "Permitir mensajes Mail.exe" (mailEnabled, RGPD opt-in/opt-out)
   - Derecho de supresión (RGPD art. 17) con doble confirmación + ID literal */
export default function AccountPanel() {
  const t = useT();
  const { user, token, logout } = useAuth();
  const [stage, setStage] = useState('idle'); // idle | confirm | typing | deleting
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');
  const [mailEnabled, setMailEnabled] = useState(user?.mailEnabled !== false);
  const [mailToggleBusy, setMailToggleBusy] = useState(false);
  const [mailToggleMsg, setMailToggleMsg] = useState('');

  // Sincroniza el toggle con el estado del backend cada vez que `user` cambia
  // (p. ej. al refrescar /me tras un PATCH).
  useEffect(() => {
    setMailEnabled(user?.mailEnabled !== false);
  }, [user?.mailEnabled]);

  if (!user) return null;

  const toggleMailEnabled = async (next) => {
    setMailToggleBusy(true);
    setMailToggleMsg('');
    setMailEnabled(next); // optimistic
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mailEnabled: next })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setMailToggleMsg(next ? t('account.mailEnabledOn') : t('account.mailEnabledOff'));
      setTimeout(() => setMailToggleMsg(''), 2000);
    } catch (e) {
      setMailEnabled(!next); // rollback
      setMailToggleMsg(e.message);
    } finally {
      setMailToggleBusy(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setStage('deleting');
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error');
      // Cuenta borrada — limpiar sesión y enviar a /
      logout();
      window.location.href = '/';
    } catch (e) {
      setError(e.message);
      setStage('typing'); // dejar al usuario reintentar
    }
  };

  return (
    <div className="account-panel">
      <h3 className="settings-section-title">{t('account.myAccountTitle')}</h3>

      <div style={{
        background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        borderRadius: 8,
        padding: 14,
        marginBottom: 20
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted-color, #888)', marginBottom: 4 }}>
          {t('account.idLabel')}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', marginBottom: 10 }}>
          @{user.id}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted-color, #888)', marginBottom: 4 }}>
          {t('account.emailLabel')}
        </div>
        <div style={{ fontSize: '0.9rem' }}>{user.email || '—'}</div>
      </div>

      <h4 style={{ fontSize: '0.95rem', margin: '0 0 8px 0' }}>
        ✉️ {t('account.mailTitle')}
      </h4>
      <p style={{ fontSize: '0.82rem', color: 'var(--muted-color, #999)', lineHeight: 1.5, marginBottom: 10 }}>
        {t('account.mailDesc')}
      </p>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        borderRadius: 8,
        marginBottom: 8,
        cursor: mailToggleBusy ? 'progress' : 'pointer'
      }}>
        <input
          type="checkbox"
          checked={mailEnabled}
          disabled={mailToggleBusy}
          onChange={e => toggleMailEnabled(e.target.checked)}
          style={{ width: 18, height: 18, cursor: 'inherit' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {mailEnabled ? t('account.mailToggleOn') : t('account.mailToggleOff')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted-color, #888)' }}>
            {t('account.mailToggleHint')}
          </div>
        </div>
      </label>
      {mailToggleMsg && (
        <div style={{ fontSize: '0.78rem', color: 'var(--muted-color, #888)', marginBottom: 20 }}>
          {mailToggleMsg}
        </div>
      )}
      {!mailToggleMsg && <div style={{ marginBottom: 24 }} />}

      <h4 style={{ fontSize: '0.95rem', margin: '0 0 8px 0', color: '#f87171' }}>
        ⚠️ {t('account.deleteTitle')}
      </h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted-color, #999)', lineHeight: 1.5, marginBottom: 14 }}>
        {t('account.deleteDesc')}
      </p>

      {stage === 'idle' && (
        <button
          type="button"
          onClick={() => setStage('confirm')}
          className="auth-btn auth-btn--ghost"
          style={{ borderColor: '#f87171', color: '#f87171' }}
        >
          {t('account.deleteBtn')}
        </button>
      )}

      {stage === 'confirm' && (
        <div style={{
          padding: 14,
          background: 'rgba(248, 113, 113, 0.10)',
          borderLeft: '3px solid #f87171',
          borderRadius: 6,
          marginBottom: 12
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 600, color: '#f87171' }}>
            {t('account.deleteConfirmTitle')}
          </p>
          <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', lineHeight: 1.5 }}>
            {t('account.deleteConfirmBody')}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setStage('idle')}
              className="auth-btn auth-btn--ghost"
              style={{ fontSize: '0.85rem' }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => setStage('typing')}
              className="auth-btn auth-btn--primary"
              style={{ fontSize: '0.85rem', background: '#dc2626', borderColor: '#dc2626' }}
            >
              {t('account.deleteConfirmContinue')}
            </button>
          </div>
        </div>
      )}

      {(stage === 'typing' || stage === 'deleting') && (
        <div style={{
          padding: 14,
          background: 'rgba(248, 113, 113, 0.10)',
          borderLeft: '3px solid #f87171',
          borderRadius: 6
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {t('account.deleteTypeId', { id: user.id })}
          </p>
          <input
            type="text"
            className="auth-input"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            disabled={stage === 'deleting'}
            placeholder={user.id}
            style={{ marginBottom: 12, fontFamily: 'monospace' }}
          />
          {error && <div className="auth-error" style={{ marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => { setStage('idle'); setTyped(''); setError(''); }}
              className="auth-btn auth-btn--ghost"
              style={{ fontSize: '0.85rem' }}
              disabled={stage === 'deleting'}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="auth-btn auth-btn--primary"
              style={{ fontSize: '0.85rem', background: '#dc2626', borderColor: '#dc2626' }}
              disabled={stage === 'deleting' || typed.trim() !== user.id}
            >
              {stage === 'deleting' ? t('account.deleting') : t('account.deleteFinal')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
