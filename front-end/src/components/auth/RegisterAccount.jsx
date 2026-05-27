import React, { useState } from 'react';
import { useT } from '../../context/LanguageContext';
import { API_BASE } from '../../config';

/* Pantalla post-registro con botón de reenvío de email. El backend no expone
   nunca el verificationToken: si el email no llega, el usuario pulsa "Reenviar"
   y el servidor regenera + manda otro. */
function RegisteredScreen({ registered, onCancel, onSwitchToLogin }) {
  const t = useT();
  const [resendStatus, setResendStatus] = useState(registered.emailDelivered ? 'sent' : 'failed');
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState('');

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    setResendError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: registered.id, email: registered.email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || t('account.resendErrorGeneric'));
      setResendStatus('sent');
    } catch (e) {
      setResendError(e.message);
      setResendStatus('failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-form-wrap">
      <div className="auth-form">
        <button type="button" onClick={onCancel} className="auth-back" aria-label={t('common.back')}>← {t('common.back')}</button>
        <h2 className="auth-title">{t('account.registeredTitle', { id: registered.id })}</h2>

        {resendStatus === 'sent' ? (
          <>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-color)' }}>
              {t('account.registeredEmailSentPrefix')} <strong>{registered.email}</strong>.
            </p>

            <div style={{
              marginTop: 14,
              padding: '12px 14px',
              background: 'rgba(245, 158, 11, 0.12)',
              borderLeft: '3px solid #f59e0b',
              borderRadius: 6
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#fbbf24' }}>
                {t('account.registeredSpamWarningTitle')}
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-color)' }}>
                {t('account.registeredSpamWarningBody')}
              </p>
            </div>

            <p style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--muted-color, #999)' }}>
              {t('account.registeredCheckSpam')}
            </p>
            <p style={{ marginTop: 8, fontSize: '0.9rem' }}>
              {t('account.registeredCanLoginAfter')}
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: '0.95rem', color: '#fca5a5' }}>
              ⚠️ {t('account.emailDeliveryFailed')}
            </p>
            <p style={{ color: 'var(--muted-color, #999)', fontSize: '0.85rem' }}>
              {t('account.resendInstructions')}
            </p>
          </>
        )}

        {resendError && <div className="auth-error" style={{ marginTop: 10 }}>{resendError}</div>}

        <div className="auth-actions" style={{ marginTop: 18 }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="auth-btn auth-btn--ghost"
          >
            {resending ? t('account.resending') : t('account.resendBtn')}
          </button>
          <button type="button" onClick={onSwitchToLogin} className="auth-btn auth-btn--primary">
            {t('account.goToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_RE = /^[a-zA-Z0-9_-]{2,32}$/;
const PASSWORD_MIN = 8;

/* RegisterAccount — formulario simplificado de creación de CUENTA.
   Solo id + email + password + name. No crea habitación detallada.
   Tras el registro se manda el email de verificación; la personalización
   de habitación viene DESPUÉS, con el usuario logueado y verificado. */
export default function RegisterAccount({ onCancel, onSwitchToLogin, prefillId, prefillEmail }) {
  const t = useT();
  const [form, setForm] = useState({
    id: prefillId || '',
    name: '',
    email: prefillEmail || '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(null);

  const update = (patch) => {
    setForm(prev => ({ ...prev, ...patch }));
    if (error) setError('');
  };

  const valid = () => {
    if (!ID_RE.test(form.id.trim().toLowerCase())) return t('account.errorId');
    if (!form.name.trim()) return t('account.errorName');
    if (!EMAIL_RE.test(form.email.trim())) return t('account.errorEmail');
    if (form.password.length < PASSWORD_MIN) return t('account.errorPasswordShort');
    if (form.password !== form.confirmPassword) return t('account.errorPasswordMismatch');
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = valid();
    if (v) { setError(v); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id.toLowerCase().trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || t('account.errorGeneric'));

      // El email lo manda el BACKEND directamente con Resend. Aquí solo
      // recibimos confirmación de que la cuenta se creó. NUNCA recibimos
      // el verificationToken (eso anularía la verificación por email).
      setRegistered({
        id: data.id,
        email: data.email,
        emailDelivered: data.emailDelivered !== false
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return <RegisteredScreen registered={registered} onCancel={onCancel} onSwitchToLogin={onSwitchToLogin} />;
  }

  return (
    <div className="auth-form-wrap">
      <form onSubmit={handleSubmit} className="auth-form">
        <button type="button" onClick={onCancel} className="auth-back" aria-label={t('common.back')}>← {t('common.back')}</button>

        <h2 className="auth-title">{t('account.title')}</h2>
        <p className="auth-subtitle">{t('account.subtitle')}</p>

        {(prefillId || prefillEmail) && (
          <div className="auth-prefill-notice">
            ℹ️ {t('account.prefillNotice')}
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label">{t('account.userId')}</label>
          <input
            value={form.id}
            onChange={e => update({ id: e.target.value.toLowerCase().replace(/\s+/g, '') })}
            required maxLength={32} className="auth-input"
            placeholder={t('account.userIdPh')} disabled={submitting}
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">{t('account.publicName')}</label>
          <input
            value={form.name}
            onChange={e => update({ name: e.target.value })}
            required maxLength={80} className="auth-input"
            placeholder={t('account.publicNamePh')} disabled={submitting}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">{t('account.email')}</label>
          <input
            type="email"
            value={form.email}
            onChange={e => update({ email: e.target.value })}
            required className="auth-input"
            placeholder="tu@email.com" disabled={submitting}
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">{t('account.password')}</label>
          <input
            type="password"
            value={form.password}
            onChange={e => update({ password: e.target.value })}
            required minLength={PASSWORD_MIN} className="auth-input"
            placeholder={t('account.passwordPh')} disabled={submitting}
            autoComplete="new-password"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">{t('account.confirmPassword')}</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={e => update({ confirmPassword: e.target.value })}
            required className="auth-input"
            placeholder="********" disabled={submitting}
            autoComplete="new-password"
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-actions">
          <button type="button" onClick={onCancel} className="auth-btn auth-btn--ghost" disabled={submitting}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="auth-btn auth-btn--primary" disabled={submitting}>
            {submitting ? t('account.creating') : t('account.createAccount')}
          </button>
        </div>

        <div className="auth-switch">
          {t('account.alreadyHaveAccount')}{' '}
          <button type="button" onClick={onSwitchToLogin} className="auth-link" disabled={submitting}>
            {t('account.loginLink')}
          </button>
        </div>
      </form>
    </div>
  );
}
