import React from 'react';
import '../../styles/DynamicStyle.css';
import avatars from '../../data/avatars';

export default function DynamicCV({ user }) {
  if (!user) return <p style={{ color: 'white', padding: '20px' }}>Cargando datos del sistema...</p>;

  const skills = user.skills || user.coreStack || [];

  // Usa la imagen importada por userId (fiable con Vite).
  // Si no hay mapeo, intenta la URL de MongoDB como fallback.
  const avatar = avatars[user.id] || user.profileImg || null;

  return (
    <div className="cv-dynamic-wrapper">
      <div className="cv-container">

        {/* CABECERA */}
        <header className="cv-header">
          <div className="cv-avatar-frame">
            {avatar
              ? <img src={avatar} alt={user.name} className="cv-avatar-img" />
              : <div className="cv-avatar-placeholder">👤</div>
            }
          </div>
          <h1 className="cv-name">{user.name}</h1>
          <p className="cv-tagline">{user.tagline || user.subtitle}</p>
        </header>

        {/* SOBRE MÍ */}
        {user.aboutMe && (
          <section className="cv-section">
            <h3 className="cv-section-title">Sobre mí</h3>
            <p className="cv-about-text">{user.aboutMe}</p>
          </section>
        )}

        {/* TECNOLOGÍAS */}
        {skills.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">Tecnologías</h3>
            <div className="cv-skills-grid">
              {skills.map((s, i) => (
                <span key={i} className="cv-skill-badge">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* EXPERIENCIA */}
        {user.experience?.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">Experiencia</h3>
            {user.experience.map((exp, i) => (
              <div key={i} className="cv-experience-card">
                <strong>{exp.role}</strong>
                <p className="cv-meta">{exp.company} · {exp.period}</p>
              </div>
            ))}
          </section>
        )}

        {/* FORMACIÓN */}
        {user.education?.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">Formación</h3>
            {user.education.map((ed, i) => (
              <div key={i} className="cv-experience-card">
                <strong>{ed.title || ed}</strong>
                {ed.institution && <p className="cv-meta">{ed.institution} · {ed.period}</p>}
              </div>
            ))}
          </section>
        )}

        {/* PROYECTOS */}
        {user.projects?.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">Proyectos</h3>
            {user.projects.map((p, i) => (
              <div key={i} className="cv-experience-card">
                <strong>{p.title}</strong>
                {p.description && <p>{p.description}</p>}
              </div>
            ))}
          </section>
        )}

        {/* CONTACTO */}
        {user.contact && (
          <section className="cv-section">
            <h3 className="cv-section-title">Contacto</h3>
            <div className="cv-contact-grid">
              {user.contact.email && (
                <a href={`mailto:${user.contact.email}`}>{user.contact.email}</a>
              )}
              {user.contact.github && (
                <a href={user.contact.github} target="_blank" rel="noreferrer">GitHub</a>
              )}
              {user.contact.linkedin && (
                <a href={user.contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}