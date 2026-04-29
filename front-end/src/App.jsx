import React, { useState, Suspense, lazy } from 'react';
import './styles/App.css';
import iconoLaura from './assets/icons_laura/perfil_icon_lau.jpg';

// IMPORTANTE: Ahora solo cargamos UN componente genérico
const Room = lazy(() => import('./pages/Room'));

export default function App() {
  const [userData, setUserData] = useState(null); // Guardamos el objeto completo del usuario
  const [isLoading, setIsLoading] = useState(false);

  // Función para cargar datos desde Mongo
  const handleLogin = async (userId) => {
    setIsLoading(true);
    
    try {
      // 1. Hacemos la petición a tu servidor Node.js
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error('No se encontró el usuario en la base de datos');
      }

      // 2. Convertimos la respuesta a JSON
      const data = await response.json();
      
      // 3. Guardamos los datos reales en el estado
      setUserData(data);
      
    } catch (error) {
      console.error("Error al conectar con MongoDB:", error);
      alert("Error de conexión: Asegúrate de que el servidor (backend) esté encendido.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUserData(null);
  };

  // Si hay datos de usuario, mostramos la habitación genérica
  if (userData) {
    return (
      <Suspense fallback={<div className="loading-screen">Sincronizando entorno 3D...</div>}>
        <Room userData={userData} onLogout={handleLogout} />
      </Suspense>
    );
  }

  return (
    <div className="main-container login-screen">
      <div className="login-box">
        <h1 className="login-title">SYSTEM_LOGIN</h1>
        <p className="login-subtitle">Selecciona el perfil de acceso</p>
        
        {isLoading ? (
          <div className="loading-text">Accediendo a la base de datos...</div>
        ) : (
          <div className="user-grid">
            {/* BOTÓN KHALED */}
            <button className="user-card" onClick={() => handleLogin('khaled')}>
              <div className="avatar khaled-avatar"></div>
              <h2>Khaled Solh</h2>
              <span className="role-tag">Full-Stack & AI</span>
            </button>

            {/* BOTÓN LAURA */}
            <button className="user-card" onClick={() => handleLogin('laura')}>
              <div className="avatar laura-avatar" style={{
                border: '3px solid #a034e7',
                overflow: 'hidden',
                boxShadow: '0 0 15px rgba(160, 52, 231, 0.4)',
                padding: 0,
                backgroundColor: 'transparent'
              }}>
                <img src={iconoLaura} alt="Perfil Laura" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h2>Laura Jara</h2>
              <span className="role-tag">Back-End Developer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}