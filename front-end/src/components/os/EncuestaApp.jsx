import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

const MAX_CHARS = 280;

export default function EncuestaApp({ targetUserId }) {
  const [view, setView] = useState(() => {
    return localStorage.getItem(`encuesta_realizada_${targetUserId}`) === 'true' ? 'list' : 'form';
  });

  const [opiniones, setOpiniones] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/encuestas?targetUserId=${targetUserId}`)
      .then(res => res.json())
      .then(data => setOpiniones(data))
      .catch(err => console.error('Error cargando encuestas:', err));
  }, [view, targetUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (puntuacion === 0) return;
    const formData = new FormData(e.target);
    const nuevaOpinion = {
      targetUserId,
      nombre: formData.get('nombre'),
      comentario: formData.get('opinion'),
      puntuacion
    };
    const response = await fetch(`${API_BASE}/api/encuestas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaOpinion)
    });

    if (response.ok) {
      localStorage.setItem(`encuesta_realizada_${targetUserId}`, 'true');
      setView('list');
      setPuntuacion(0); // Reset form
      e.target.reset();
    }
  };

  const colors = {
    bg: '#0f0f1a',          
    card: '#161b22',        
    accent: '#a034e7',      
    softAccent: '#cbbceb',  
    border: '#3d375e',      
    textMuted: '#8b949e'
  };

  const inputStyle = {
    background: colors.bg,
    color: '#c9d1d9',
    padding: '10px 12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const handleCaptureKeys = (e) => {
    e.stopPropagation();
  };

  if (view === 'list') {
    return (
      <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', overflowY: 'auto', background: colors.bg }}>
        <header style={{ borderBottom: `1px solid ${colors.accent}`, paddingBottom: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: colors.softAccent, letterSpacing: '2px', margin: 0, fontSize: '0.85rem' }}>FEEDBACK DEL SISTEMA</h3>
          <button 
            onClick={() => setView('form')}
            style={{ background: 'transparent', color: colors.accent, border: `1px solid ${colors.accent}`, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            + NUEVA RESEÑA
          </button>
        </header>
        
        {opiniones.map((item) => (
          <div key={item._id} style={{ 
            background: colors.card, 
            padding: '14px', 
            borderRadius: '4px', 
            border: `1px solid ${colors.border}`,
            borderLeft: `3px solid ${colors.accent}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>@{item.nombre}</strong>
              <span style={{ color: colors.accent, fontSize: '0.8rem' }}>
                {/* Límite ajustado a 5 estrellas */}
                {'★'.repeat(item.puntuacion)}{'☆'.repeat(5 - item.puntuacion)}
              </span>
            </div>
            <p style={{ color: '#b1b8c0', margin: 0, fontSize: '0.85rem', lineHeight: '1.6', fontStyle: 'italic' }}>
              "{item.comentario}"
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ 
      padding: '25px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '18px', 
      background: colors.bg, 
      height: '100%', 
      boxSizing: 'border-box', 
      overflowY: 'auto',
      borderTop: `4px solid ${colors.accent}` 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: colors.softAccent, margin: 0, letterSpacing: '3px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
          Registro de Feedback<span>_</span>
        </h2>
        <button 
          type="button"
          onClick={() => setView('list')}
          style={{ background: 'transparent', color: colors.textMuted, border: `1px solid ${colors.border}`, padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
        >
          VER RESEÑAS
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: colors.textMuted, fontSize: '0.7rem', letterSpacing: '1px' }}>ID_USUARIO</label>
        <input 
          name="nombre" 
          placeholder="Introduce tu alias..." 
          required 
          style={inputStyle} 
          onFocus={e => e.target.style.borderColor = colors.accent}
          onBlur={e => e.target.style.borderColor = colors.border}
          onKeyDown={handleCaptureKeys}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ color: colors.textMuted, fontSize: '0.7rem', letterSpacing: '1px' }}>
          VALORACIÓN_SISTEMA {puntuacion === 0 && <span style={{ color: '#f85149', fontSize: '0.6rem' }}>[!]</span>}
        </label>
        <div style={{ display: 'flex', gap: '8px', background: colors.card, padding: '10px', borderRadius: '4px', border: `1px solid ${colors.border}`, justifyContent: 'center' }}>
          {/* Mapeo limitado a 5 estrellas */}
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              onClick={() => setPuntuacion(n)}
              style={{
                cursor: 'pointer',
                fontSize: '1.5rem', // Un poco más grandes al ser menos
                color: n <= puntuacion ? colors.softAccent : '#30363d',
                transition: 'all 0.2s',
                userSelect: 'none'
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: colors.textMuted, fontSize: '0.7rem', letterSpacing: '1px' }}>MENSAJE_LOG</label>
        <textarea
          name="opinion"
          placeholder="Escribe tu opinión técnica aquí..."
          required
          maxLength={MAX_CHARS}
          onChange={e => setChars(e.target.value.length)}
          style={{ ...inputStyle, height: '100px', resize: 'none' }}
          onFocus={e => e.target.style.borderColor = colors.accent}
          onBlur={e => e.target.style.borderColor = colors.border}
          onKeyDown={handleCaptureKeys}
        />
        <span style={{ color: chars >= MAX_CHARS ? '#f85149' : colors.textMuted, fontSize: '0.7rem', textAlign: 'right' }}>
          CHARS: {chars}/{MAX_CHARS}
        </span>
      </div>

      <button
        type="submit"
        style={{
          background: colors.accent, 
          color: '#fff',
          padding: '12px', 
          borderRadius: '4px',
          border: 'none', 
          cursor: 'pointer',
          fontFamily: 'inherit', 
          fontSize: '0.85rem',
          fontWeight: 'bold',
          letterSpacing: '2px', 
          marginTop: '10px',
          transition: 'background 0.3s'
        }}
        onMouseEnter={e => e.target.style.background = '#8a2be2'}
        onMouseLeave={e => e.target.style.background = colors.accent}
      >
        ENVIAR_DATOS
      </button>
    </form>
  );
}