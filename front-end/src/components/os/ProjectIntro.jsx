import React from 'react';

export default function ProjectIntro({ onContinue }) {
  return (
    <div className="intro-overlay">
      <div className="intro-window">

        <header className="intro-header" style={{ position: 'relative' }}>
          <div className="intro-header-controls">
            <span className="dot close" onClick={onContinue} title="Cerrar"></span>
            <span className="dot minimize"></span>
            <span className="dot maximize"></span>
          </div>
          <span className="intro-title-bar">SYSTEM_INFO_v1.0</span>
          <button className="intro-close-btn" onClick={onContinue}>✕</button>
        </header>

        <div className="intro-body">
          <h2>PORTFOLIO 3D</h2>
          <p className="intro-subtitle">Trabajo de Fin de Grado</p>

          <div className="intro-stack">
            <div className="intro-stack-item">
              <span>Frontend</span>
              <span>React + Spline 3D</span>
            </div>
            <div className="intro-stack-item">
              <span>Backend</span>
              <span>Node.js + Express</span>
            </div>
            <div className="intro-stack-item">
              <span>Base de datos</span>
              <span>MongoDB Atlas</span>
            </div>
          </div>

          <button className="intro-btn" onClick={onContinue}>
            INICIALIZAR ENTORNO
          </button>
        </div>

      </div>
    </div>
  );
}