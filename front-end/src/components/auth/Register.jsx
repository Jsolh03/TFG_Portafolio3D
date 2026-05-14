import React, { useState, Suspense } from 'react';
import Spline from '@splinetool/react-spline';
import { API_BASE } from '../../config';
import { ROOM_URLS, ROOM_NAMES ,ROOM_IMAGES} from '../../data/roomUrls';

const ROOM_KEYS = Object.keys(ROOM_URLS);

export default function Register({ onRegisterSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    roomType: ROOM_KEYS[0],
    font: 'Inter',
    zoneFunctions: { zona1: 'pc', zona2: 'cv', zona3: 'bed' },
    apps: ['terminal', 'cv'],
    // CV Fields
    tagline: '',
    aboutMe: '',
    skillsString: '', // comma separated
    email: '',
    linkedin: '',
    github: '',
    profileImg: ''
  });

  const [imgStatus, setImgStatus] = useState('idle'); // idle | loading | ok | error
  
  const [roomIndex, setRoomIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const availableApps = [
    { id: 'terminal', label: 'Terminal.exe' },
    { id: 'ide', label: 'IDE_Dev.app' },
    { id: 'cv', label: 'Mi_CV.exe' },
    { id: 'encuesta', label: 'Feedback.exe' },
    { id: 'info', label: 'Información' },
    { id: 'mail', label: 'Mail.exe' }
  ];

  const functionOptions = [
    { id: 'pc', label: 'Abrir PC' },
    { id: 'cv', label: 'Abrir CV' },
    { id: 'bed', label: 'Menú Salir' },
    { id: 'encuesta', label: 'Feedback' },
    { id: 'none', label: 'Nada' }
  ];

  // Valida que la URL apunte a una imagen real
  const validateImageUrl = (url) => {
    if (!url) { setImgStatus('idle'); return; }
    // Comprobación rápida por extensión
    const hasImgExtension = /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(url);
    if (!hasImgExtension) {
      // Intenta igualmente cargarla (Imgur, CDNs sin extensión, etc.)
    }
    setImgStatus('loading');
    const img = new Image();
    img.onload  = () => setImgStatus('ok');
    img.onerror = () => setImgStatus('error');
    img.src = url;
  };

  const validateGithub = (url) => {
    if (!url) { setGithubStatus('idle'); return; }
    const valid = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/?$/.test(url.trim());
    setGithubStatus(valid ? 'ok' : 'error');
  };
 
  const validateLinkedin = (url) => {
    if (!url) { setLinkedinStatus('idle'); return; }
    const valid = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub|company)\/[A-Za-z0-9_-]+\/?/.test(url.trim());
    setLinkedinStatus(valid ? 'ok' : 'error');
  };

  const fontOptions = [
    { id: 'Inter', label: 'Inter (Moderna)' },
    { id: 'Roboto Mono', label: 'Roboto Mono (Code)' },
    { id: 'Times New Roman', label: 'Times New Roman (Clásica)' },
    { id: 'Comic Sans MS', label: 'Comic Sans (Diversión)' }
  ];

  const nextRoom = () => {
    const nextIdx = (roomIndex + 1) % ROOM_KEYS.length;
    setRoomIndex(nextIdx);
    setFormData(prev => ({ ...prev, roomType: ROOM_KEYS[nextIdx] }));
  };

  const prevRoom = () => {
    const prevIdx = (roomIndex - 1 + ROOM_KEYS.length) % ROOM_KEYS.length;
    setRoomIndex(prevIdx);
    setFormData(prev => ({ ...prev, roomType: ROOM_KEYS[prevIdx] }));
  };

  const handleAppToggle = (appId) => {
    setFormData(prev => ({
      ...prev,
      apps: prev.apps.includes(appId)
        ? prev.apps.filter(a => a !== appId)
        : [...prev.apps, appId]
    }));
  };

  const handleZoneChange = (zone, value) => {
    setFormData(prev => ({ ...prev, zoneFunctions: { ...prev.zoneFunctions, [zone]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (imgStatus === 'error') { setError('La URL de la foto no es una imagen válida.'); setLoading(false); return; }

    // Preparar el objeto final separando los strings
    const finalData = {
      ...formData,
      skills: formData.skillsString.split(',').map(s => s.trim()).filter(s => s !== ''),
      contact: {
        email: formData.email,
        linkedin: formData.linkedin,
        github: formData.github
      }
    };

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar');
      
      onRegisterSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="login-box register-box" 
      style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      onKeyDown={e => e.stopPropagation()}
      onKeyUp={e => e.stopPropagation()}
    >
      <h1 className="login-title">NEW_USER_SETUP</h1>
      {error && <p style={{ color: '#f85149', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* CAROUSEL HABITACIONES */}
        <div style={{ background: '#010409', borderRadius: '8px', padding: '15px', border: '1px solid #30363d' }}>
          <h3 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#c9d1d9', fontSize: '0.85rem', letterSpacing: '1px' }}>SELECCIONA TU HABITACIÓN</h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <button type="button" onClick={prevRoom} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '12px 16px', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}>◀</button>

            <div style={{ flex: 1, height: '260px', borderRadius: '6px', overflow: 'hidden', position: 'relative', background: '#0d1117', border: '1px solid #21262d' }}>
              {ROOM_IMAGES?.[ROOM_KEYS[roomIndex]]
                ? <img
                    src={ROOM_IMAGES[ROOM_KEYS[roomIndex]]}
                    alt={ROOM_NAMES[ROOM_KEYS[roomIndex]]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '2rem' }}>🏠</span>
                    <span style={{ fontSize: '0.78rem' }}>{ROOM_NAMES[ROOM_KEYS[roomIndex]]}</span>
                  </div>
              }
            </div>

            <button type="button" onClick={nextRoom} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '12px 16px', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}>▶</button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '10px', color: '#8b949e', fontSize: '0.82rem', letterSpacing: '1px' }}>
            {ROOM_NAMES[ROOM_KEYS[roomIndex]]}
          </p>
        </div>

        {/* BASICS */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{display: 'block', marginBottom: '5px', color: '#c9d1d9'}}>ID de Usuario (Login):</label>
            <input 
              type="text" 
              required
              value={formData.id}
              onChange={e => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '')})}
              style={{ width: '100%', padding: '8px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{display: 'block', marginBottom: '5px', color: '#c9d1d9'}}>Nombre Público:</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '8px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* FUENTE */}
        <div>
          <label style={{display: 'block', marginBottom: '5px', color: '#c9d1d9'}}>Fuente del Sistema:</label>
          <select value={formData.font} onChange={e => setFormData({...formData, font: e.target.value})}
            style={{ width: '100%', padding: '8px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}>
            {fontOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
          </select>
        </div>

        {/* CV DATA */}
        <div style={{ borderTop: '1px solid #30363d', paddingTop: '15px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#c9d1d9' }}>DATOS DEL CURRÍCULUM</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Tagline (Ej: Desarrollador Full-Stack)"
              value={formData.tagline}
              onChange={e => setFormData({...formData, tagline: e.target.value})}
              style={{ padding: '8px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}
            />
            
            <textarea 
              placeholder="Sobre mí..."
              value={formData.aboutMe}
              onChange={e => setFormData({...formData, aboutMe: e.target.value})}
              style={{ padding: '8px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px', minHeight: '80px' }}
            />

            <input 
              type="text" 
              placeholder="Habilidades (separadas por coma: React, Node, SQL)"
              value={formData.skillsString}
              onChange={e => setFormData({...formData, skillsString: e.target.value})}
              style={{ padding: '8px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ flex: 1, padding: '8px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }} />
              <input type="url" placeholder="LinkedIn URL" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} style={{ flex: 1, padding: '8px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }} />
              <input type="url" placeholder="GitHub URL" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} style={{ flex: 1, padding: '8px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* FOTO DE PERFIL */}
        <div style={{ borderTop: '1px solid #30363d', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ margin: '0 0 4px 0', color: '#c9d1d9' }}>FOTO DE PERFIL</h3>
          <p style={{ margin: 0, color: '#6e7681', fontSize: '0.78rem' }}>
            Pega una URL pública de tu foto (Imgur, GitHub, LinkedIn, etc.)
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

            {/* Preview */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
              background: '#161b22', border: `2px solid ${imgStatus === 'ok' ? '#6e40c9' : imgStatus === 'error' ? '#f85149' : '#30363d'}`,
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.2s'
            }}>
              {imgStatus === 'ok'
                ? <img src={formData.profileImg} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '1.6rem', color: '#484f58' }}>👤</span>
              }
            </div>

            {/* Input + estado */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="url"
                placeholder="https://i.imgur.com/tu-foto.jpg"
                value={formData.profileImg}
                onChange={e => {
                  const url = e.target.value;
                  setFormData(prev => ({ ...prev, profileImg: url }));
                  validateImageUrl(url);
                }}
                style={{
                  width: '100%', padding: '8px',
                  background: '#0d1117', color: '#c9d1d9',
                  border: `1px solid ${imgStatus === 'error' ? '#f85149' : '#30363d'}`,
                  borderRadius: '4px', outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: imgStatus === 'ok' ? '#3fb950' : imgStatus === 'error' ? '#f85149' : '#484f58' }}>
                {imgStatus === 'idle'    && 'Sin foto — se usará el avatar por defecto'}
                {imgStatus === 'loading' && '⏳ Verificando imagen...'}
                {imgStatus === 'ok'      && '✓ Imagen válida'}
                {imgStatus === 'error'   && '✗ No se pudo cargar — revisa la URL'}
              </span>
            </div>

          </div>
        </div>

        {/* ZONES */}
        <div style={{ borderTop: '1px solid #30363d', paddingTop: '15px' }}>
          <label style={{display: 'block', marginBottom: '5px', color: '#c9d1d9'}}>Funciones de Interacción (Tecla 'E'):</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{fontSize: '12px', color: '#8b949e'}}>Zona 1</label>
              <select value={formData.zoneFunctions.zona1} onChange={e => handleZoneChange('zona1', e.target.value)}
                style={{ width: '100%', padding: '5px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}>
                {functionOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{fontSize: '12px', color: '#8b949e'}}>Zona 2</label>
              <select value={formData.zoneFunctions.zona2} onChange={e => handleZoneChange('zona2', e.target.value)}
                style={{ width: '100%', padding: '5px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}>
                {functionOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{fontSize: '12px', color: '#8b949e'}}>Zona 3</label>
              <select value={formData.zoneFunctions.zona3} onChange={e => handleZoneChange('zona3', e.target.value)}
                style={{ width: '100%', padding: '5px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}>
                {functionOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* APPS */}
        <div>
          <label style={{display: 'block', marginBottom: '5px', color: '#c9d1d9'}}>Aplicaciones del PC:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            {availableApps.map(app => (
              <label key={app.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b949e', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.apps.includes(app.id)}
                  onChange={() => handleAppToggle(app.id)}
                />
                {app.label}
              </label>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        {error && <p style={{ color: '#f85149', textAlign: 'center', margin: '5px 0', fontWeight: 'bold' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <button type="submit" className="sidebar-link" disabled={loading} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
            {loading ? 'CREANDO...' : 'CREAR USUARIO'}
          </button>
          <button type="button" className="sidebar-link" onClick={onCancel} style={{ flex: 1, justifyContent: 'center', padding: '12px', background: 'transparent', border: '1px solid #30363d' }}>
            CANCELAR
          </button>
        </div>
      </form>
    </div>
  );
}