import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../context/LanguageContext';

export default function Login({ onLoginSuccess, onCancel, onSwitchToRegister }) {
  const t = useT();
  const { login } = useAuth();
  const [form, setForm] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.id.toLowerCase().trim(), form.password);
      onLoginSuccess?.(user);
    } catch (err) {
      setError(err?.message || t('auth.genericError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form-wrap">
      <form onSubmit={handleSubmit} className="auth-form">
        <button type="button" onClick={onCancel} className="auth-back" aria-label={t('common.back')}>← {t('common.back')}</button>
        <h2 className="auth-title">{t('auth.loginTitle')}</h2>
        <p className="auth-subtitle">{t('auth.loginSubtitle')}</p>

        <div className="auth-field">
          <label className="auth-label">{t('auth.usernameLabel')}</label>
          <input
            name="id"
            value={form.id}
            onChange={handleChange}
            required
            autoComplete="username"
            placeholder={t('auth.usernamePh')}
            className="auth-input"
            disabled={submitting}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">{t('auth.passwordLabel')}</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder={t('auth.passwordPh')}
            className="auth-input"
            disabled={submitting}
            minLength={8}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-actions">
          <button type="button" onClick={onCancel} className="auth-btn auth-btn--ghost" disabled={submitting}>
            {t('auth.cancel')}
          </button>
          <button type="submit" className="auth-btn auth-btn--primary" disabled={submitting}>
            {submitting ? t('auth.loggingIn') : t('auth.loginBtn')}
          </button>
        </div>

        <div className="auth-switch">
          {t('auth.noAccount')}{' '}
          <button type="button" onClick={onSwitchToRegister} className="auth-link" disabled={submitting}>
            {t('auth.registerLink')}
          </button>
        </div>
      </form>
    </div>
  );
}
