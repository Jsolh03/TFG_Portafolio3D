import React from 'react';
import { useT } from '../../context/LanguageContext';

export default function ProjectIntro({ onClose, onContinue }) {
  const t = useT();
  const handleAction = onClose || onContinue;

  return (
    <div className="modal-glass" onClick={handleAction}>
      <div className="intro-window" onClick={(e) => e.stopPropagation()}>

        <header className="intro-header">
          <div className="intro-header-controls">
            <span className="dot close" onClick={handleAction} title={t('common.close')}></span>
            <span className="dot minimize"></span>
            <span className="dot maximize"></span>
          </div>
          <span className="intro-title-bar">SYSTEM_INFO.log</span>
          <button className="intro-close-btn" onClick={handleAction}>✕</button>
        </header>

        <div className="intro-body">
          <h2>{t('projectIntro.title')}<span>_</span></h2>
          <p className="intro-subtitle">{t('projectIntro.subtitle')}</p>

          <div className="intro-info-item">
            <span>{t('projectIntro.description')}</span>
          </div>

          <div className="intro-stack">
            <div className="intro-stack-item">
              <span>{t('projectIntro.frontend')}</span>
              <span>React + Spline 3D</span>
            </div>
            <div className="intro-stack-item">
              <span>{t('projectIntro.backend')}</span>
              <span>Node.js + Express</span>
            </div>
            <div className="intro-stack-item">
              <span>{t('projectIntro.database')}</span>
              <span>MongoDB Atlas</span>
            </div>
            <div className="intro-stack-item">
              <span>{t('projectIntro.authors')}</span>
              <span>Khaled Solh · Laura Jara</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
