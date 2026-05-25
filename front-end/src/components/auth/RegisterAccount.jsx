import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { useT } from '../../context/LanguageContext';
import { API_BASE } from '../../config';

const EMAILJS_SERVICE_ID = 'proyecto_portfolio_email';
const EMAILJS_VERIFY_TEMPLATE_ID = 'template_verify';
const EMAILJS_PUBLIC_KEY = 'djVp_993YqoEGhFrs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_RE = /^[a-zA-Z0-9_-]{2,32}$/;
const PASSWORD_MIN = 8;

/* RegisterAccount — formulario simplificado de creación de CUENTA.
   Solo id + email + password + name. No crea habitación detallada.
   Tras el registro se manda el email de verificación; la personalización
   de habitación viene DESPUÉS, con el usuario logueado y verificado. */
export default function RegisterAccount({ onCancel, onSwitchToLogin }) {
  const t = useT();
  const [form, setForm] = useState({ id: '', name: '', email: '', password: '', confirmPassword: '' });
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

      const verificationLink = `${window.location.origin}/?verify=${data.verificationToken}`;
      let emailSent = false;
      let emailError = null;
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_VERIFY_TEMPLATE_ID, {
          to_email: data.email,
          user_id: data.id,
          verification_link: verificationLink
        }, EMAILJS_PUBLIC_KEY);
        emailSent = true;
      } catch (mailErr) {
        console.error('EmailJS verify error:', mailErr);
        emailError = mailErr?.text || mailErr?.message || 'Error enviando el email';
      }

      setRegistered({ id: data.id, email: data.email, verificationLink, emailSent, emailError });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (registered) {
    return (
      <div className="auth-form-wrap">
        <div className="auth-form">
          <button type="button" onClick={onCancel} className="auth-back" aria-label={t('common.back')}>← {t('common.back')}</button>
          <h2 className="auth-title">{t('account.registeredTitle', { id: registered.id })}</h2>
          {registered.emailSent ? (
            <>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-color)' }}>
                {t('account.registeredEmailSentPrefix')} <strong>{registered.email}</strong>.
              </p>
              <p style={{ color: 'var(--muted-color, #999)', fontSize: '0.85rem' }}>
                {t('account.registeredCheckSpam')}
              </p>
              <p style={{ marginTop: 16, fontSize: '0.9rem' }}>
                {t('account.registeredCanLoginAfter')}
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.95rem' }}>
                {t('account.registeredEmailFailedPrefix')} ({registered.emailError || ''}).
              </p>
              <p style={{ color: 'var(--muted-color, #999)', fontSize: '0.85rem' }}>
                {t('account.registeredManualHint')}
              </p>
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--glass-border)',
                padding: '10px 14px',
                borderRadius: 8,
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                wordBreak: 'break-all',
                margin: '10px 0'
              }}>
                {registered.verificationLink}
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(registered.verificationLink)}
                className="auth-btn auth-btn--ghost"
                style={{ marginBottom: 10 }}
              >
                {t('account.copyLink')}
              </button>
            </>
          )}
          <div className="auth-actions">
            <button type="button" onClick={onSwitchToLogin} className="auth-btn auth-btn--primary">
              {t('account.goToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-wrap">
      <form onSubmit={handleSubmit} className="auth-form">
        <button type="button" onClick={onCancel} className="auth-back" aria-label={t('common.back')}>← {t('common.back')}</button>

        <h2 className="auth-title">{t('account.title')}</h2>
        <p className="auth-subtitle">{t('account.subtitle')}</p>

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
