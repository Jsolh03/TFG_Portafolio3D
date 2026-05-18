import React from 'react';

// Aceptamos ambos nombres para que no falle en ningún sitio
export default function ProjectIntro({ onClose, onContinue }) {
  
  // Usamos el que esté disponible (uno será para el inicio y otro para el menú)
  const handleAction = onClose || onContinue;

  return (
    <div className="modal-glass" onClick={handleAction}>
      <div className="intro-window" onClick={(e) => e.stopPropagation()}>

        <header className="intro-header">
          <div className="intro-header-controls">
            {/* Si el punto close no funciona, es porque handleAction no llegaba */}
            <span className="dot close" onClick={handleAction} title="Cerrar"></span>
            <span className="dot minimize"></span>
            <span className="dot maximize"></span>
          </div>
          <span className="intro-title-bar">SYSTEM_INFO.log</span>
          <button className="intro-close-btn" onClick={handleAction}>✕</button>
        </header>

        <div className="intro-body">
          <h2>PORTFOLIO 3D<span>_</span></h2>
          <p className="intro-subtitle">TRABAJO DE FIN DE GRADO</p>

          <div className="intro-info-item">
            <span>
              Este proyecto es un <b>Portfolio 3D interactivo</b> en el que puedes explorar 
              los distintos usuarios con sus <b>CV personalizados</b> y habitaciones propias.
            </span>
          </div>

          <div className="intro-stack">
            <div className="intro-stack-item">
              <span>FRONTEND</span>
              <span>React + Spline 3D</span>
            </div>
            <div className="intro-stack-item">
              <span>BACKEND</span>
              <span>Node.js + Express</span>
            </div>
            <div className="intro-stack-item">
              <span>DATABASE</span>
              <span>MongoDB Atlas</span>
            </div>
            <div className="intro-stack-item">
              <span>AUTORES</span>
              <span>Khaled Solh y Laura Jara</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}