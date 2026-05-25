import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import Spline from '@splinetool/react-spline';
import { useT } from '../context/LanguageContext';
import ModalPC from '../components/os/ModalPC';
import ProjectIntro from '../components/os/ProjectIntro';
import KhaledWelcome from '../components/os/KhaledWelcome';
import LauraWelcome from '../components/os/LauraWelcome';
import FloatingSettingsButton from '../components/ui/FloatingSettingsButton';
import { AVAILABLE_ROOMS } from '../data/roomUrls';

const ArcadeApp = lazy(() => import('../components/os/ArcadeApp'));

const ARCADE_OBJECT_NAMES = new Set(['arcade_machine', 'arcade', 'recreativa', 'arcadeapp', 'maquina_arcade', 'arcade_recreativa']);

export default function Room({ userData, onLogout }) {
  const t = useT();
  // Las bienvenidas KhaledWelcome y LauraWelcome son personales — solo aparecen
  // si el visitante está mirando la habitación de su autor original. Cualquier
  // otro usuario que copie su roomType verá la bienvenida estándar.
  const isKhaledRoom = userData?.id === 'khaled';
  const isLauraRoom = userData?.id === 'laura';

  const [showDesktop, setShowDesktop] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  const [showArcade, setShowArcade] = useState(false);
  const [showKhaledWelcome, setShowKhaledWelcome] = useState(isKhaledRoom);
  const [showLauraWelcome, setShowLauraWelcome] = useState(isLauraRoom);
  const [splineLoaded, setSplineLoaded] = useState(false);

  const splineRef = useRef(null);

  const getSceneUrl = () => {
    const defaultRoom = AVAILABLE_ROOMS.find(r => r.id === 'generic1') || AVAILABLE_ROOMS[0];
    if (!userData || !userData.roomType) return defaultRoom.url;
    const selectedRoom = AVAILABLE_ROOMS.find(r => r.id === userData.roomType);
    return selectedRoom ? selectedRoom.url : defaultRoom.url;
  };

  const handleSplineLoad = (spline) => {
    splineRef.current = spline;
    setSplineLoaded(true);
    try {
      spline.addEventListener('mouseDown', (e) => {
        const name = (e?.target?.name || '').toLowerCase();
        // Hacemos que sea robusto: si el nombre del objeto clicado contiene 'arcade' o 'recreativa', activamos el trigger.
        // Esto soluciona problemas cuando el arcade es un grupo y se hace click en un sub-objeto (mesh) con otro nombre.
        const isArcadeClick = [...ARCADE_OBJECT_NAMES].some(keyword => name.includes(keyword)) ||
                             name.includes('arcade') || 
                             name.includes('recreativa');
        
        if (isArcadeClick) {
          setShowArcade(true);
        }
      });
    } catch (err) {
      console.warn('No se pudo registrar listener de Spline para arcade:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!splineRef.current || showDesktop || showBed || showArcade) return;

      const zona = Number(splineRef.current.getVariable('zona_activa'));

      if (key === 'e' && zona > 0) {
        const zoneFunctions = userData?.zoneFunctions || { zona1: 'pc', zona2: 'cv', zona3: 'bed', zona4: 'arcade' };
        let action = 'none';

        if (zona === 1) action = zoneFunctions.zona1;
        if (zona === 2) action = zoneFunctions.zona2;
        if (zona === 3) action = zoneFunctions.zona3;
        if (zona === 4) action = zoneFunctions.zona4 || 'arcade';

        console.log(`[DEBUG 3D] Tecla 'E' presionada. zona_activa (de Spline) = ${zona}, acción determinada = ${action}`);

        switch (action) {
          case 'pc':
            setShowDesktop(true);
            break;
          case 'cv': {
            const idSeguro = userData?.id || 'guest';
            window.open(`/cv/${idSeguro}`, '_blank');
            break;
          }
          case 'bed':
            setShowBed(true);
            break;
          case 'encuesta':
            setShowDesktop(true);
            break;
          case 'arcade':
            setShowArcade(true);
            break;
          default: break;
        }

        document.exitPointerLock?.();
      }

      if (key === 'escape') {
        setShowDesktop(false);
        setShowBed(false);
        setShowArcade(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDesktop, showBed, showArcade, userData]);

  return (
    <div className="room-container" style={{
      fontFamily: userData?.font || 'inherit',
      '--sys-font': userData?.font || 'inherit'
    }}>
      <div className="spline-fixed-bg">
        <Spline
          style={{ width: '100%', height: '100%' }}
          scene={getSceneUrl()}
          onLoad={handleSplineLoad}
        />
      </div>

      {!splineLoaded && (
        <div className="room-loader" role="status" aria-live="polite">
          <div className="room-loader-spinner" />
          <div className="room-loader-text">{t('room.loading') || 'Cargando habitación'}</div>
          <div className="room-loader-sub">
            {isKhaledRoom 
              ? 'Esta habitación contiene modelos 3D muy detallados y texturas pesadas, por lo que puede tardar un poco más en cargar. ¡Gracias por tu paciencia! 🚀'
              : (t('room.loadingHint') || 'preparando escena 3D')
            }
          </div>
        </div>
      )}

      <div className={`sidebar-room ${isMenuOpen ? 'expanded' : 'collapsed'}`}>
        <button className="sidebar-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '◀' : '▶'}
        </button>

        <div className="sidebar-inner">
          <h1 className="sidebar-logo">{t('room.sidebarLogo')}<span>.</span></h1>

          <nav className="sidebar-nav">
            <button className="sidebar-link" onClick={() => setShowProjectInfo(true)}>
              {t('room.projectInfo')}
            </button>
            <button className="sidebar-link" onClick={onLogout}>
              {t('room.changeRoom')}
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="controls-hint">
              <p>{t('room.moveControls')}</p>
              <p>{t('room.interactControl')}</p>
            </div>
            <p className="user-tag">{t('room.userTag')}: {userData?.id?.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {showDesktop && (
        <ModalPC onClose={() => setShowDesktop(false)} user={userData?.id} userData={userData} />
      )}

      {showProjectInfo && (
        <ProjectIntro onClose={() => setShowProjectInfo(false)} />
      )}

      {showKhaledWelcome && isKhaledRoom && (
        <KhaledWelcome onClose={() => setShowKhaledWelcome(false)} />
      )}

      {showLauraWelcome && isLauraRoom && (
        <LauraWelcome onClose={() => setShowLauraWelcome(false)} />
      )}

      {showArcade && (
        <Suspense fallback={<div className="arcade-loading-fallback">Loading arcade…</div>}>
          <ArcadeApp onClose={() => setShowArcade(false)} />
        </Suspense>
      )}

      <FloatingSettingsButton />

      {showBed && (
        <div className="modal-glass" onClick={() => setShowBed(false)}>
          <div className="modal-content bed-modal-content" onClick={e => e.stopPropagation()}>
            <h2>{t('room.exitTitle')}</h2>
            <div className="bed-btn-group">
              <button className="btn-nav" onClick={onLogout} style={{ color: 'var(--error-color)' }}>
                {t('room.exitYes')}
              </button>
              <button className="btn-nav" onClick={() => setShowBed(false)}>
                {t('room.exitNo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
