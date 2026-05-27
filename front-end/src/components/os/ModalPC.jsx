import React, { useState, useEffect } from 'react';
import { useT } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import DynamicCV from './DynamicCV';
import Desktop from './Desktop';
import CvAccessGate from '../auth/CvAccessGate';
import { APP_ICON_MAP } from './AppIcons';
import { API_BASE } from '../../config';

import TerminalApp from './TerminalApp';
import IdeApp from './IdeApp';
import InfoApp from './InfoApp';
import EncuestaApp from './EncuestaApp';
import MailApp from './MailApp';
import NotesApp from './NotesApp';
import CalculatorApp from './CalculatorApp';
import ClockApp from './ClockApp';
import GalleryApp from './GalleryApp';
import SnakeApp from './SnakeApp';
import SocialApp from './SocialApp';

const APP_DEFS = (t) => [
  { id: 'terminal', label: t('apps.terminal'), iconClass: 'terminal-icon', Icon: APP_ICON_MAP.terminal },
  { id: 'ide',      label: t('apps.ide'),      iconClass: 'ide-icon',      Icon: APP_ICON_MAP.ide },
  { id: 'social',   label: 'K-Social',         iconClass: 'social-icon',   Icon: APP_ICON_MAP.social || APP_ICON_MAP.encuesta },
  { id: 'info',     label: t('apps.info'),     iconClass: 'info-tile',     Icon: APP_ICON_MAP.info },
  { id: 'encuesta', label: t('apps.encuesta'), iconClass: 'encuesta-icon', Icon: APP_ICON_MAP.encuesta },
  { id: 'cv',       label: t('apps.cv'),       iconClass: 'cv-icon',       Icon: APP_ICON_MAP.cv },
  { id: 'mail',     label: t('apps.mail'),     iconClass: 'mail-icon',     Icon: APP_ICON_MAP.mail },
  { id: 'notes',    label: t('apps.notes'),    iconClass: 'notes-icon',    Icon: APP_ICON_MAP.notes },
  { id: 'calc',     label: t('apps.calc'),     iconClass: 'calc-icon',     Icon: APP_ICON_MAP.calc },
  { id: 'clock',    label: t('apps.clock'),    iconClass: 'clock-icon',    Icon: APP_ICON_MAP.clock },
  { id: 'gallery',  label: t('apps.gallery'),  iconClass: 'gallery-icon',  Icon: APP_ICON_MAP.gallery },
  { id: 'snake',    label: t('apps.snake'),    iconClass: 'snake-icon',    Icon: APP_ICON_MAP.snake }
];

// Apps exclusivas para Khaled (IDE_DEV)
const KHALED_ONLY_APPS = new Set(['ide']);

// Apps que aparecen en TODAS las habitaciones, independientemente de lo que
// el usuario haya configurado en su apps[]. La red social es parte central
// del producto y debe estar siempre accesible para que cualquier visitante
// pueda interactuar desde cualquier perfil.
const ALWAYS_VISIBLE_APPS = new Set(['social']);

const systemNameFor = (user) => {
  if (user === 'khaled') return 'K-OS';
  if (user === 'laura') return 'L-OS';
  return `U-OS_${(user || 'guest').toUpperCase()}`;
};

