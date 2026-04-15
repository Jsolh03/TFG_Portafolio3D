import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';

// Importamos los datos centralizados y los estilos (nota las rutas con ../)
import { translations } from '../data/translations';
import '../styles/App.css'; 
import ModalPC from '../components/os/ModalPC';

export default function RoomKhaled({ onLogout }) {
  // --- 1. ESTADOS (Memoria de la interfaz) ---
  const [isStarted, setIsStarted] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [lang, setLang] = useState('ES');
  
  const splineRef = useRef(); // Referencia para controlar el modelo 3D

  // Cargamos las traducciones específicas de Khaled según el idioma elegido
  const t = translations.khaled[lang];

  // --- 2. LÓGICA DE TECLADO E INTERACCIÓN ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // Si no hemos empezado o el 3D no ha cargado, ignoramos las teclas
      if (!isStarted || !splineRef.current) return;

      // Leemos la variable 'zona_activa' directamente desde Spline
      const zona = splineRef.current.getVariable('zona_activa');
      
      console.log(`Tecla: [${key}] | Valor de zona_activa:`, zona); // Chivato para depurar

      // Interacción unificada: Si pulsas E, miramos en qué zona estás
      if (key === 'e') {
        if (zona === 1) { 
          setShowDesktop(true); setShowCV(false); setShowBed(false); 
        } else if (zona === 2) { 
          setShowCV(true); setShowDesktop(false); setShowBed(false); 
        } else if (zona === 3) { 
          setShowBed(true); setShowCV(false); setShowDesktop(false); 
        }
        document.exitPointerLock?.(); // Libera el ratón
      }

      // Volver al menú principal desde la cama
      if (key === 't' && zona === 3) {
        onLogout(); 
      }

      // Cerrar cualquier ventana abierta con Escape
      if (key === 'escape') {
        setShowDesktop(false); setShowCV(false); setShowBed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown); // Limpieza de memoria
  }, [isStarted, onLogout]);

  // --- 3. INTERFAZ GRÁFICA (Lo que se pinta en pantalla) ---
  return (
    <div className="main-container">
      {/* MOTOR 3D */}
      <Spline
        scene="https://prod.spline.design/cveZhllWScLLehFW/scene.splinecode?v=1"
        onLoad={(app) => { splineRef.current = app; }}
        style={{ width: '100%', height: '100%' }}
      />

      {/* MENÚ DE INICIO (Overlay antes de entrar al 3D) */}
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
              <button className="btn-nav" onClick={() => window.open('https://github.com/Jsolh03', '_blank')}>{t.github}</button>
              <button className="btn-nav">03. {lang === 'ES' ? 'Más información' : 'MORE INFORMATION'}</button>
            </nav>
            <p className="hint-text">{lang === 'ES' ? '[Usa WASD para moverte una vez dentro]' : '[Use WASD to move once inside]'}</p>
          </div>
        </div>
      )}

      {/* MODAL ORDENADOR (E) */}
      {showDesktop && <ModalPC onClose={() => setShowDesktop(false)} user="khaled" />}

      {showCV && (
        <div className="modal-glass">
          <div className="modal-content portfolio-cv">
            <header className="cv-header">
              <div className="header-main">
                <h1>KHALED SOLH EL HAJJI</h1>
                <p className="subtitle">Full-Stack Developer | AI Implementation Specialist | System Tech</p>
              </div>
              <button onClick={() => setShowCV(false)}>✕</button>
            </header>

            <div className="cv-grid">
              <aside className="cv-aside">
                <section className="cv-section">
                  <h4><span className="text-accent">//</span> CONTACT</h4>
                  <p>📍 Madrid, ES</p>
                  <p>📞 652 20 44 10</p>
                  <p>📧 khaledsolhelhajji@gmail.com</p>
                </section>
                <section className="cv-section">
                  <h4><span className="text-accent">//</span> CORE_STACK</h4>
                  <div className="tag-container">
                    <span className="tag">Java</span> <span className="tag">Python</span>
                    <span className="tag">React</span> <span className="tag">Node.js</span>
                    <span className="tag">Active Directory</span> <span className="tag">Networks</span>
                  </div>
                </section>
                <section className="cv-section">
                  <h4><span className="text-accent">//</span> AI_MASTERY</h4>
                  <ul className="skill-list">
                    <li>Prompt Engineering</li>
                    <li>AI-Driven Development</li>
                    <li>IDE AI Integration Workflow</li>
                  </ul>
                </section>
              </aside>

              <main className="cv-main">
                <section className="cv-section">
                  <h3 className="section-title">{lang === 'ES' ? 'TRAYECTORIA PROFESIONAL' : 'PROFESSIONAL EXPERIENCE'}</h3>
                  <div className="experience-item highlight">
                    <div className="exp-header">
                      <strong>DSA NEXUX</strong>
                      <span>2025 - {lang === 'ES' ? 'Actualidad' : 'Present'}</span>
                    </div>
                    <p className="role">Full-Stack Developer & AI Integrator</p>
                    <ul><li>{t.dsaRole}</li></ul>
                  </div>
                  <div className="experience-item">
                    <div className="exp-header">
                      <strong>HOSPITAL U. JOSÉ GERMAIN</strong>
                      <span>2023</span>
                    </div>
                    <p className="role">IT Systems Technician (Internship)</p>
                    <ul><li>{t.hospitalRole}</li></ul>
                  </div>
                </section>
                <section className="cv-section">
                  <h3 className="section-title">{lang === 'ES' ? 'FORMACIÓN ACADÉMICA' : 'ACADEMIC BACKGROUND'}</h3>
                  <div className="edu-item"><strong>{t.dam}</strong></div>
                  <div className="edu-item"><strong>{t.smr}</strong></div>
                </section>
              </main>
            </div>
          </div>
        </div>
      )}

      {showBed && (
        <div className="modal-glass">
          <div className="modal-content" style={{ width: '40%', textAlign: 'center' }}>
            <h2 style={{ color: '#2d2a3d' }}>{t.bedMsg}</h2>
            <button className="btn-nav" onClick={() => setShowBed(false)} style={{ marginTop: '20px', color: '#9c88ff' }}>
              {lang === 'ES' ? 'Despertar' : 'Wake up'}
            </button>
          </div>
        </div>
      )}

      {/* HUD: Mensaje fijo en pantalla */}
      {isStarted && !showDesktop && !showCV && !showBed && (
        <div className="hud-keys">
          <span>Pulsa [E] para interactuar</span>
        </div>
      )}
    </div>
  );
}