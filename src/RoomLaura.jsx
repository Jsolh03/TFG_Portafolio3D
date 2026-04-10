import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import './App.css'; // Importamos el diseño visual

export default function App() {
  // 1. ESTADOS (Memoria de React)
  const [isStarted, setIsStarted] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [showBed, setShowBed] = useState(false); // Nuevo estado para la cama
  const [lang, setLang] = useState('ES');
  const splineRef = useRef();

  // 2. DICCIONARIO DE IDIOMAS (Información Real y Corregida)
  const content = {
    ES: {
      start: "01. INICIAR EXPERIENCIA",
      github: "02. GITHUB",
      cvTitle: "CURRICULUM_VITAE",
      pcTitle: "SISTEMA_OPERATIVO",
      profile: "PERFIL PROFESIONAL",
      exp: "TRAYECTORIA",
      edu: "FORMACIÓN",
      skills_title: "HABILIDADES TÉCNICAS",
      profileDesc: "Estudiante de 2º de DAM especializada en lógica Back-End, gestión de datos SQL/NoSQL y resolución de problemas técnicos.",
      dsaRole: "...",
      dsaDesc: "...",
      hospitalRole: "...",
      hospitalDesc: "...",
      dam: "2º CFGS Desarrollo de Aplicaciones Multiplataforma (IES Lope de Vega)",
      tol: "CFGM Auxiliar de Operaciones de Laboratorio (IES Lope de Vega)",
      bedMsg: "Guardando partida... Descansando."
    },
    EN: {
      start: "01. START EXPERIENCE",
      github: "02. GITHUB",
      cvTitle: "CURRICULUM_VITAE",
      pcTitle: "OPERATING_SYSTEM",
      profile: "PROFESSIONAL PROFILE",
      exp: "EXPERIENCE",
      edu: "EDUCATION",
      skills_title: "TECHNICAL SKILLS",
      profileDesc: "2nd year Multiplatform App Development student. Focused on Back-End logic, SQL/NoSQL data management, and technical problem solving.",
      dsaRole: "...",
      dsaDesc: "...",
      hospitalRole: "...",
      hospitalDesc: "...",
      dam: "2nd year Multiplatform App Development (Higher Degree)",
      tol: "Lab Operations Assistant (Middle Degree)",
      bedMsg: "Saving game... Resting."
    }
  };

  const t = content[lang];

  // 3. LÓGICA DE TECLADO Y COLISIONES
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (!isStarted || !splineRef.current) return;

      // Leemos la variable directamente de Spline
      const zona = splineRef.current.getVariable('zona_activa');

      // [E] -> Interacción unificada por zonas
      if (key === 'e') {
        if (zona === 1) { setShowDesktop(true); setShowCV(false); setShowBed(false); }
        if (zona === 2) { setShowCV(true); setShowDesktop(false); setShowBed(false); }
        if (zona === 3) { setShowBed(true); setShowCV(false); setShowDesktop(false); }
        document.exitPointerLock?.();
      }

      // [T] y [Escape]
      if (key === 't') {
        setIsStarted(false); setShowDesktop(false); setShowCV(false); setShowBed(false);
      }
      if (key === 'escape') {
        setShowDesktop(false); setShowCV(false); setShowBed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted]);

  // 4. INTERFAZ GRÁFICA (JSX)
  return (
    <div className="main-container">
      <Spline
        scene="https://prod.spline.design/cveZhllWScLLehFW/scene.splinecode"
        onLoad={(app) => { splineRef.current = app; }}
        style={{ width: '100%', height: '100%' }}
      />

      {/* MENÚ DE INICIO */}
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
            <p className="hint-text">{lang === 'ES' ? '[Usa WASD para moverte una vez dentro]' : '[Use WASD to move once inside]'}</p>
          </div>
        </div>
      )}

      {/* MODAL ORDENADOR (E - Zona 1) */}
      {showDesktop && (
        <div className="modal-glass">
          <div className="modal-content terminal">
            <header>
              <h2>{t.pcTitle}</h2>
              <button onClick={() => setShowDesktop(false)}>✕</button>
            </header>
            <div className="grid-projects">
              <div className="card">...</div>
              <div className="card">...</div>
              <div className="card">...</div>
              <div className="card">...</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CURRICULUM (E - Zona 2) */}
      {showCV && (
        <div className="modal-glass">
          <div className="modal-content portfolio-cv">
            <header className="cv-header">
              <div className="header-main">
                <h1>LAURA JARA LORO</h1>
                <p className="subtitle">Desarrolladora Back-End</p>
              </div>
              <button onClick={() => window.open('portfolio_lau.html', '_blank')}>
                Abrir Portfolio Web
              </button>
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
                    <span className="tag">Git</span>
                    <span className="tag">JavaScript</span>
                  </div>
                </section>
                <section className="cv-section">
                  <h4><span className="text-accent">//</span> HABILIDADES</h4>
                  <ul className="skill-list">
                    <li>Lógica Back-End</li>
                    <li>Gestión de Datos</li>
                    <li>Documentación Técnica</li>
                    <li>SourceTree / Git</li>
                  </ul>
                </section>
              </aside>

              <main className="cv-main">
                <section className="cv-section">
                  <h3 className="section-title">{t.exp}</h3>
                  <div className="experience-item highlight">
                    <div className="exp-header">
                      <strong>NTER </strong>
                      <span>Actual</span>
                    </div>
                    <p className="role">{t.dsaRole}</p>
                    <p style={{ fontSize: '0.85rem' }}>{t.dsaDesc}</p>
                  </div>
                  <div className="experience-item">
                    <div className="exp-header">
                      <strong>LEDME EUROPA</strong>
                      <span>2025</span>
                    </div>
                    <p className="role">{t.hospitalRole}</p>
                    <p style={{ fontSize: '0.85rem' }}>{t.hospitalDesc}</p>
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

      {/* MODAL CAMA (E - Zona 3) */}
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

      {/* HUD DE TECLAS */}
      {isStarted && !showDesktop && !showCV && !showBed && (
        <div className="hud-keys">
          <span>Pulsa [E] para interactuar</span>
        </div>
      )}
    </div>
  );
}