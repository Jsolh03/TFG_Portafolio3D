import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { translations } from '../data/translations';
import ModalPC from '../components/os/ModalPC';

export default function Room({ userData, onLogout }) {
  const [isStarted, setIsStarted] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [lang, setLang] = useState('ES');

  const splineRef = useRef(null);

  const SCENE_URL = "https://prod.spline.design/cveZhllWScLLehFW/scene.splinecode?v=1";

  const userTranslations = translations[userData?.id] || translations['laura'];
  const t = userTranslations[lang];

  useEffect(() => {
    if (isStarted) {
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.focus();
    }
  }, [isStarted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (!isStarted || !splineRef.current || showDesktop || showBed) return;

      const zona = splineRef.current.getVariable('zona_activa');

      if (key === 'e') {
        if (zona === 1) setShowDesktop(true);

        if (zona === 2) {
          const idSeguro = userData?.id || userData?._id || 'laura';
          console.log("Navegando al CV con ID:", idSeguro);
          window.open(`/cv/${idSeguro}`, '_blank');
        }

        if (zona === 3) setShowBed(true);

        document.exitPointerLock?.();
      }

      if (key === 't' && zona === 3) onLogout();

      if (key === 'escape') {
        setShowDesktop(false);
        setShowBed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, onLogout, showDesktop, showBed, userData?.id]);

  const onLoad = (splineApp) => {
    splineRef.current = splineApp;
    console.log("Spline cargado correctamente");
  };

  return (
    <div className="main-container">
      <Spline
        scene={userData?.splineScene || SCENE_URL}
        onLoad={onLoad}
      />

      {!isStarted && (
        <div className="overlay-start">
          <div className="menu-left">
            <h1 className="title-start">Portfolio<span className="text-accent">.</span></h1>
            <div className="lang-selector">
              <span className={lang === 'ES' ? 'active' : ''} onClick={() => setLang('ES')}>ES</span>
              <span className="separator">|</span>
              <span className={lang === 'EN' ? 'active' : ''} onClick={() => setLang('EN')}>EN</span>
            </div>
            <nav className="menu-list">
              <button className="btn-nav" onClick={() => setIsStarted(true)}>{t.start}</button>
              <button className="btn-nav" onClick={() => window.open(userData?.contact?.github || "#", '_blank')}>
                {t.github}
              </button>
            </nav>
          </div>
        </div>
      )}

      {showDesktop && (
        <ModalPC
          onClose={() => setShowDesktop(false)}
          user={userData?.id}
        />
      )}

      {showBed && (
        <div className="modal-glass">
          <div className="modal-content" style={{ width: '40%', textAlign: 'center' }}>
            <h2>{t.bedMsg}</h2>
            <button className="btn-nav" onClick={() => setShowBed(false)}>Despertar</button>
          </div>
        </div>
      )}
    </div>
  );
}