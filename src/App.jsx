import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [lang, setLang] = useState('ES');
  const splineRef = useRef();

  // Traducciones del CV y Menú
  const content = {
    ES: {
      start: "01. INICIAR EXPERIENCIA",
      github: "02. GITHUB",
      contact: "03. CONTACTO",
      cvTitle: "CURRICULUM_VITAE",
      pcTitle: "SISTEMA_OPERATIVO",
      profile: "PERFIL PROFESIONAL",
      exp: "EXPERIENCIA",
      edu: "FORMACIÓN",
      skills: "HABILIDADES IT",
      dsaRole: "Programador Full-Stack con IA integrada en IDE",
      hospitalRole: "Prácticas Técnico en Sistemas - Hospital José Germain",
      aiSkill: "Prompt Engineering y Programación con IA",
      dam: "2º CFGS Desarrollo de Aplicaciones Multiplataforma (IES Lope de Vega)",
      smr: "Grado Medio Sistemas Microinformáticos y Redes (IES Luis Vives)",
    },
    EN: {
      start: "01. START EXPERIENCE",
      github: "02. GITHUB",
      contact: "03. CONTACT",
      cvTitle: "CURRICULUM_VITAE",
      pcTitle: "OPERATING_SYSTEM",
      profile: "PROFESSIONAL PROFILE",
      exp: "EXPERIENCE",
      edu: "EDUCATION",
      skills: "IT SKILLS",
      dsaRole: "Full-Stack Developer with AI integration in IDE",
      hospitalRole: "System Technician Internship - José Germain Hospital",
      aiSkill: "Prompt Engineering and AI-driven Programming",
      dam: "2nd year Multiplatform App Development (Higher Degree)",
      smr: "Microinformatic Systems and Networks (Middle Degree)",
    }
  };

  const t = content[lang];

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // E -> Abrir Ordenador (Solo si la aventura empezó)
      if (key === 'e' && isStarted) {
        setShowDesktop(true);
        setShowCV(false);
        document.exitPointerLock?.();
      }

      // R -> Abrir Curriculum (Solo si la aventura empezó)
      if (key === 'r' && isStarted) {
        setShowCV(true);
        setShowDesktop(false);
        document.exitPointerLock?.();
      }

      // T -> Volver al Menú Principal (Reset total)
      if (key === 't') {
        setIsStarted(false);
        setShowDesktop(false);
        setShowCV(false);
      }

      // Escape -> Cerrar modales pero seguir en el juego
      if (key === 'escape') {
        setShowDesktop(false);
        setShowCV(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted]);

  return (
    <div style={styles.container}>
      <Spline
        scene="https://prod.spline.design/cveZhllWScLLehFW/scene.splinecode"
        onLoad={(app) => { splineRef.current = app; }}
        style={{ width: '100%', height: '100%' }}
      />

      {/* MENÚ DE INICIO */}
      {!isStarted && (
        <div className="overlay-start">
          <div className="menu-left">
            <h1 className="title-start">Portfolio<span className="text-red">.</span></h1>
            <div className="lang-selector">
              <span className={lang === 'ES' ? 'active' : ''} onClick={() => setLang('ES')}>ES</span>
              <span className="separator">|</span>
              <span className={lang === 'EN' ? 'active' : ''} onClick={() => setLang('EN')}>EN</span>
            </div>

            <nav className="menu-list">
              <button className="btn-nav" onClick={() => setIsStarted(true)}>{t.start}</button>
              <button className="btn-nav" onClick={() => window.open('https://github.com', '_blank')}>{t.github}</button>
              <button className="btn-nav">03. {lang === 'ES' ? 'Más información' : 'MORE INFORMATION'}</button>
            </nav>
            <p className="hint-text">{lang === 'ES' ? '[Usa WASD para moverte una vez dentro]' : '[Use WASD to move once inside]'}</p>
          </div>
        </div>
      )}

      {/* MODAL ORDENADOR (E) */}
      {showDesktop && (
        <div className="modal-glass">
          <div className="modal-content terminal">
            <header>
              <h2>{t.pcTitle}</h2>
              <button onClick={() => setShowDesktop(false)}>✕</button>
            </header>
            <div className="grid-projects">
              <div className="card">PROYECTO_WEB</div>
              <div className="card">IA_INTEGRATION</div>
              <div className="card">DATABASE_MGR</div>
              <div className="card">NETWORK_CONFIG</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CURRICULUM (R) */}
      {showCV && (
        <div className="modal-glass">
          <div className="modal-content portfolio-cv">
            <header className="cv-header">
              <div className="header-main">
                <h1>KHALED SOLH EL HAJJI</h1>
                <p className="subtitle">Full-Stack Developer | AI Implementation Specialist | System Tech</p>
              </div>
              <button className="close-btn" onClick={() => setShowCV(false)}>✕</button>
            </header>

            <div className="cv-grid">
              {/* COLUMNA IZQUIERDA: Info y Tech Stack */}
              <aside className="cv-aside">
                <section className="cv-section">
                  <h4><span className="text-red">//</span> CONTACT</h4>
                  <p>📍 Madrid, ES</p>
                  <p>📞 652 20 44 10</p>
                  <p>📧 khaledsolhelhajji@gmail.com</p>
                </section>

                <section className="cv-section">
                  <h4><span className="text-red">//</span> CORE_STACK</h4>
                  <div className="tag-container">
                    <span className="tag">Java</span> <span className="tag">Python</span>
                    <span className="tag">HTML5/CSS3</span> <span className="tag">Node.js</span>
                    <span className="tag">Active Directory</span> <span className="tag">Networks</span>
                    <span className="tag">Virtualization</span>
                  </div>
                </section>

                <section className="cv-section">
                  <h4><span className="text-red">//</span> AI_MASTERY</h4>
                  <ul className="skill-list">
                    <li>Prompt Engineering Specialist</li>
                    <li>AI-Driven Development (Copilot/Antigravity/More)</li>
                    <li>IDE AI Integration Workflow</li>
                  </ul>
                </section>

                <section className="cv-section">
                  <h4><span className="text-red">//</span> LANGUAGES</h4>
                  <p>🇪🇸 {lang === 'ES' ? 'Castellano: Nativo' : 'Spanish: Native'}</p>
                  <p>🇸🇦 {lang === 'ES' ? 'Árabe: Nativo' : 'Arabic: Native'}</p>
                  <p>🇬🇧 {lang === 'ES' ? 'Inglés: Nivel Alto' : 'English: Professional Working Proficiency'}</p>
                </section>
              </aside>

              {/* COLUMNA DERECHA: Experiencia y Educación */}
              <main className="cv-main">
                <section className="cv-section">
                  <h3 className="section-title">{lang === 'ES' ? 'TRAYECTORIA PROFESIONAL' : 'PROFESSIONAL EXPERIENCE'}</h3>

                  <div className="experience-item highlight">
                    <div className="exp-header">
                      <strong>DSA NEXUX</strong>
                      <span>2025 - {lang === 'ES' ? 'Actualidad' : 'Present'}</span>
                    </div>
                    <p className="role">Full-Stack Developer & AI Integrator</p>
                    <ul>
                      <li>{lang === 'ES' ? 'Desarrollo Full-Stack optimizado mediante el uso estratégico de Inteligencia Artificial Generativa.' : 'Full-Stack development optimized through the strategic use of Generative AI.'}</li>
                      <li>{lang === 'ES' ? 'Integración de flujos de trabajo basados en IA dentro del IDE para maximizar la eficiencia del código.' : 'Integration of AI-based workflows within the IDE to maximize code efficiency.'}</li>
                      <li>{lang === 'ES' ? 'Especialización en Prompt Engineering aplicado a la arquitectura de software.' : 'Specialization in Prompt Engineering applied to software architecture.'}</li>
                    </ul>
                  </div>

                  <div className="experience-item">
                    <div className="exp-header">
                      <strong>HOSPITAL U. JOSÉ GERMAIN</strong>
                      <span>2023</span>
                    </div>
                    <p className="role">IT Systems Technician (Internship)</p>
                    <ul>
                      <li>{lang === 'ES' ? 'Mantenimiento crítico de hardware y despliegue de software corporativo.' : 'Performed critical hardware maintenance and enterprise software deployment.'}</li>
                      <li>{lang === 'ES' ? 'Administración y gestión de identidades en Active Directory.' : 'Managed identity and access administration using Active Directory.'}</li>
                      <li>{lang === 'ES' ? 'Configuración de redes locales (LAN/WAN) y protocolos TCP/IP, DNS, DHCP.' : 'Configured and maintained LAN/WAN networks, including TCP/IP, DNS, and DHCP protocols.'}</li>
                    </ul>
                  </div>
                </section>

                <section className="cv-section">
                  <h3 className="section-title">{lang === 'ES' ? 'FORMACIÓN ACADÉMICA' : 'ACADEMIC BACKGROUND'}</h3>
                  <div className="edu-item">
                    <strong>{lang === 'ES' ? 'CFGS Desarrollo de Aplicaciones Multiplataforma (DAM)' : 'Advanced Vocational Diploma in Multiplatform Application Development (DAM)'}</strong>
                    <p>{lang === 'ES' ? 'IES Lope de Vega (Madrid) | 2023 - 2025' : 'IES Lope de Vega (Madrid, Spain) | 2023 - 2025'}</p>
                  </div>
                  <div className="edu-item">
                    <strong>{lang === 'ES' ? 'CFGM Sistemas Microinformáticos y Redes (SMR)' : 'Intermediate Vocational Diploma in Microcomputer Systems and Networks (SMR)'}</strong>
                    <p>{lang === 'ES' ? 'IES Luis Vives (Madrid) | 2021 - 2023' : 'IES Luis Vives (Madrid, Spain) | 2021 - 2023'}</p>
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      )}

      {/* HUD DE TECLAS */}
      {isStarted && !showDesktop && !showCV && (
        <div className="hud-keys">
          <span>[E] ORDENADOR</span>
          <span>[R] CURRICULUM</span>
          <span>[T] MENU</span>
        </div>
      )}

      <style>{`
        .overlay-start { position: absolute; inset: 0; backdrop-filter: blur(20px); background: rgba(0,0,0,0.7); display: flex; align-items: center; padding-left: 8%; z-index: 100; font-family: 'Courier New', monospace; }
        .title-start { font-size: 5rem; color: white; margin: 0; font-weight: 200; }
        .text-red { color: #e50914; }
        .lang-selector { color: #555; font-size: 1rem; cursor: pointer; margin-top: 10px; }
        .lang-selector .active { color: white; border-bottom: 2px solid #e50914; }
        .menu-list { display: flex; flex-direction: column; gap: 15px; margin-top: 40px; }
        .btn-nav { background: none; border: none; color: #777; font-size: 1.5rem; text-align: left; cursor: pointer; transition: 0.3s; font-family: inherit; }
        .btn-nav:hover { color: white; transform: translateX(15px); }
        .hint-text { color: #444; margin-top: 30px; font-size: 0.8rem; }

        .modal-glass { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); z-index: 200; }
        .modal-content { width: 70%; max-height: 80%; background: #0a0a0a; border: 1px solid #333; padding: 40px; color: white; font-family: 'Courier New', monospace; overflow-y: auto; }
        .modal-content.terminal { border-color: #e50914; }
        header { display: flex; justify-content: space-between; border-bottom: 1px solid #222; margin-bottom: 25px; }
        header button { background: none; border: none; color: #e50914; font-size: 1.5rem; cursor: pointer; }
        
        section { margin-bottom: 30px; }
        h3 { border-left: 3px solid #e50914; padding-left: 10px; font-size: 1.2rem; }
        .grid-projects { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .card { padding: 40px; border: 1px solid #222; text-align: center; cursor: pointer; }
        .card:hover { border-color: #e50914; background: rgba(229,9,20,0.05); }


        .portfolio-cv {
  width: 85% !important;
  height: 90% !important;
  background: #050505 !important;
  border: 1px solid #e50914 !important;
  box-shadow: 0 0 30px rgba(229, 9, 20, 0.2);
  display: flex;
  flex-direction: column;
  padding: 0 !important; /* Manejamos el padding interno */
}

.cv-header {
  background: #111;
  padding: 30px 40px;
  border-bottom: 1px solid #e50914;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-main h1 { font-size: 2.2rem; margin: 0; letter-spacing: 2px; }
.subtitle { color: #e50914; margin: 5px 0 0; font-size: 1rem; font-weight: bold; }

.cv-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: 100%;
  overflow: hidden;
}

.cv-aside {
  background: #0a0a0a;
  padding: 30px;
  border-right: 1px solid #222;
  font-size: 0.85rem;
}

.cv-main {
  padding: 40px;
  overflow-y: auto;
}

.section-title {
  font-size: 1.4rem;
  border-bottom: 2px solid #e50914;
  padding-bottom: 10px;
  margin-bottom: 25px;
  color: #fff;
}

.cv-section h4 { color: #888; font-size: 0.75rem; margin-bottom: 15px; }

.tag-container { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { background: #1a1a1a; padding: 4px 10px; border-radius: 3px; border: 1px solid #333; font-size: 0.75rem; }

.experience-item { margin-bottom: 35px; border-left: 2px solid #222; padding-left: 20px; transition: 0.3s; }
.experience-item.highlight { border-left-color: #e50914; background: rgba(229, 9, 20, 0.03); padding: 15px 20px; }

.exp-header { display: flex; justify-content: space-between; font-size: 1.1rem; }
.role { color: #e50914; margin: 5px 0; font-weight: bold; }

.skill-list { list-style: none; padding: 0; }
.skill-list li::before { content: "› "; color: #e50914; }

.edu-item { margin-bottom: 20px; }


        .hud-keys { position: absolute; top: 30px; right: 30px; display: flex; flex-direction: column; gap: 10px; background: rgba(0,0,0,0.5); padding: 15px; border-right: 3px solid #e50914; color: white; font-family: monospace; font-size: 0.9rem; }
      `}</style>
    </div>
  );
}

const styles = {
  container: { width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#000' }
};