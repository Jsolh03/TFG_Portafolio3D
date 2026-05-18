import React, { useState, Suspense, lazy } from 'react';
import './App.css';

// Lazy Loading: React solo descargará el código 3D de la persona elegida
const RoomKhaled = lazy(() => import('./RoomKhaled'));
const RoomLaura = lazy(() => import('./RoomLaura'));

export default function App() {
  const [selectedUser, setSelectedUser] = useState(null);

  // Si elige a Khaled
  if (selectedUser === 'khaled') {
    return (
      <Suspense fallback={<div className="loading-screen">Cargando servidor...</div>}>
        <RoomKhaled onLogout={() => setSelectedUser(null)} />
      </Suspense>
    );
  }

  // Si elige a Laura
  if (selectedUser === 'laura') {
    return (
      <Suspense fallback={<div className="loading-screen">Cargando servidor...</div>}>
        <RoomLaura onLogout={() => setSelectedUser(null)} />
      </Suspense>
    );
  }

  // PANTALLA DE LOGIN (Si selectedUser es null)
  return (
    <div className="main-container login-screen">
      <div className="login-box">
        <h1 className="login-title">SYSTEM_LOGIN</h1>
        <p className="login-subtitle">Selecciona el perfil de acceso</p>
        
        <div className="user-grid">
          {/* Tarjeta Khaled */}
          <button className="user-card" onClick={() => setSelectedUser('khaled')}>
            <div className="avatar khaled-avatar"></div>
            <h2>Khaled Solh</h2>
            <span className="role-tag">Full-Stack & AI</span>
          </button>

          {/* Tarjeta Laura */}
          <button className="user-card" onClick={() => setSelectedUser('laura')}>
            <div className="avatar laura-avatar"></div>
            <h2>Laura</h2>
            <span className="role-tag">Back-End Developer</span>
          </button>
        </div>
      </div>
    </div>
  );
}