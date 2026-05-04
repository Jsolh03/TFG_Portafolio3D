import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { translations } from '../data/translations';
import ModalPC from '../components/os/ModalPC';

export default function Room({ userData, onLogout }) {
  const [showDesktop, setShowDesktop] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [lang, setLang] = useState('ES');

  // ESTADOS DEL MENÚ LATERAL
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  const splineRef = useRef(null);
  const SCENE_URL = "https://prod.spline.design/cveZhllWScLLehFW/scene.splinecode?v=2";

  // Lógica de interacción (Teclado)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!splineRef.current || showDesktop || showBed) return;

      const zona = splineRef.current.getVariable('zona_activa');

      if (key === 'e') {
        if (zona === 1 || zona === 2) setShowDesktop(true);
        if (zona === 3) setShowBed(true);
        document.exitPointerLock?.();
      }

      if (key === 'escape') {
        setShowDesktop(false);
        setShowBed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDesktop, showBed]);

  return (
    <div className="room-container">

      {/* 1. LA HABITACIÓN (Fondo Fijo) */}
      <div className="spline-fixed-bg">
        <Spline
          style={{ width: '100%', height: '100%' }} // Estilo directo para forzar
          scene={userData?.splineScene || SCENE_URL}
          onLoad={(spline) => { splineRef.current = spline; }}
        />
      </div>

      {/* 2. MENU LATERAL (Sidebar) */}
      <div className={`sidebar-room ${isMenuOpen ? 'expanded' : 'collapsed'}`}>
        <button className="sidebar-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '◀' : '▶'}
        </button>

        <div className="sidebar-inner">
          <h1 className="sidebar-logo">SYSTEM<span>.</span></h1>

          <nav className="sidebar-nav">
            <button className="sidebar-link" onClick={() => setShowProjectInfo(true)}>
              INFO PROYECTO
            </button>
            <button className="sidebar-link" onClick={onLogout}>
              CAMBIAR HABITACIÓN
            </button>
            <button className="sidebar-link disabled">
              CAMBIAR IDIOMA ({lang})
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="controls-hint">
              <p>WASD - Moverse</p>
              <p>E - Interactuar</p>
            </div>
            <p className="user-tag">USER: {userData?.id?.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* 3. MODALES (PC, Cama, Info) */}
      {showDesktop && (
        <ModalPC onClose={() => setShowDesktop(false)} user={userData?.id} />
      )}

      {showProjectInfo && (
        <div className="modal-glass" onClick={() => setShowProjectInfo(false)}>
          <div className="modal-content info-box" onClick={e => e.stopPropagation()}>
            <header className="info-header">
              <h3>INFORMACIÓN DEL PROYECTO</h3>
              <button onClick={() => setShowProjectInfo(false)}>✕</button>
            </header>
            <div className="info-body">
              <p><b>Desarrollo:</b> Portfolio Interactivo 3D</p>
              <p><b>Tecnologías:</b> React, Spline, Node.js, MongoDB Atlas.</p>
              <p><b>Estado:</b> v1.0.4 - Room_Environment</p>
            </div>
          </div>
        </div>
      )}

      {showBed && (
        <div className="modal-glass">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <h2>¿Quieres salir?</h2>
            <button className="btn-nav" onClick={onLogout}>SÍ, SALIR</button>
            <button className="btn-nav" onClick={() => setShowBed(false)}>NO, QUEDARME</button>
          </div>
        </div>
      )}
    </div>
  );
}