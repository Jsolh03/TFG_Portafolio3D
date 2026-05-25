import React, { useState, useEffect } from 'react';
import { useT } from '../../context/LanguageContext';
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

const APP_DEFS = (t) => [
  { id: 'terminal', label: t('apps.terminal'), iconClass: 'terminal-icon', Icon: APP_ICON_MAP.terminal },
  { id: 'ide',      label: t('apps.ide'),      iconClass: 'ide-icon',      Icon: APP_ICON_MAP.ide },
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

const systemNameFor = (user) => {
  if (user === 'khaled') return 'K-OS';
  if (user === 'laura') return 'L-OS';
  return `U-OS_${(user || 'guest').toUpperCase()}`;
};

export default function ModalPC({ onClose, user, userData }) {
  const t = useT();
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

  const userApps = fullData?.apps || userData?.apps || ['terminal', 'cv'];
  const allApps = APP_DEFS(t);
  const apps = allApps.filter(a => userApps.includes(a.id));
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
