import React, { useState } from 'react';
import { supabase } from '/src/lib/supabaseClient';

export default function LauraEncuestaApp() {
  const [enviado, setEnviado] = useState(false);
  const [errorTexto, setErrorTexto] = useState('');
  const [opiniones, setOpiniones] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    // Corregido: Obtenemos el valor directamente del formData
    const nuevaOpinion = {
      nombre: formData.get('nombre'),
      comentario: formData.get('opinion'),
      puntuacion: parseInt(formData.get('puntuacion'))
    };

    const { error: errorInsert } = await supabase
      .from('encuestas')
      .insert([nuevaOpinion]);

    if (errorInsert) {
      setErrorTexto(errorInsert.message);
      return;
    }

    const { data: datos, error: errorSelect } = await supabase
      .from('encuestas')
      .select('*')
      .order('created_at', { ascending: false });

    if (errorSelect) {
      setErrorTexto(errorSelect.message);
    } else {
      setOpiniones(datos);
      setEnviado(true);
    }
  };

  // VISTA DE VALORACIONES (ESTILO FORO)
  if (enviado) {
    return (
      <div style={{ padding: '25px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', background: '#0d0d12' }}>
        <div style={{ borderLeft: '4px solid #a034e7', paddingLeft: '15px' }}>
          <h3 style={{ margin: 0, color: '#a034e7', fontSize: '1.8rem' }}>FEEDBACK RECIBIDO</h3>
          <p style={{ fontSize: '1rem', color: '#aaa', marginTop: '5px' }}>Comunidad de visitantes</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {opiniones.map((item) => (
            <div key={item.id} style={{ 
              background: 'rgba(160, 52, 231, 0.05)', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid rgba(160, 52, 231, 0.3)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ color: '#cbbceb', fontSize: '1.2rem' }}>@{item.nombre.toLowerCase().replace(/\s+/g, '_')}</strong>
                <span style={{ background: '#a034e7', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  ★ {item.puntuacion}/10
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5', color: '#eee', fontStyle: 'italic' }}>
                "{item.comentario}"
              </p>
              <small style={{ display: 'block', marginTop: '10px', color: '#555', fontSize: '0.8rem' }}>
                Enviado el {new Date(item.created_at).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
        
      </div>
    );
  }

  // FORMULARIO DE ENTRADA
  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => e.stopPropagation()}
      style={{ padding: '30px', color: 'white', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', background: '#0d0d12' }}
    >
      <header>
        <h2 style={{ color: '#a034e7', margin: 0, fontSize: '2rem' }}>DEJA TU HUELLA</h2>
        <p style={{ color: '#888', fontSize: '1rem' }}>Tu feedback es clave para mi evolución Full-Stack.</p>
      </header>

      {errorTexto && <div style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', padding: '10px', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid #ff4444' }}>
        Error: {errorTexto}
      </div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '1rem', fontWeight: 'bold', color: '#cbbceb' }}>Alias del desarrollador / Visitante:</label>
        <input name="nombre" type="text" placeholder="Ej: User_404" required
          style={{ width: '100%', background: '#1a1a24', border: '1px solid #333', color: 'white', padding: '12px', borderRadius: '8px', outline: 'none', borderFocus: '1px solid #a034e7' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '1rem', fontWeight: 'bold', color: '#cbbceb' }}>Puntuación de la Experiencia (1-10):</label>
        <input name="puntuacion" type="range" min="1" max="10" defaultValue="10"
          style={{ width: '100%', accentColor: '#a034e7', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#a034e7', fontWeight: 'bold' }}>
          <span>1</span><span>5</span><span>10</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '1rem', fontWeight: 'bold', color: '#cbbceb' }}>Review técnica:</label>
        <textarea name="opinion" placeholder="¿Qué te ha parecido la integración 3D y el OS?" required
          style={{ width: '100%', background: '#1a1a24', border: '1px solid #333', color: 'white', padding: '12px', height: '120px', borderRadius: '8px', resize: 'none', outline: 'none' }}
        />
      </div>

      <button type="submit"
        style={{ 
          background: '#a034e7', 
          color: 'white', 
          border: 'none', 
          padding: '15px', 
          cursor: 'pointer', 
          fontWeight: 'bold', 
          fontSize: '1.1rem',
          borderRadius: '8px', 
          boxShadow: '0 4px 15px rgba(160, 52, 231, 0.3)',
          transition: '0.3s'
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        Publicar Comentario
      </button>
    </form>
  );
}