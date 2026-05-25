import React, { useState, useEffect } from 'react';
import { useT } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import DynamicCV from './DynamicCV';
import Desktop from './Desktop';
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

// Apps exclusivas para Khaled (IDE_DEV + red social interna)
const KHALED_ONLY_APPS = new Set(['ide', 'social']);

const systemNameFor = (user) => {
  if (user === 'khaled') return 'K-OS';
  if (user === 'laura') return 'L-OS';
  return `U-OS_${(user || 'guest').toUpperCase()}`;
};

export default function ModalPC({ onClose, user, userData }) {
  const t = useT();
  const { isAuthenticated } = useAuth();
  const [activeApp, setActiveApp] = useState(null);
  const [fullData, setFullData] = useState(userData || null);

  useEffect(() => {
    if (user && user !== 'guest') {
      fetch(`${API_BASE}/api/users/${user}`)
        .then(res => res.json())
        .then(data => setFullData(data))
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
  // Filtra apps disponibles para este user + fuerza exclusividad de las apps Khaled-only
  const apps = allApps.filter(a => {
    if (KHALED_ONLY_APPS.has(a.id) && user !== 'khaled') return false;
    if (KHALED_ONLY_APPS.has(a.id)) return true; // Khaled siempre las ve
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
              <DynamicCV user={fullData} />
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
