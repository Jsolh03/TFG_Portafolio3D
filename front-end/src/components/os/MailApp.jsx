import React, { useState, useEffect } from 'react';
import { useT } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config';

const MAX_CHARS = 2000;

/* MailApp — formulario de contacto al dueño de la habitación.
   El envío SIEMPRE va por el backend (POST /api/contact/:userId). El email
   del dueño NUNCA viaja al frontend; el backend lo resuelve internamente y
   reenvía la llamada al sistema transaccional (Brevo/SMTP/Resend) ya
   existente. Esto cumple RGPD: el visitante no ve la dirección personal.
   Si el dueño ha desactivado los mensajes (mailEnabled=false) o no tiene
   email configurado, el botón de enviar queda inhabilitado y se muestra
   un mensaje explicativo. */
export default function MailApp({ fullData }) {
  const t = useT();
  const { isAuthenticated, user: authUser } = useAuth();
  const [form, setForm]     = useState({ nombre: '', email: '', mensaje: '', asunto: '' });
  const [status, setStatus] = useState('idle');
  const [chars, setChars]   = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const targetUserId = fullData?.id;
  const targetName = fullData?.name || targetUserId || '';
  // El backend nos da estos flags en sanitizeUserPublic. Si no llegan (datos
  // antiguos o vista del propio dueño), asumimos defaults seguros: hay email
  // y los mensajes están activados.
  const hasContactEmail = fullData?.hasContactEmail !== false;
  const mailEnabled = fullData?.mailEnabled !== false;

  const blocked = !targetUserId || !hasContactEmail || !mailEnabled;

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
    if (blocked) return;
    setErrorMessage('');

    // Anti-flood local — el backend también limita (5/h por IP) pero un
    // cooldown corto evita pulsaciones dobles accidentales.
    const now = Date.now();
    const lastSent = Number(localStorage.getItem('mail_last_sent') || '0');
    if (now - lastSent < 30000) {
      const secondsLeft = Math.ceil((30000 - (now - lastSent)) / 1000);
      setErrorMessage(t('mail.cooldown', { n: secondsLeft }));
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(`${API_BASE}/api/contact/${encodeURIComponent(targetUserId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromName: form.nombre.trim(),
          fromEmail: form.email.trim(),
          subject: form.asunto.trim(),
          message: form.mensaje.trim()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.mailDisabled) {
          setErrorMessage(t('mail.errorDisabled'));
        } else if (data?.noContactEmail) {
          setErrorMessage(t('mail.errorNoEmail'));
        } else if (res.status === 429) {
          setErrorMessage(t('mail.errorRateLimit'));
        } else {
          setErrorMessage(data?.error || t('mail.error'));
        }
        setStatus('error');
        return;
      }
      localStorage.setItem('mail_last_sent', String(now));
      setStatus('ok');
    } catch (err) {
      console.error('Mail.exe error:', err);
      setErrorMessage(t('mail.error'));
      setStatus('error');
    }
  };

  if (status === 'ok') {
    return (
      <div className="mail-app mail-app--success">
        <span className="mail-success-icon">✓</span>
        <p className="mail-success-title">{t('mail.sentOk')}</p>
        <p className="mail-success-detail">
          {t('mail.sentDetail', { name: targetName || t('mail.sentRecipientFallback') })}
        </p>
        <button
          className="mail-back-btn"
          onClick={() => {
            setForm({ nombre: '', email: '', mensaje: '', asunto: '' });
            setChars(0);
            setStatus('idle');
            setErrorMessage('');
          }}
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
          @{targetUserId || '—'}{targetName && targetName !== targetUserId && ` · ${targetName}`}
          <small style={{
            display: 'block',
            fontSize: '0.72rem',
            color: 'var(--muted-color, #888)',
            marginTop: 2
          }}>
            🔒 {t('mail.privacyNote')}
          </small>
        </span>
      </div>

      {blocked && (
        <div className="mail-error" style={{ display: 'block', marginBottom: 12, padding: '10px 12px', borderRadius: 6 }}>
          {!hasContactEmail && t('mail.errorNoEmail')}
          {hasContactEmail && !mailEnabled && t('mail.errorDisabled')}
        </div>
      )}

      <div className="mail-field">
        <label className="mail-label">{t('mail.name')}</label>
        <input
          name="nombre" required placeholder={t('mail.namePh')}
          value={form.nombre} onChange={handleChange}
          className="mail-input" disabled={blocked}
          maxLength={80}
        />
      </div>

      <div className="mail-field">
        <label className="mail-label">{t('mail.yourEmail')}</label>
        <input
          name="email" type="email" required
          placeholder={t('mail.yourEmailPh')}
          value={form.email} onChange={handleChange}
          className="mail-input" disabled={blocked}
          maxLength={200}
        />
      </div>

      <div className="mail-field">
        <label className="mail-label">{t('mail.subject')}</label>
        <input
          name="asunto" required placeholder={t('mail.subjectPh')}
          value={form.asunto} onChange={handleChange}
          className="mail-input" disabled={blocked}
          maxLength={160}
        />
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
          disabled={blocked}
        />
        <span className={`mail-chars ${chars >= MAX_CHARS ? 'limit' : ''}`}>{chars}/{MAX_CHARS}</span>
      </div>

      {errorMessage && (
        <span className="mail-error" style={{ display: 'block', marginBottom: 10 }}>{errorMessage}</span>
      )}

      <button type="submit" disabled={blocked || status === 'sending'} className="mail-submit">
        {status === 'sending' ? t('mail.sending') : t('mail.send')}
      </button>
    </form>
  );
}
