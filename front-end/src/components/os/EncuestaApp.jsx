import React, { useState, useEffect } from 'react';

export default function EncuestaApp() {
  const [enviado, setEnviado] = useState(false);
  const [opiniones, setOpiniones] = useState([]);

  // Cargar opiniones al entrar
  useEffect(() => {
    fetch('http://localhost:5000/api/encuestas')
      .then(res => res.json())
      .then(data => setOpiniones(data));
  }, [enviado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nuevaOpinion = {
      nombre: formData.get('nombre'),
      comentario: formData.get('opinion'),
      puntuacion: parseInt(formData.get('puntuacion'))
    };

    const response = await fetch('http://localhost:5000/api/encuestas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaOpinion)
    });

    if (response.ok) setEnviado(true);
  };

  if (enviado) {
    return (
      <div style={{ padding: '25px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', background: '#0d0d12' }}>
        <h3 style={{ color: '#a034e7' }}>FEEDBACK RECIBIDO</h3>
        {opiniones.map((item) => (
          <div key={item._id} style={{ background: 'rgba(160, 52, 231, 0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(160, 52, 231, 0.3)' }}>
            <strong>@{item.nombre}</strong> — ★ {item.puntuacion}/10
            <p>"{item.comentario}"</p>
          </div>
        ))}
        <button onClick={() => setEnviado(false)} style={{color: '#a034e7', cursor: 'pointer', background: 'none', border: 'none'}}>← Volver a escribir</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '30px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px', background: '#0d0d12' }}>
      <h2 style={{ color: '#a034e7' }}>DEJA TU HUELLA</h2>
      <input name="nombre" placeholder="Tu Alias" required style={{ background: '#1a1a24', color: 'white', padding: '10px' }} />
      <input name="puntuacion" type="range" min="1" max="10" />
      <textarea name="opinion" placeholder="Review técnica..." required style={{ background: '#1a1a24', color: 'white', padding: '10px', height: '100px' }} />
      <button type="submit" style={{ background: '#a034e7', color: 'white', padding: '15px', borderRadius: '8px' }}>Publicar Comentario</button>
    </form>
  );
}