import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import iconoLaura from './assets/icons_laura/perfil_icon_lau.jpg';
import DynamicCVPage from './pages/DynamicCVPage';
import ProjectIntro from './components/os/ProjectIntro';
import Register from './components/auth/Register';
import { API_BASE } from './config';

const Room = lazy(() => import('./pages/Room'));

function Portfolio() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [view, setView] = useState('login');
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [devMode, setDevMode] = useState(false);
  const [devPass, setDevPass] = useState('');
  const [devAuth, setDevAuth] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const handleLogin = async (userId) => {
    setIsLoading(true);
    setLoginError('');
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Usuario inexistente');
      }
      const data = await response.json();
      setUserData(data);
      setShowIntro(true);
    } catch (error) {
      setLoginError(error.message === 'Usuario inexistente' ? 'Usuario inexistente' : 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    setUserData({
      id: 'guest',
      name: 'Invitado',
      isGuest: true,
      roomStyle: 1,
      characterId: 1,
      deskSlot: 1,
      bedSlot: 1,
      apps: ['terminal', 'ide', 'cv', 'encuesta', 'info', 'mail']
    });
    setShowIntro(true);
  };

  const loadAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      if (res.ok) setAllUsers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleDevAuth = (e) => {
    e.preventDefault();
    if (devPass === 'Qwerty12345*') {
      setDevAuth(true);
      loadAllUsers();
    } else {
      alert('Contraseña incorrecta');
      setDevPass('');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(`¿Seguro que quieres borrar al usuario ${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) loadAllUsers();
      else alert('Error al borrar usuario');
    } catch (e) {
      console.error(e);
    }
  };

  // Room se carga siempre que haya userData.
  // ProjectIntro aparece encima como overlay cerrable.
  if (userData) {
    return (
      <Suspense fallback={<div className="loading-screen">Cargando 3D...</div>}>
        <Room userData={userData} onLogout={() => { setUserData(null); setShowIntro(false); setView('login'); }} />
        {showIntro && <ProjectIntro onContinue={() => setShowIntro(false)} />}
      </Suspense>
    );
  }

  if (view === 'register') {
    return (
      <div className="main-container login-screen">
        <Register 
          onRegisterSuccess={(data) => {
            setUserData(data);
            setShowIntro(true);
          }}
          onCancel={() => setView('login')}
        />
      </div>
    );
  }

  return (
    <div className="main-container login-screen">

      {/* DEV MODE BUTTON */}
      <button 
        onClick={() => setDevMode(true)}
        style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: '1px solid #30363d', color: '#8b949e', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>
        ⚙ MODO DEV
      </button>

      {/* DEV MODE MODAL */}
      {devMode && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,13,18,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '30px', width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ color: '#f85149', margin: 0 }}>PANEL DE DESARROLLADOR</h2>
              <button onClick={() => {setDevMode(false); setDevAuth(false); setDevPass('');}} style={{ background: 'none', border: 'none', color: '#c9d1d9', cursor: 'pointer' }}>✕ Cerrar</button>
            </div>
            
            {!devAuth ? (
              <form onSubmit={handleDevAuth} style={{ display: 'flex', gap: '20px' }}>
                <input type="password" placeholder="Contraseña de administrador..." value={devPass} onChange={e => setDevPass(e.target.value)} style={{ flex: 1, padding: '10px', background: '#0d1117', color: 'white', border: '1px solid #30363d', borderRadius: '4px' }} />
                <button type="submit" className="sidebar-link" style={{ padding: '10px 20px', background: '#f85149', color: 'white', border: 'none', borderRadius: '4px' }}>VERIFICAR</button>
              </form>
            ) : (
              <div>
                <p style={{ color: '#8b949e', fontSize: '12px' }}>Total de usuarios registrados: {allUsers.length}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {allUsers.map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1117', padding: '10px', borderRadius: '4px', border: '1px solid #21262d' }}>
                      <div>
                        <strong style={{ color: '#e6edf3' }}>{u.id}</strong> <span style={{ color: '#8b949e', fontSize: '12px' }}>({u.name})</span>
                        <div style={{ fontSize: '11px', color: '#a034e7' }}>Habitación: {u.roomType}</div>
                      </div>
                      {u.id !== 'khaled' && u.id !== 'laura' && (
                        <button onClick={() => deleteUser(u.id)} style={{ background: 'transparent', color: '#f85149', border: '1px solid #f85149', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="login-box">
        <h1 className="login-title">SYSTEM_LOGIN</h1>
        {isLoading && <p style={{ color: '#6e7681', textAlign: 'center', marginTop: 0 }}>Conectando...</p>}
        <div className="user-grid">
          <button className="user-card" onClick={() => handleLogin('khaled')} disabled={isLoading}>
            <div className="avatar"></div>
            <h2>Khaled Solh</h2>
          </button>
          <button className="user-card" onClick={() => handleLogin('laura')} disabled={isLoading}>
            <div className="avatar">
              <img src={iconoLaura} alt="Laura" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2>Laura Jara</h2>
          </button>
        </div>

        {/* LOG IN MANUAL PARA OTROS USUARIOS */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Introduce tu ID de usuario..." 
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              style={{ flex: 1, padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '4px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && loginId.trim()) {
                  handleLogin(loginId.toLowerCase().trim());
                }
              }}
            />
            <button 
              className="sidebar-link" 
              onClick={() => handleLogin(loginId.toLowerCase().trim())} 
              disabled={isLoading || !loginId.trim()}
              style={{ padding: '10px 20px', background: '#21262d', border: '1px solid #30363d', borderRadius: '4px', color: '#c9d1d9', cursor: 'pointer' }}
            >
              ENTRAR
            </button>
          </div>
          {loginError && <span style={{ color: '#f85149', fontSize: '14px', marginTop: '5px', textAlign: 'center' }}>{loginError}</span>}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="sidebar-link" onClick={handleGuest} disabled={isLoading} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
            ACCESO INVITADO
          </button>
          <button className="sidebar-link" onClick={() => setView('register')} disabled={isLoading} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
            NUEVO USUARIO
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/cv/:userId" element={<DynamicCVPage />} />
      </Routes>
    </Router>
  );
}