export default function ModalPC({ onClose, user, userData }) {
  const t = useT();
  const { isAuthenticated, user: authUser } = useAuth();
  const [activeApp, setActiveApp] = useState(null);
  const [fullData, setFullData] = useState(userData || null);

  // Datos del CV cargados tras pasar el gate (o automáticamente si es el dueño).
  // Separados de fullData porque ahora /api/users/:id NO incluye los datos del CV
  // para visitantes (protección GDPR — pasan por /api/users/:id/cv con clave).
  const [cvData, setCvData] = useState(null);

  // El dueño autenticado puede ver su CV sin gate. Cargamos sus datos completos
  // desde /api/users/me directamente para que la app CV se abra sin fricción.
  const isCvOwner = isAuthenticated && authUser?.id === user;

  useEffect(() => {
    if (user && user !== 'guest') {
      // Si soy el dueño, mando el JWT para que el backend devuelva los datos
      // completos (sanitizeUser en vez de sanitizeUserPublic).
      const headers = {};
      const jwt = localStorage.getItem('tfg_auth_token');
      if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
      fetch(`${API_BASE}/api/users/${user}`, { headers })
        .then(res => res.json())
        .then(data => {
          setFullData(data);
          // Si el response trae los datos del CV (porque soy dueño/admin),
          // los precargo para que la app CV no tenga que pasar por el gate.
          if (data && (data.aboutMe !== undefined || data.skills !== undefined)) {
            setCvData(data);
          }
        })
        .catch(err => console.error('Error cargando datos API:', err));
    }
  }, [user]);

  // Banner discreto si la habitación es TEMPORAL — solo lo ve el visitante
  // (NO el propio dueño autenticado, para no contaminar la experiencia del entrevistador).
  const isTemporaryRoom = fullData?.isTemporary === true;
  const accessesLeft = fullData?.temporalAccessesRemaining;
  const showTemporalBanner = isTemporaryRoom && !isAuthenticated;

  const userApps = fullData?.apps || userData?.apps || ['terminal', 'cv'];
  const allApps = APP_DEFS(t);
  // Filtra apps disponibles para este user + fuerza exclusividad de las apps Khaled-only.
  // Las ALWAYS_VISIBLE_APPS (red social, etc.) están siempre presentes aunque
  // el usuario las haya quitado del wizard — son parte del producto.
  const apps = allApps.filter(a => {
    if (KHALED_ONLY_APPS.has(a.id) && user !== 'khaled') return false;
    if (KHALED_ONLY_APPS.has(a.id)) return true; // Khaled siempre las ve
    if (ALWAYS_VISIBLE_APPS.has(a.id)) return true;
    return userApps.includes(a.id);
  });
  const githubUrl = fullData?.contact?.github || fullData?.githubUrl;

  const renderAppContent = () => {
    switch (activeApp) {
      case 'terminal': return <TerminalApp fullData={fullData} user={user} />;
      case 'ide':      return <IdeApp />;
      case 'encuesta': return <EncuestaApp targetUserId={user} />;
      case 'cv':
        return (
          <div style={{ overflowY: 'auto', height: '100%', width: '100%', background: 'var(--bg-color)' }}>
            <div className="cv-internal-view">
              {cvData ? (
                // Datos del CV ya disponibles: dueño autenticado (precargados)
                // o visitante que ya pasó el gate.
                <DynamicCV user={{ ...fullData, ...cvData }} />
              ) : isCvOwner ? (
                // El dueño todavía no tiene cvData cargado — placeholder breve
                <div style={{ padding: 24, color: 'var(--muted-color)' }}>
                  {t('common.loading') || 'Loading…'}
                </div>
              ) : (
                // Visitante: gate obligatorio (clave + email + consent)
                <CvAccessGate
                  targetUserId={user}
                  onUnlock={(data) => setCvData(data)}
                />
              )}
            </div>
          </div>
        );
      case 'info':    return <InfoApp user={user} fullData={fullData} onOpenCV={() => setActiveApp('cv')} />;
      case 'mail':    return <MailApp fullData={fullData} />;
      case 'notes':   return <NotesApp user={user} />;
      case 'calc':    return <CalculatorApp />;
      case 'clock':   return <ClockApp />;
      case 'gallery': return <GalleryApp fullData={fullData} />;
      case 'snake':   return <SnakeApp onExit={() => setActiveApp(null)} />;
      case 'social':  return <SocialApp />;
      default: return null;
    }
  };

  return (
    <div className="modal-glass">
      <div className="os-container">

        <header className="os-header" style={{ justifyContent: 'space-between' }}>
          <span className="os-title">
            {activeApp ? `${systemNameFor(user)} / ${activeApp.toUpperCase()}` : `${systemNameFor(user)} Terminal_`}
          </span>
          <button
            onClick={activeApp ? () => setActiveApp(null) : onClose}
            className="os-close-btn"
            title={activeApp ? t('common.back') : t('common.close')}
          >
            ✕
          </button>
        </header>

        {showTemporalBanner && (
          <div className="os-temporal-banner" title={t('room.temporalBannerTooltip')}>
            <span className="os-temporal-banner-icon">⏳</span>
            <span>
              {typeof accessesLeft === 'number' && accessesLeft > 0
                ? t('room.temporalBannerWithCount', { count: accessesLeft })
                : t('room.temporalBannerNoCount')}
            </span>
            <button
              type="button"
              className="os-temporal-banner-cta"
              onClick={() => window.dispatchEvent(new CustomEvent('tfg:switch-to-register', {
                detail: {
                  id: fullData.id,
                  email: fullData.contact?.email || ''
                }
              }))}
              title={t('room.temporalSaveCta')}
            >
              {t('room.temporalSaveCta')} →
            </button>
          </div>
        )}

        <div className="os-workspace">
          {activeApp === null ? (
            <Desktop
              userId={user}
              systemName={systemNameFor(user)}
              apps={apps}
              activeAppId={null}
              onOpenApp={setActiveApp}
              githubUrl={githubUrl}
            />
          ) : (
            <div className="app-window">
              <div className="app-content">
                {renderAppContent()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
