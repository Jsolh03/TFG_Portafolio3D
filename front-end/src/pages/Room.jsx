import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { translations } from '../data/translations';
import ModalPC from '../components/os/ModalPC';
import ProjectIntro from '../components/os/ProjectIntro';

export default function Room({ userData, onLogout }) {
  const [showDesktop, setShowDesktop] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [lang, setLang] = useState('ES');

  // ESTADOS DEL MENÚ LATERAL
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  const splineRef = useRef(null);
  const SCENE_URL = "https://prod.spline.design/cveZhllWScLLehFW/scene.splinecode?v=1";

  // Lógica de interacción (Teclado)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!splineRef.current || showDesktop || showBed) return;

      const zona = splineRef.current.getVariable('zona_activa');

      if (key === 'e') {
        if (zona === 1) setShowDesktop(true);

        if (zona === 2) {
          const idSeguro = userData?.id || userData?._id || 'laura';
          window.open(`/cv/${idSeguro}`, '_blank');
        }

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

      {/* 1. LA HABITACIÓN*/}
      <div className="spline-fixed-bg">
        <Spline
          style={{ width: '100%', height: '100%' }}
          scene={userData?.splineScene || SCENE_URL}
          onLoad={(spline) => { splineRef.current = spline; }}
        />
      </div>

      {/* 2. MENU LATERAL */}
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
        <ProjectIntro onClose={() => setShowProjectInfo(false)} />
      )}

      {/*CAMA MENU SALIR */}
      {showBed && (
        <div className="modal-glass" onClick={() => setShowBed(false)}>
          <div className="modal-content bed-modal-content" onClick={e => e.stopPropagation()}>
            <h2>¿DESEAS SALIR?</h2>
            <div className="bed-btn-group">
              <button className="btn-nav" onClick={onLogout} style={{ color: '#f85149' }}>
                SÍ, SALIR DE LA HABITACIÓN
              </button>
              <button className="btn-nav" onClick={() => setShowBed(false)}>
                NO, SEGUIR EXPLORANDO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}