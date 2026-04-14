import React, { useState } from 'react';
import { supabase } from '/src/lib/supabaseClient';

export default function LauraEncuestaApp() {
  // Estados para controlar la aplicación
  const [enviado, setEnviado] = useState(false);
  const [errorTexto, setErrorTexto] = useState('');
  const [resultados, setResultados] = useState([]); // Aquí guardaremos la lista de comentarios

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nuevaEncuesta = {
      nombre: formData.get('nombre'),
      tecnologia: formData.get('tecnologia'),
      comentario: formData.get('comentario')
    };

    // 1. Guardamos el dato (INSERT)
    const { error: errorInsert } = await supabase
      .from('encuestas')
      .insert([nuevaEncuesta]);

    if (errorInsert) {
      setErrorTexto(errorInsert.message);
      return; // Si hay error al guardar, paramos aquí
    }

    // 2. Si se ha guardado bien, pedimos TODOS los datos (SELECT)
    const { data: datos, error: errorSelect } = await supabase
      .from('encuestas')
      .select('*')
      .order('created_at', { ascending: false }); // Los más recientes primero

    if (errorSelect) {
      setErrorTexto(errorSelect.message);
    } else {
      setResultados(datos); // Guardamos la lista en la memoria de React
      setEnviado(true);     // Cambiamos la pantalla para mostrar la lista
    }
  };

  // --- PANTALLA 2: Cuando ya se ha enviado (Muestra los resultados) ---
  if (enviado) {
    return (
      <div style={{ padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', overflowY: 'auto' }}>
        <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', color: '#10b981' }}>¡Gracias por participar!</h3>
        <p>Aquí tienes las valoraciones de otros visitantes:</p>
        
        {/* Pintamos la lista de resultados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {resultados.map((item) => (
            <div key={item.id} style={{ background: '#333', padding: '12px', borderRadius: '5px', borderLeft: '4px solid #4f46e5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong style={{ color: '#4af626' }}>{item.nombre}</strong>
                <span style={{ fontSize: '0.8em', color: '#aaa', background: '#222', padding: '2px 6px', borderRadius: '4px' }}>
                  {item.tecnologia}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9em', color: '#ddd' }}>"{item.comentario}"</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- PANTALLA 1: El Formulario (Si no se ha enviado aún) ---
  return (
    <form 
      onSubmit={handleSubmit} 
      onKeyDown={(e) => e.stopPropagation()} /* El escudo para los espacios */
      style={{ padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', overflowY: 'auto' }}
    >
      <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>ENCUESTA BACK-END</h3>
      
      {errorTexto && <p style={{ color: 'red', background: '#ff000022', padding: '10px' }}>Error: {errorTexto}</p>}

      <label>Tu Nombre:
        <input name="nombre" type="text" required style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '8px', marginTop: '5px' }} />
      </label>
      
      <label>Tecnología favorita:
        <select name="tecnologia" style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '8px', marginTop: '5px' }}>
          <option value="Java">Java / Spring Boot</option>
          <option value="Python">Python</option>
          <option value="NodeJS">Node.js</option>
          <option value="SQL">Bases de Datos (SQL)</option>
        </select>
      </label>
      
      <label>Comentario:
        <textarea name="comentario" required style={{ width: '100%', background: '#333', border: '1px solid #555', color: 'white', padding: '8px', marginTop: '5px', height: '60px' }}></textarea>
      </label>
      
      <button type="submit" style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
        Enviar y ver resultados
      </button>
    </form>
  );
}