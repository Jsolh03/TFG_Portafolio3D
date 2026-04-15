import React, { useState } from 'react';
import { supabase } from '/src/lib/supabaseClient';

export default function LauraEncuestaApp() {
  const [enviado, setEnviado] = useState(false);
  const [errorTexto, setErrorTexto] = useState('');
  const [opiniones, setOpiniones] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nuevaOpinion = {
      nombre: formData.get('nombre'),
      comentario: formData.get('opinion') // Ahora capturamos la opinión
    };

    // 1. Guardamos la opinión en la base de datos
    const { error: errorInsert } = await supabase
      .from('encuestas')
      .insert([nuevaOpinion]);

    if (errorInsert) {
      setErrorTexto(errorInsert.message);
      return;
    }

    // 2. Recuperamos todas las opiniones para mostrarlas
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

  // PANTALLA DE RESULTADOS (Muro de Opiniones)
  if (enviado) {
    return (
      <div style={{ padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', overflowY: 'auto' }}>
        <h3 style={{ borderBottom: '1px solid #4af626', paddingBottom: '10px', color: '#4af626' }}>¡Gracias por tu feedback!</h3>
        <p style={{ fontSize: '0.9em', color: '#aaa' }}>Opiniones de otros visitantes:</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {opiniones.map((item) => (
            <div key={item.id} style={{ background: '#222', padding: '15px', borderRadius: '8px', border: '1px solid #444' }}>
              <strong style={{ color: '#4f46e5', display: 'block', marginBottom: '5px' }}>{item.nombre} escribió:</strong>
              <p style={{ margin: 0, fontSize: '0.95em', fontStyle: 'italic', color: '#eee' }}>"{item.comentario}"</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // FORMULARIO DE OPINIÓN
  return (
    <form 
      onSubmit={handleSubmit} 
      onKeyDown={(e) => e.stopPropagation()} 
      style={{ padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}
    >
      <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>VALORA MI PORTFOLIO</h3>
      <p style={{ fontSize: '0.85em', color: '#ccc' }}>Tu opinión me ayuda a seguir mejorando como desarrolladora Back-End.</p>
      
      {errorTexto && <p style={{ color: '#ff4444', fontSize: '0.8em' }}>Error: {errorTexto}</p>}

      <label style={{ fontSize: '0.9em' }}>Tu Nombre:
        <input name="nombre" type="text" placeholder="Ej: Invitado" required 
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white', padding: '10px', marginTop: '5px', borderRadius: '4px' }} 
        />
      </label>
      
      <label style={{ fontSize: '0.9em' }}>¿Qué te ha parecido el portfolio?:
        <textarea name="opinion" placeholder="Cuéntame qué te ha parecido el entorno 3D, la terminal..." required 
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid #444', color: 'white', padding: '10px', marginTop: '5px', height: '100px', borderRadius: '4px', resize: 'none' }} 
        />
      </label>
      
      <button type="submit" 
        style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', borderRadius: '4px', transition: '0.3s' }}
      >
        Enviar opinión
      </button>
    </form>
  );
}