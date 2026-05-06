import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { translations } from '../data/translations';
import ModalPC from '../components/os/ModalPC';
import ProjectIntro from '../components/os/ProjectIntro';
import { ROOM_URLS } from '../data/roomUrls';

export default function Room({ userData, onLogout }) {
  const [showDesktop, setShowDesktop] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [lang, setLang] = useState('ES');

  // ESTADOS DEL MENÚ LATERAL
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showProjectInfo, setShowProjectInfo] = useState(false);

  const splineRef = useRef(null);

  const getSceneUrl = () => {
    if (!userData) return ROOM_URLS.generic1;
    return ROOM_URLS[userData.roomType] || ROOM_URLS.generic1;
  };

  // Lógica de interacción (Teclado)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!splineRef.current || showDesktop || showBed) return;

      const zona = splineRef.current.getVariable('zona_activa');

      if (key === 'e' && zona) {
        // Obtenemos qué función tiene asignada esta zona el usuario
        // Por defecto: zona1=pc, zona2=cv, zona3=bed
        const zoneFunctions = userData?.zoneFunctions || { zona1: 'pc', zona2: 'cv', zona3: 'bed' };
        let action = 'none';

        if (zona === 1) action = zoneFunctions.zona1;
        if (zona === 2) action = zoneFunctions.zona2;
        if (zona === 3) action = zoneFunctions.zona3;

        switch (action) {
          case 'pc':
            setShowDesktop(true);
            break;
          case 'cv':
            const idSeguro = userData?.id || 'guest';
            window.open(`/cv/${idSeguro}`, '_blank');
            break;
          case 'bed':
            setShowBed(true);
            break;
          case 'encuesta':
            // Si quieres abrir algo específico, o simplemente abrir el PC en la app de encuesta
            setShowDesktop(true);
            break;
          default:
            break;
        }
        
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
    <div className="room-container" style={{ 
      fontFamily: userData?.font || 'Inter, sans-serif',
      '--sys-font': userData?.font || 'Inter, sans-serif'
    }}>

      <div className="spline-fixed-bg">
        <Spline
          style={{ width: '100%', height: '100%' }}
          scene={getSceneUrl()}
          onLoad={(spline) => { 
            splineRef.current = spline;
          }}
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
        <ModalPC onClose={() => setShowDesktop(false)} user={userData?.id} userData={userData} />
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