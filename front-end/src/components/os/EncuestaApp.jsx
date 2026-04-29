import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config';

export default function EncuestaApp() {
  const [enviado, setEnviado] = useState(false);
  const [opiniones, setOpiniones] = useState([]);
  const [puntuacion, setPuntuacion] = useState(5);

  useEffect(() => {
    fetch(`${API_BASE}/api/encuestas`)
      .then(res => res.json())
      .then(data => setOpiniones(data))
      .catch(err => console.error('Error cargando encuestas:', err));
  }, [enviado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nuevaOpinion = {
      nombre: formData.get('nombre'),
      comentario: formData.get('opinion'),
      puntuacion: parseInt(formData.get('puntuacion'))
    };
    const response = await fetch(`${API_BASE}/api/encuestas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaOpinion)
    });
    if (response.ok) setEnviado(true);
  };

  if (enviado) {
    return (
      <div style={{ padding: '25px', color: 'white', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto', background: '#0d0d12' }}>
        <h3 style={{ color: '#a034e7', letterSpacing: '2px', margin: 0 }}>FEEDBACK RECIBIDO</h3>
        {opiniones.map((item) => (
          <div key={item._id} style={{ background: 'rgba(160, 52, 231, 0.05)', padding: '14px 18px', borderRadius: '8px', border: '1px solid rgba(160, 52, 231, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <strong style={{ color: '#cbbceb' }}>@{item.nombre}</strong>
              <span style={{ color: '#a034e7', fontSize: '0.85rem' }}>★ {item.puntuacion}/10</span>
            </div>
            <p style={{ color: '#8b949e', margin: 0, fontSize: '0.85rem', lineHeight: '1.7' }}>"{item.comentario}"</p>
          </div>
        ))}
        <button onClick={() => setEnviado(false)} style={{ color: '#a034e7', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '0.85rem', textAlign: 'left', padding: 0, marginTop: '8px' }}>← Volver a escribir</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '28px', color: 'white', display: 'flex', flexDirection: 'column', gap: '16px', background: '#0d0d12', height: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#a034e7', margin: 0, letterSpacing: '2px', fontSize: '1rem' }}>DEJA TU HUELLA</h2>

      <input
        name="nombre"
        placeholder="Tu alias..."
        required
        style={{ background: '#1a1a24', color: 'white', padding: '10px 14px', border: '1px solid rgba(160,52,231,0.3)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: '#8b949e', fontSize: '0.78rem', letterSpacing: '1px' }}>
          PUNTUACIÓN: <span style={{ color: '#a034e7' }}>{puntuacion}/10</span>
        </label>
        <input
          name="puntuacion"
          type="range"
          min="1"
          max="10"
          value={puntuacion}
          onChange={e => setPuntuacion(e.target.value)}
          style={{ accentColor: '#a034e7' }}
        />
      </div>

      <textarea
        name="opinion"
        placeholder="Review técnica..."
        required
        style={{ background: '#1a1a24', color: 'white', padding: '10px 14px', border: '1px solid rgba(160,52,231,0.3)', borderRadius: '6px', height: '100px', resize: 'none', fontFamily: 'inherit', fontSize: '0.85rem', outline: 'none' }}
      />

      <button
        type="submit"
        style={{ background: 'rgba(160,52,231,0.15)', color: '#a034e7', padding: '12px', borderRadius: '6px', border: '1px solid rgba(160,52,231,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', letterSpacing: '1px', transition: 'background 0.2s' }}
      >
        PUBLICAR COMENTARIO
      </button>
    </form>
  );
}