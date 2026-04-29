import React, { useState, useRef, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { translations } from '../data/translations';
import ModalPC from '../components/os/ModalPC';

export default function Room({ userData, onLogout }) {
  const [isStarted, setIsStarted] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [lang, setLang] = useState('ES');
  
  const splineRef = useRef();
  
  // Obtenemos las traducciones dinámicamente usando el ID del usuario
  const t = translations[userData.id][lang];

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!isStarted || !splineRef.current) return;

      const zona = splineRef.current.getVariable('zona_activa');

      if (key === 'e') {
        if (zona === 1) setShowDesktop(true);
        if (zona === 2) setShowCV(true);
        if (zona === 3) setShowBed(true);
        document.exitPointerLock?.();
      }
      if (key === 't' && zona === 3) onLogout();
      if (key === 'escape') {
        setShowDesktop(false); setShowCV(false); setShowBed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, onLogout]);

  return (
    <div className="main-container">
      {/* El escenario cambia según el usuario de la DB */}
      <Spline
        scene={userData.splineScene}
        onLoad={(app) => { splineRef.current = app; }}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Menú de Inicio Dinámico */}
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
              <button className="btn-nav" onClick={() => window.open(userData.githubUrl, '_blank')}>{t.github}</button>
            </nav>
          </div>
        </div>
      )}

      {showDesktop && <ModalPC onClose={() => setShowDesktop(false)} user={userData.id} />}

      {/* CV GENÉRICO */}
      {showCV && (
        <div className="modal-glass">
          <div className="modal-content portfolio-cv">
            <header className="cv-header">
              <div className="header-main">
                <h1>{userData.name}</h1>
                <p className="subtitle">{userData.subtitle}</p>
              </div>
              <button onClick={() => setShowCV(false)}>✕</button>
            </header>

            <div className="cv-grid">
              <aside className="cv-aside">
                <section className="cv-section">
                  <h4><span className="text-accent">//</span> CONTACT</h4>
                  <p>📍 {userData.contact.location}</p>
                  {userData.contact.phone && <p>📞 {userData.contact.phone}</p>}
                  <p>📧 {userData.contact.email}</p>
                  <p>🔗 {userData.contact.githubHandle}</p>
                </section>
                
                <section className="cv-section">
                  <h4><span className="text-accent">//</span> CORE_STACK</h4>
                  <div className="tag-container">
                    {userData.coreStack.map(skill => (
                      <span key={skill} className="tag">{skill}</span>
                    ))}
                  </div>
                </section>

                {/* Sección extra: Se adapta a AI Mastery o Habilidades */}
                <section className="cv-section">
                  <h4><span className="text-accent">//</span> {userData.extraSection.title}</h4>
                  <ul className="skill-list">
                    {userData.extraSection.items.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </section>
              </aside>

              <main className="cv-main">
                <section className="cv-section">
                  <h3 className="section-title">{lang === 'ES' ? 'TRAYECTORIA' : 'EXPERIENCE'}</h3>
                  {userData.experience.map((exp, index) => (
                    <div key={index} className={`experience-item ${index === 0 ? 'highlight' : ''}`}>
                      <div className="exp-header">
                        <strong>{exp.company}</strong>
                        <span>{exp.period}</span>
                      </div>
                      <p className="role">{exp.role}</p>
                      <p style={{ fontSize: '0.85rem' }}>{t[exp.descKey]}</p>
                    </div>
                  ))}
                </section>
              </main>
            </div>
          </div>
        </div>
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