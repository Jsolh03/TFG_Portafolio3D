import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';

// Importamos datos y estilos
import { translations } from '../data/translations';
import '../styles/App.css';
import ModalPC from '../components/os/ModalPC';

export default function RoomLaura({ onLogout }) {
  // --- 1. ESTADOS ---
  const [isStarted, setIsStarted] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [lang, setLang] = useState('ES');
  
  const splineRef = useRef();
  const t = translations.laura[lang];

  // --- 2. LÓGICA DE INTERACCIÓN (Teclado) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (!isStarted || !splineRef.current) return;

      const zona = splineRef.current.getVariable('zona_activa');

      if (key === 'e') {
        if (zona === 1) { setShowDesktop(true); setShowCV(false); setShowBed(false); }
        if (zona === 2) { setShowCV(true); setShowDesktop(false); setShowBed(false); }
        if (zona === 3) { setShowBed(true); setShowCV(false); setShowDesktop(false); }
        document.exitPointerLock?.();
      }

      if (key === 't' && zona === 3) {
        onLogout();
      }

      if (key === 'escape') {
        setShowDesktop(false); setShowCV(false); setShowBed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, onLogout]);

  // --- 3. RENDERIZADO ---
  return (
    <div className="main-container">
      <Spline
        scene="https://prod.spline.design/cveZhllWScLLehFW/scene.splinecode"
        onLoad={(app) => { splineRef.current = app; }}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Menú de Bienvenida */}
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
              <button className="btn-nav" onClick={() => window.open('https://github.com/drakensita', '_blank')}>{t.github}</button>
              <button className="btn-nav">03. {lang === 'ES' ? 'Más información' : 'MORE INFORMATION'}</button>
            </nav>
            <p className="hint-text">{lang === 'ES' ? '[Usa WASD para moverte]' : '[Use WASD to move]'}</p>
          </div>
        </div>
      )}

      {/* Ventana del Ordenador (Zona 1) */}
      {showDesktop && <ModalPC onClose={() => setShowDesktop(false)} user="laura" />}

      {/* Ventana del Currículum (Con el botón de HTML) */}
      {showCV && (
        <div className="modal-glass">
          <div className="modal-content portfolio-cv">
            <header className="cv-header">
              <div className="header-main">
                <h1>LAURA JARA LORO</h1>
                <p className="subtitle">{t.dsaRole}</p>
              </div>
              
              {/* BOTONERA: Abrir Web + Cerrar */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button 
                  onClick={() => window.open('cv_web_lau.html', '_blank')}
                  style={{
                    background: '#e0e7ff', color: '#4f46e5', border: 'none', 
                    padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', 
                    fontWeight: 'bold', transition: '0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {lang === 'ES' ? '🌐 Abrir Portfolio Web' : '🌐 Open Web Portfolio'}
                </button>
                <button 
                  onClick={() => setShowCV(false)} 
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9c88ff' }}
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="cv-grid">
              <aside className="cv-aside">
                <section className="cv-section">
                  <h4><span className="text-accent">//</span> CONTACT</h4>
                  <p>📍 Madrid, ES</p>
                  <p>📧 laurajaraloro@gmail.com</p>
                  <p>🔗 github.com/drakensita</p>
                </section>
                <section className="cv-section">
                  <h4><span className="text-accent">//</span> CORE_STACK</h4>
                  <div className="tag-container">
                    <span className="tag">Java</span> <span className="tag">Python</span>
                    <span className="tag">SpringBoot</span><span className="tag">SQL Server</span>
                  </div>
                </section>
              </aside>

              <main className="cv-main">
                <section className="cv-section">
                  <h3 className="section-title">{t.exp}</h3>
                  <div className="experience-item highlight">
                    <div className="exp-header">
                      <strong>NTER</strong>
                      <span>Actual</span>
                    </div>
                    <p className="role">{t.dsaRole}</p>
                    <p>{t.dsaDesc}</p>
                  </div>
                </section>
                <section className="cv-section">
                  <h3 className="section-title">{t.edu}</h3>
                  <div className="edu-item"><strong>{t.dam}</strong></div>
                  <div className="edu-item"><strong>{t.tol}</strong></div>
                </section>
              </main>
            </div>
          </div>
        </div>
      )}

      {/* Ventana de la Cama */}
      {showBed && (
        <div className="modal-glass">
          <div className="modal-content" style={{ width: '40%', textAlign: 'center' }}>
            <h2>{t.bedMsg}</h2>
            <button className="btn-nav" onClick={() => setShowBed(false)} style={{ marginTop: '20px' }}>
              {lang === 'ES' ? 'Despertar' : 'Wake up'}
            </button>
          </div>
        </div>
      )}

      {/* Indicador de interacción */}
      {isStarted && !showDesktop && !showCV && !showBed && (
        <div className="hud-keys">
          <span>Pulsa [E] para interactuar</span>
        </div>
      )}
    </div>
  );
}