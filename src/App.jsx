import React, { useState, Suspense, lazy } from 'react';
import './styles/App.css';

// Cargamos las habitaciones desde la carpeta pages
const RoomKhaled = lazy(() => import('./pages/RoomKhaled'));
const RoomLaura = lazy(() => import('./pages/RoomLaura'));

export default function App() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogout = () => {
    setSelectedUser(null);
  };

  if (selectedUser === 'khaled') {
    return (
      <Suspense fallback={<div className="loading-screen">Cargando servidor de Khaled...</div>}>
        <RoomKhaled onLogout={handleLogout} />
      </Suspense>
    );
  }

  if (selectedUser === 'laura') {
    return (
      <Suspense fallback={<div className="loading-screen">Cargando servidor de Laura...</div>}>
        <RoomLaura onLogout={handleLogout} />
      </Suspense>
    );
  }

  // PANTALLA DE LOGIN
  return (
    <div className="main-container login-screen">
      <div className="login-box">
        <h1 className="login-title">SYSTEM_LOGIN</h1>
        <p className="login-subtitle">Selecciona el perfil de acceso</p>
        
        <div className="user-grid">
          <button className="user-card" onClick={() => setSelectedUser('khaled')}>
            <div className="avatar khaled-avatar"></div>
            <h2>Khaled Solh</h2>
            <span className="role-tag">Full-Stack & AI</span>
          </button>

          <button className="user-card" onClick={() => setSelectedUser('laura')}>
            <div className="avatar laura-avatar"></div>
            <h2>Laura Jara</h2>
            <span className="role-tag">Back-End Developer</span>
          </button>
        </div>
      </div>
    </div>
  );
}