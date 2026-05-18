import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const SERVICE_ID  = 'proyecto_portfolio_email';
const TEMPLATE_ID = 'template_proyect';
const PUBLIC_KEY  = 'djVp_993YqoEGhFrs';

const MAX_CHARS = 500;

export default function MailApp({ fullData }) {
  const [form, setForm]     = useState({ nombre: '', email: '', mensaje: '' });
  const [status, setStatus] = useState('idle');
  const [chars, setChars]   = useState(0);

  const destEmail = fullData?.contact?.email || fullData?.email || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'mensaje') setChars(value.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        to_email: destEmail,
        nombre:   form.nombre,
        email:    form.email,
        mensaje:  form.mensaje,
      }, PUBLIC_KEY);
      setStatus('ok');
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
    }
  };

  const field = { display: 'flex', flexDirection: 'column', gap: '5px' };
  const label = { color: '#a034e7', fontSize: '1.3rem', letterSpacing: '3px' };
  const input = {
    width: '100%', padding: '9px 12px',
    background: 'rgba(160, 52, 231, 0.05)', color: '#c9d1d9',
    border: '1px solid rgba(160, 52, 231, 0.2)', borderRadius: '4px',
    fontFamily: 'inherit', fontSize: '1.2rem',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  };

  if (status === 'ok') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', background: '#0d1117', padding: '32px', textAlign: 'center' }}>
        <span style={{ color: '#a034e7', fontSize: '2rem' }}>✓</span>
        <p style={{ color: '#c9d1d9', margin: 0, fontSize: '0.88rem', letterSpacing: '0.5px' }}>MENSAJE ENVIADO</p>
        <p style={{ color: '#6e7681', margin: 0, fontSize: '0.78rem' }}>
          {fullData?.name || 'El destinatario'} recibirá tu mensaje en breve.
        </p>
        <button
          onClick={() => { setForm({ nombre: '', email: '', mensaje: '' }); setChars(0); setStatus('idle'); }}
          style={{ marginTop: '4px', background: 'none', border: '1px solid rgba(160,52,231,0.3)', color: '#8b949e', padding: '7px 18px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', letterSpacing: '1px' }}
          onMouseEnter={e => e.target.style.borderColor = '#a034e7'}
          onMouseLeave={e => e.target.style.borderColor = 'rgba(160,52,231,0.3)'}
        >
          ← VOLVER
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px', padding: '22px', background: '#0d1117', boxSizing: 'border-box', overflowY: 'auto' }}
    >
      <div style={{ ...field, paddingBottom: '14px', borderBottom: '1px solid rgba(160,52,231,0.15)' }}>
        <span style={label}>PARA</span>
        <span style={{ color: '#8b949e', fontSize: '1.1rem' }}>
          {destEmail || <span style={{ color: '#484f58' }}>sin email configurado</span>}
        </span>
      </div>

      <div style={field}>
        <label style={label}>NOMBRE</label>
        <input name="nombre" required placeholder="Tu nombre..." value={form.nombre} onChange={handleChange} style={input}
          onFocus={e => e.target.style.borderColor = 'rgba(160,52,231,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(160,52,231,0.2)'} />
      </div>

      <div style={field}>
        <label style={label}>TU EMAIL</label>
        <input name="email" type="email" required placeholder="para poder responderte..." value={form.email} onChange={handleChange} style={input}
          onFocus={e => e.target.style.borderColor = 'rgba(160,52,231,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(160,52,231,0.2)'} />
      </div>

      <div style={{ ...field, flex: 1 }}>
        <label style={label}>MENSAJE</label>
        <textarea name="mensaje" required maxLength={MAX_CHARS} placeholder="Escribe tu mensaje..." value={form.mensaje} onChange={handleChange}
          style={{ ...input, resize: 'none', flex: 1, minHeight: '90px' }}
          onFocus={e => e.target.style.borderColor = 'rgba(160,52,231,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(160,52,231,0.2)'} />
        <span style={{ fontSize: '0.7rem', textAlign: 'right', color: chars >= MAX_CHARS ? '#f85149' : '#484f58' }}>
          {chars}/{MAX_CHARS}
        </span>
      </div>

      {status === 'error' && (
        <span style={{ color: '#f85149', fontSize: '0.78rem', textAlign: 'center', letterSpacing: '0.5px' }}>
          ✗ Error al enviar — comprueba tu conexión
        </span>
      )}

      <button
        type="submit" disabled={status === 'sending'}
        style={{ padding: '10px', flexShrink: 0, background: 'rgba(160,52,231,0.08)', color: status === 'sending' ? '#484f58' : '#a034e7', border: '1px solid rgba(160,52,231,0.35)', borderRadius: '4px', cursor: status === 'sending' ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', letterSpacing: '2px', transition: 'background 0.15s' }}
        onMouseEnter={e => { if (status !== 'sending') e.target.style.background = 'rgba(160,52,231,0.15)'; }}
        onMouseLeave={e => { e.target.style.background = 'rgba(160,52,231,0.08)'; }}
      >
        {status === 'sending' ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}
      </button>
    </form>
  );
}