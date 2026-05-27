import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import Spline from '@splinetool/react-spline';
import { useT } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import ModalPC from '../components/os/ModalPC';
import ProjectIntro from '../components/os/ProjectIntro';
import KhaledWelcome from '../components/os/KhaledWelcome';
import LauraWelcome from '../components/os/LauraWelcome';
import FloatingSettingsButton from '../components/ui/FloatingSettingsButton';
import FloatingHelpButton from '../components/ui/FloatingHelpButton';
import PrivacyPanel from '../components/auth/PrivacyPanel';
import { AVAILABLE_ROOMS } from '../data/roomUrls';

const PROTECTED_PUBLIC_IDS = new Set(['khaled', 'laura']);

const ArcadeApp = lazy(() => import('../components/os/ArcadeApp'));

const ARCADE_OBJECT_NAMES = new Set(['arcade_machine', 'arcade', 'recreativa', 'arcadeapp', 'maquina_arcade', 'arcade_recreativa']);

export default function Room({ userData, onLogout }) {
  const t = useT();
  const { user: authUser, isAuthenticated } = useAuth();

  // Las bienvenidas KhaledWelcome y LauraWelcome son personales — solo aparecen
  // si el visitante está mirando la habitación de su autor original. Cualquier
  // otro usuario que copie su roomType verá la bienvenida estándar.
  const isKhaledRoom = userData?.id === 'khaled';
  const isLauraRoom = userData?.id === 'laura';

  // El chip de privacidad solo lo ve el DUEÑO de la habitación, autenticado, y
  // siempre que no sea Khaled/Laura (que son perfiles dev públicos por diseño,
  // bloqueados también en el backend).
  const isOwnerHere = isAuthenticated && authUser?.id === userData?.id && !PROTECTED_PUBLIC_IDS.has(userData?.id);
  const [roomIsPrivate, setRoomIsPrivate] = useState(!!userData?.hasAccessToken);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

  // Cuando un modal está abierto (arcade/desktop/bed), Spline sigue capturando
  // WASD a su propio nivel del runtime, así que el personaje se mueve por
  // detrás. Interceptamos esas teclas en fase de captura y abortamos antes
  // de que Spline las reciba. También liberamos el pointer lock por si la
  // cámara estaba en first-person.
  useEffect(() => {
    const modalActive = showDesktop || showBed || showArcade;
    if (!modalActive) return;
    try { document.exitPointerLock?.(); } catch { /* noop */ }
    const BLOCK_KEYS = new Set(['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
    // Selector de elementos "interactivos del modal": si el evento se originó
    // dentro de ellos (arcade builtin, inputs del desktop, etc.) lo dejamos
    // pasar para que el juego/input lo reciba. Si no, lo bloqueamos (es Spline
    // capturando desde el window).
    const INTERACTIVE_SELECTOR = '.arcade-overlay, .modal-glass, .os-container, input, textarea, select, button, [contenteditable="true"]';
    const swallow = (e) => {
      const k = (e.key || '').toLowerCase();
      if (!BLOCK_KEYS.has(k)) return;
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      const insideInteractive = path.some(el =>
        el && el.nodeType === 1 && typeof el.matches === 'function' && el.matches(INTERACTIVE_SELECTOR)
      );
      if (insideInteractive) return; // dejamos pasar
      e.stopImmediatePropagation();
    };
    window.addEventListener('keydown', swallow, true);
    window.addEventListener('keyup', swallow, true);
    return () => {
      window.removeEventListener('keydown', swallow, true);
      window.removeEventListener('keyup', swallow, true);
    };
  }, [showDesktop, showBed, showArcade]);

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
            {isOwnerHere && (
              <button
                className="sidebar-link"
                onClick={() => window.dispatchEvent(new CustomEvent('tfg:edit-my-room'))}
                title={t('room.editMyRoom')}
              >
                {t('room.editMyRoom')}
              </button>
            )}
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
            {isOwnerHere && (
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="sidebar-privacy-chip"
                title={roomIsPrivate ? t('privacy.statusPrivate') : t('privacy.statusPublic')}
                style={{
                  marginTop: 8,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                  background: roomIsPrivate ? 'rgba(248, 113, 113, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                  color: roomIsPrivate ? '#f87171' : '#22c55e',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: 0.3
                }}
              >
                <span>{roomIsPrivate ? '🔒' : '🔓'}</span>
                <span>{roomIsPrivate ? t('privacy.statusPrivate') : t('privacy.statusPublic')}</span>
              </button>
            )}
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
      <FloatingHelpButton />

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

      {showPrivacyModal && isOwnerHere && (
        <div className="modal-glass" onClick={() => setShowPrivacyModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 480, width: '90%', padding: 0 }}
          >
            <PrivacyPanel
              onClose={() => setShowPrivacyModal(false)}
              onStateChange={(nextHasToken) => setRoomIsPrivate(nextHasToken)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
