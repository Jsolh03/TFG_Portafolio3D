import React, { useState, Suspense, lazy, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import DynamicCVPage from './pages/DynamicCVPage';
import ProjectIntro from './components/os/ProjectIntro';
import Register from './components/auth/Register';
import DevPortal from './pages/DevPortal';
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

  // Theme & Font state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.dataset.theme = saved;
    return saved;
  });
  const [font, setFont] = useState(() => {
    const saved = localStorage.getItem('font') || 'Inter';
    document.documentElement.style.setProperty('--font-family', saved);
    return saved;
  });

  // Appearance panel state
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('font', font);
    document.documentElement.style.setProperty('--font-family', font);
  }, [font]);

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
      setLoginError(error.message === 'Usuario inexistente' ? 'Usuario inexistente' : 'Error de conexiÃ³n');
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
      alert('ContraseÃ±a incorrecta');
      setDevPass('');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(`Â¿Seguro que quieres borrar al usuario ${id}?`)) return;
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
      {/* Background layer with gradient and particles */}
      <div className="background-layer">
        <div className="background-gradient"></div>
        <div className="background-particles" aria-hidden="true"></div>
      </div>

      {/* Dev mode button (top right) */}
      <button
        className="dev-mode-button"
        onClick={() => window.location.assign('/dev')}
        aria-label="Modo desarrollador"
      >
        KyL™
      </button>

      {/* Glassmorphism overlay container */}
      <div className="overlay-glass">
        {/* Hero section */}
        <div className="hero">
          <h1 className="hero-title">Portfolio</h1>
          <p className="hero-subtitle">Plataforma de gestión inteligente de espacios y perfiles</p>
          <p className="hero-description">Conecta, colabora y gestiona experiencias de manera profesional y segura.</p>
        </div>

        {/* Login options */}
        <div className="login-options">
          {/* Developer cards (Khaled & Laura) */}
          <div className="user-cards">
            <button className="user-card" onClick={() => handleLogin('khaled')} disabled={isLoading}>
              <div className="avatar">
                {/* placeholder for avatar */}
              </div>
              <h2>Khaled Solh</h2>
            </button>
            <button className="user-card" onClick={() => handleLogin('laura')} disabled={isLoading}>
              <div className="avatar">
                <img
                  src="https://i.pinimg.com/736x/f3/8f/70/f38f7066edb3f22c64e57faa320abad5.jpg"
                  alt="Laura"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h2>Laura Jara</h2>
            </button>
          </div>

          {/* Manual login input */}
          <div className="manual-input">
            <div className="input-group">
              <input
                type="text"
                placeholder="Introduce tu ID de usuario..."
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && loginId.trim()) {
                    handleLogin(loginId.toLowerCase().trim());
                  }
                }}
                disabled={isLoading}
              />
              <button
                className="sidebar-link"
                onClick={() => handleLogin(loginId.toLowerCase().trim())}
                disabled={isLoading || !loginId.trim()}
              >
                ENTRAR
              </button>
            </div>
            {loginError && <span className="login-error">{loginError}</span>}
          </div>

          {/* Guest and Register buttons */}
          <div className="guest-register">
            <button className="sidebar-link" onClick={handleGuest} disabled={isLoading}>
              ACCESO INVITADO
            </button>
            <button className="sidebar-link" onClick={() => setView('register')} disabled={isLoading}>
              NUEVO USUARIO
            </button>
          </div>
        </div>
      </div>

      {/* Floating Appearance Button */}
      <div className="appearance-float">
        <button className="appearance-btn" onClick={() => setAppearanceOpen(!appearanceOpen)} aria-label="Apariencia">
          &#x2699;&#xFE0F;
        </button>
        <div className={`appearance-panel ${appearanceOpen ? 'show' : ''}`}>
          <div className="appearance-section">
            <h3>Tema</h3>
            <div className="theme-options">
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={(e) => setTheme(e.target.value)}
                />
                Oscuro
              </label>
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={(e) => setTheme(e.target.value)}
                />
                Claro
              </label>
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="blue"
                  checked={theme === 'blue'}
                  onChange={(e) => setTheme(e.target.value)}
                />
                Azul
              </label>
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="purple"
                  checked={theme === 'purple'}
                  onChange={(e) => setTheme(e.target.value)}
                />
                Morado
              </label>
              <label>
                <input
                  type="radio"
                  name="theme"
                  value="green"
                  checked={theme === 'green'}
                  onChange={(e) => setTheme(e.target.value)}
                />
                Verde
              </label>
            </div>
          </div>
          <div className="appearance-section">
            <h3>Fuente</h3>
            <div className="font-options">
              <label>
                <input
                  type="radio"
                  name="font"
                  value="Inter"
                  checked={font === 'Inter'}
                  onChange={(e) => setFont(e.target.value)}
                />
                Inter
              </label>
              <label>
                <input
                  type="radio"
                  name="font"
                  value="Roboto"
                  checked={font === 'Roboto'}
                  onChange={(e) => setFont(e.target.value)}
                />
                Roboto
              </label>
              <label>
                <input
                  type="radio"
                  name="font"
                  value="Open Sans"
                  checked={font === 'Open Sans'}
                  onChange={(e) => setFont(e.target.value)}
                />
                Open Sans
              </label>
              <label>
                <input
                  type="radio"
                  name="font"
                  value="Lato"
                  checked={font === 'Lato'}
                  onChange={(e) => setFont(e.target.value)}
                />
                Lato
              </label>
            </div>
          </div>
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
        <Route path="/dev" element={<DevPortal />} />
        <Route path="/cv/:userId" element={<DynamicCVPage />} />
      </Routes>
    </Router>
  );
}