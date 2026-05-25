import React, { useEffect } from 'react';

/**
 * Pantalla de bienvenida personal en la habitacion de Laura.
 * Misma estructura que KhaledWelcome — pendiente de que Laura rellene los textos.
 *
 * TODO Laura: sustituye cada bloque marcado con  ✏️  por tu contenido real.
 * Los Lorem ipsum son solo para que se vea el layout mientras editas.
 */
export default function LauraWelcome({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="kw-overlay" onClick={onClose}>
      <div className="kw-card" onClick={e => e.stopPropagation()}>

        <header className="kw-header">
          <span className="kw-hello">
            <span className="kw-wave"></span> ¡Bienvenido a la habitación de Laura!
          </span>
          <button className="kw-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        <div className="kw-body">

          <div className="kw-section">
            <h1 className="kw-title">
              <span className="kw-accent">Este es mi Portfolio interactivo.</span>
            </h1>
          </div>

          <div className="kw-section">
            <p className="kw-intro">
              Soy <strong>Laura</strong> — <em>Junior Back-End Developer</em>.
              <span className="kw-asterisk">
                Desarrolladora Back-end Junior enfocada en Java, Spring Boot y SQL Server, con conocimientos en React. 
                Apasionada por el diseño de bases de datos y la creación de arquitecturas sólidas. 
              </span>
            </p>
          </div>

          <div className="kw-section">
            <div className="kw-mission">
              <span className="kw-mission-label">A dónde voy</span>
              <span className="kw-mission-text">
                Quiero llegar a ser una <strong>desarrolladora Back-End </strong> — especializada en crear sistemas eficientes y escalables..
              </span>
            </div>
          </div>

          <div className="kw-section">
            <div className="kw-reasons-title">¿Qué te trae por aquí?</div>
            <div className="kw-reason-grid">
              <div className="kw-reason">
                <span className="kw-reason-icon"></span>
                <strong>¿Quieres contactar conmigo?</strong>
                <p>
                  Pásate por el PC donde encontrarás <code>Mi_CV.exe</code> con la versión completa
                  y <code>Mail.exe</code> si quieres escribirme por correo directo.
                </p>
              </div>
            </div>
          </div>

          <div className="kw-section">
            <div className="kw-controls" style={{ gap: '6px' }}>
              <span className="kw-controls-label">Sobre este proyecto: </span>
              <div style={{ fontSize: '0.85rem', lineHeight: '1.45', color: 'var(--text-muted-color)' }}>
                <p style={{ margin: '0 0 6px 0' }}>
                  Mi compañero y yo hemos estado trabajando en este proyecto como fin de grado, hemos desarrollado la <strong>interactividad, triggers y lógica en Spline</strong>.
                  desde la herramienta de Spline a mano.
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  Los diseños 3D son cargados gratuitamente desde la misma herramienta de Spline utilizándolos para la decoración de las habitaciones.
                </p>
                <p style={{ margin: '0', fontWeight: '500', color: 'var(--accent-color)' }}>
                  📍 Zonas interactivas disponibles: PC, cama, tablero.
                </p>
              </div>
            </div>
          </div>

          <div className="kw-section">
            <div className="kw-controls">
              <span className="kw-controls-label">CÓMO JUGAR</span>
              <span className="kw-controls-list">
                <kbd>WASD</kbd> moverse
                <span>·</span>
                <kbd>E</kbd> interactuar
                <span>·</span>
                Puedes interactuar con las zonas disponibles interactivas. Animate a explorarla!
              </span>
            </div>
          </div>

          <div className="kw-section" style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="kw-cta" onClick={onClose}>
              Empezar a explorar
              <span className="kw-cta-arrow">→</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
