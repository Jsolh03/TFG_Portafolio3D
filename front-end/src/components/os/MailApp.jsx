import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { useT } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const SERVICE_ID  = 'proyecto_portfolio_email';
const TEMPLATE_ID = 'template_proyect';
const PUBLIC_KEY  = 'djVp_993YqoEGhFrs';
const MAX_CHARS = 500;

export default function MailApp({ fullData }) {
  const t = useT();
  const { isAuthenticated, user: authUser } = useAuth();
  const [form, setForm]     = useState({ nombre: '', email: '', mensaje: '', asunto: '' });
  const [status, setStatus] = useState('idle');
  const [chars, setChars]   = useState(0);
  const [rateLimitError, setRateLimitError] = useState('');

  const destEmail = fullData?.contact?.email || fullData?.email || '';

  // Si el usuario está autenticado, prerelleno su nombre y email al montar
  useEffect(() => {
    if (!isAuthenticated || !authUser) return;
    setForm(prev => ({
      ...prev,
      nombre: prev.nombre || authUser.name || authUser.id || '',
      email: prev.email || authUser.email || ''
    }));
  }, [isAuthenticated, authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'mensaje') setChars(value.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRateLimitError('');

    // --- Mecanismo de Control de Saturación / Rate-Limiting ---
    const now = Date.now();
    const lastSent = Number(localStorage.getItem('mail_last_sent') || '0');
    const sendHistory = JSON.parse(localStorage.getItem('mail_send_history') || '[]');

    // 1. Cooldown de 60 segundos
    if (now - lastSent < 60000) {
      const secondsLeft = Math.ceil((60000 - (now - lastSent)) / 1000);
      setRateLimitError(`Espera ${secondsLeft} segundos antes de enviar otro correo.`);
      return;
    }

    // 2. Máximo 3 correos por hora (evitar saturación de buzón)
    const oneHourAgo = now - 3600000;
    const recentSends = sendHistory.filter(time => time > oneHourAgo);
    if (recentSends.length >= 3) {
      const oldestRecent = recentSends[0];
      const minutesLeft = Math.ceil((3600000 - (now - oldestRecent)) / 60000);
      setRateLimitError(`Límite de seguridad: Máximo 3 correos por hora. Inténtalo de nuevo en ${minutesLeft} minutos.`);
      return;
    }

    setStatus('sending');
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_email: destEmail,
        nombre: form.nombre,
        email: form.email,
        asunto: form.asunto,
        mensaje: form.mensaje
      }, PUBLIC_KEY);

      // Guardar marcas de tiempo del envío exitoso
      const updatedHistory = [...recentSends, now];
      localStorage.setItem('mail_last_sent', String(now));
      localStorage.setItem('mail_send_history', JSON.stringify(updatedHistory));

      setStatus('ok');
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
    }
  };

  if (status === 'ok') {
    return (
      <div className="mail-app mail-app--success">
        <span className="mail-success-icon">✓</span>
        <p className="mail-success-title">{t('mail.sentOk')}</p>
        <p className="mail-success-detail">
          {t('mail.sentDetail', { name: fullData?.name || t('mail.sentRecipientFallback') })}
        </p>
        <button
          className="mail-back-btn"
          onClick={() => { setForm({ nombre: '', email: '', mensaje: '', asunto: '' }); setChars(0); setStatus('idle'); setRateLimitError(''); }}
        >
          {t('mail.back')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mail-app">
      <div className="mail-field mail-to">
        <span className="mail-label">{t('mail.to')}</span>
        <span className="mail-to-value">
          {destEmail || <span className="mail-to-empty">{t('mail.noEmail')}</span>}
        </span>
      </div>

      <div className="mail-field">
        <label className="mail-label">{t('mail.name')}</label>
        <input name="nombre" required placeholder={t('mail.namePh')} value={form.nombre} onChange={handleChange} className="mail-input" />
      </div>

      <div className="mail-field">
        <label className="mail-label">{t('mail.yourEmail')}</label>
        <input name="email" type="email" required placeholder={t('mail.yourEmailPh')} value={form.email} onChange={handleChange} className="mail-input" />
      </div>

      <div className="mail-field">
        <label className="mail-label">{t('mail.subject')}</label>
        <input name="asunto" required placeholder={t('mail.subjectPh')} value={form.asunto} onChange={handleChange} className="mail-input" />
      </div>

      <div className="mail-field mail-field--message">
        <label className="mail-label">{t('mail.message')}</label>
        <textarea
          name="mensaje"
          required
          maxLength={MAX_CHARS}
          placeholder={t('mail.messagePh')}
          value={form.mensaje}
          onChange={handleChange}
          className="mail-textarea"
        />
        <span className={`mail-chars ${chars >= MAX_CHARS ? 'limit' : ''}`}>{chars}/{MAX_CHARS}</span>
      </div>

      {rateLimitError && <span className="mail-error" style={{ display: 'block', marginBottom: '10px' }}>{rateLimitError}</span>}
      {status === 'error' && <span className="mail-error">{t('mail.error')}</span>}

      <button type="submit" disabled={status === 'sending'} className="mail-submit">
        {status === 'sending' ? t('mail.sending') : t('mail.send')}
      </button>
    </form>
  );
}
