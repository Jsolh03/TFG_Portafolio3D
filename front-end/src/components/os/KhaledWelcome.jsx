import React, { useEffect } from 'react';

/**
 * Pantalla de bienvenida personal en la habitación de Khaled.
 * Sustituye el panel de "Info proyecto" cuando estás en su sala.
 * Interactivo y animado pero sin ser intrusivo.
 */
export default function KhaledWelcome({ onClose }) {
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
            <span className="kw-wave">👋</span> ¡Bienvenido!
          </span>
          <button className="kw-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        <div className="kw-body">

          <div className="kw-section">
            <h1 className="kw-title">
              Bienvenido a mi <span className="kw-accent">portfolio</span>
            </h1>
          </div>

          <div className="kw-section">
            <p className="kw-intro">
              Soy <strong>Khaled</strong> — <em>Junior Full-Stack Developer</em>.
              <span className="kw-asterisk">
                Junior, sí — aunque hoy en día el listón sube cada día, así que el título caduca rápido, no?
                Espero que esta experiencia me sirva para mejorar y para que me conozcas mejor.
              </span>
            </p>
          </div>

          <div className="kw-section">
            <div className="kw-mission">
              <span className="kw-mission-label">A dónde voy</span>
              <span className="kw-mission-text">
                Quiero convertirme en experto en <strong>vibe coding</strong>,{' '}
                <strong>flujos de automatización</strong> y <strong>agentes IA</strong> —
                construir cosas grandes sin morir en el intento.
              </span>
            </div>
          </div>

          <div className="kw-section">
            <div className="kw-reasons-title">¿Qué te trae por aquí?</div>
            <div className="kw-reason-grid">
              <div className="kw-reason">
                <span className="kw-reason-icon">🎯</span>
                <strong>Te interesa mi perfil</strong>
                <p>
                  Pásate por el PC donde encontrarás <code>Mi_CV.exe</code> con la versión completa
                  y <code>Mail.exe</code> si quieres escribirme directo.
                </p>
                <p>Y si quieres contactarme directamente, dentro tienes mis redes sociales, correo incluido.</p>
              </div>
              <div className="kw-reason">
                <span className="kw-reason-icon">🌐</span>
                <strong>¿Andas explorando las salas?</strong>
                <p>
                  Bienvenido, ponte a trastear. Cada usuario tiene su propia habitación con
                  su CV y apps ( aunque por ahora no existan muchas, están creadas por Khaled y Laura, mi compañera y yo, con mucho cuidado).
                </p>
              </div>
            </div>
          </div>

          <div className="kw-section">
            <div className="kw-controls" style={{ gap: '6px' }}>
              <span className="kw-controls-label">Sobre la Interactividad y el Diseño 3D 🎨</span>
              <div style={{ fontSize: '0.85rem', lineHeight: '1.45', color: 'var(--text-muted-color)' }}>
                <p style={{ margin: '0 0 6px 0' }}>
                  Todo el trabajo de <strong>interactividad, triggers y lógica en Spline</strong> ha sido desarrollado a mano por mí para crear esta experiencia web inmersiva.
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  Los diseños en sí y mallas 3D provienen de la biblioteca pública de Spline (no modelados a mano desde cero), ya que la intención era centrarme en hacer el entorno dinámico e interactivo para que puedas disfrutar de algo original mientras navegas por mi perfil.
                </p>
                <p style={{ margin: '0', fontWeight: '500', color: 'var(--accent-color)' }}>
                  📍 Zonas interactivas disponibles: La mesita (CV), la máquina arcade, el PC y la cama. El resto de muebles tienen textos flotantes o son decoración.
                </p>
              </div>
            </div>
          </div>

          <div className="kw-section">
            <div className="kw-controls">
              <span className="kw-controls-label">Cómo se juega</span>
              <span className="kw-controls-list">
                <kbd>WASD</kbd> moverse
                <span>·</span>
                <kbd>E</kbd> interactuar
                <span>·</span>
                Prácticamente cada mueble = una función distinta, no te olvides de ver el PC y la máquina arcade, te van a encantar.
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
