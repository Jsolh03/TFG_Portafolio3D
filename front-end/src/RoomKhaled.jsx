import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import './App.css'; // Importamos el diseño visual
import ModalPC from './ModalPC';

export default function RoomKhaled({ onLogout }) {
  // 1. ESTADOS (Memoria de React)
   const [isStarted, setIsStarted] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [showBed, setShowBed] = useState(false); // Nuevo estado para la cama
  const [lang, setLang] = useState('ES');
  const splineRef = useRef();

  // 2. DICCIONARIO DE IDIOMAS (Datos puros)
  const content = {
    ES: {
      start: "01. INICIAR EXPERIENCIA", github: "02. GITHUB", contact: "03. CONTACTO",
      cvTitle: "CURRICULUM_VITAE", pcTitle: "SISTEMA_OPERATIVO", profile: "PERFIL PROFESIONAL",
      exp: "EXPERIENCIA", edu: "FORMACIÓN", skills: "HABILIDADES IT",
      dsaRole: "Programador Full-Stack con IA integrada en IDE",
      hospitalRole: "Prácticas Técnico en Sistemas - Hospital José Germain",
      aiSkill: "Prompt Engineering y Programación con IA",
      dam: "2º CFGS Desarrollo de Aplicaciones Multiplataforma (IES Lope de Vega)",
      smr: "Grado Medio Sistemas Microinformáticos y Redes (IES Luis Vives)",
      bedMsg: "Guardando partida... Descansando."
    },
    EN: {
      start: "01. START EXPERIENCE", github: "02. GITHUB", contact: "03. CONTACT",
      cvTitle: "CURRICULUM_VITAE", pcTitle: "OPERATING_SYSTEM", profile: "PROFESSIONAL PROFILE",
      exp: "EXPERIENCE", edu: "EDUCATION", skills: "IT SKILLS",
      dsaRole: "Full-Stack Developer with AI integration in IDE",
      hospitalRole: "System Technician Internship - José Germain Hospital",
      aiSkill: "Prompt Engineering and AI-driven Programming",
      dam: "2nd year Multiplatform App Development (Higher Degree)",
      smr: "Microinformatic Systems and Networks (Middle Degree)",
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
      
      // CHIVATO: Imprime en consola (F12) lo que está pasando
      console.log(`Tecla: [${key}] | Valor de zona_activa:`, zona);

      // [E] -> Ordenador (Zona 1)
      if (key === 'e'&& zona === 1 ) {
        setShowDesktop(true); setShowCV(false); setShowBed(false);
        document.exitPointerLock?.();
      }

      // [R] -> Curriculum (Zona 2)
      if (key === 'e' && zona === 2) {
        setShowCV(true); setShowDesktop(false); setShowBed(false);
        document.exitPointerLock?.();
      }

      // [F] -> Cama (Zona 3)
      if (key === 'e' && zona === 3) {
        setShowBed(true); setShowCV(false); setShowDesktop(false);
        document.exitPointerLock?.();
      }

      // [T] -> Reset Total al Menú (Cerrar sesión)
      if (key === 't' && zona === 3) {
        onLogout(); // <--- LLAMA A LA FUNCIÓN DEL PADRE
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
      {/* MOTOR 3D (Con optimización de rendimiento para tu profesor) */}
      <Spline
        scene={`https://prod.spline.design/cveZhllWScLLehFW/scene.splinecode`}
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
              <button className="btn-nav" onClick={() => window.open('https://github.com/Jsolh03', '_blank')}>{t.github}</button>
              <button className="btn-nav">03. {lang === 'ES' ? 'Más información' : 'MORE INFORMATION'}</button>
            </nav>
            <p className="hint-text">{lang === 'ES' ? '[Usa WASD para moverte una vez dentro]' : '[Use WASD to move once inside]'}</p>
          </div>
        </div>
      )}

      {/* MODAL ORDENADOR (E) */}
     {showDesktop && <ModalPC onClose={() => setShowDesktop(false)} />}

      {/* MODAL CURRICULUM (R) */}
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

      {/* MODAL CAMA (F) */}
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

      {/* HUD DE TECLAS (Visible siempre que estemos jugando) */}
      {isStarted && !showDesktop && !showCV && !showBed && (
        <div className="hud-keys">
          <span>Pulsa [E] para interactuar</span>
        </div>
      )}
    </div>
  );
}