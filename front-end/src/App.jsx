import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import iconoLaura from './assets/icons_laura/perfil_icon_lau.jpg';
import DynamicCVPage from './pages/DynamicCVPage';
import ProjectIntro from './components/os/ProjectIntro';
import { API_BASE } from './config';

const Room = lazy(() => import('./pages/Room'));

function Portfolio() {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const handleLogin = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}`);
      if (!response.ok) throw new Error('Usuario no encontrado');
      const data = await response.json();
      setUserData(data);
      setShowIntro(true);
    } catch (error) {
      alert('Error de conexión con MongoDB');
    } finally {
      setIsLoading(false);
    }
  };

  // Room se carga siempre que haya userData.
  // ProjectIntro aparece encima como overlay cerrable.
  if (userData) {
    return (
      <Suspense fallback={<div className="loading-screen">Cargando 3D...</div>}>
        <Room userData={userData} onLogout={() => { setUserData(null); setShowIntro(false); }} />
        {showIntro && <ProjectIntro onContinue={() => setShowIntro(false)} />}
      </Suspense>
    );
  }

  return (
    <div className="main-container login-screen">
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