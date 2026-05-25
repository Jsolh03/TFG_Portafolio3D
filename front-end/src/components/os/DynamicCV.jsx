import React from 'react';
import { useT, useLanguage } from '../../context/LanguageContext';
import { LANGUAGES } from '../../data/i18n';
import { USER_PHOTOS } from '../../data/userMedia';
import CVDownloadButton from './CVDownloadButton';
import '../../styles/DynamicStyle.css';

const PHOTO_OVERRIDES = {
  khaled: USER_PHOTOS.khaled,
  laura:  USER_PHOTOS.laura
};

export default function DynamicCV({ user }) {
  const t = useT();
  const { lang } = useLanguage();

  if (!user) return <p style={{ color: 'var(--text-color)', padding: '20px' }}>{t('cv.loading')}</p>;

  const skills = user.skills || user.coreStack || [];
  const overrideAvatar = PHOTO_OVERRIDES[user.id];
  const avatar = overrideAvatar || user.profileImg || null;
  const cvLang = user.cvLang || 'es';
  const showLangBadge = cvLang !== lang;
  const cvLangName = LANGUAGES.find(l => l.id === cvLang)?.name?.[lang] || cvLang;

  return (
    <div className="cv-dynamic-wrapper">
      <div className="cv-container">

        <div className="cv-toolbar">
          {showLangBadge && (
            <div className="cv-lang-badge">
              📝 {t('cv.langBadge', { lang: cvLangName })}
            </div>
          )}
          <div className="cv-toolbar-spacer" />
          <CVDownloadButton userId={user.id} userName={user.name || user.id} />
        </div>

        <header className="cv-header">
          <div className="cv-avatar-frame">
            {avatar
              ? <img
                  src={avatar}
                  alt={user.name}
                  className="cv-avatar-img"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              : <div className="cv-avatar-placeholder">👤</div>
            }
          </div>
          <h1 className="cv-name">{user.name}</h1>
          <p className="cv-tagline">{user.tagline || user.subtitle}</p>
        </header>

        {user.aboutMe && (
          <section className="cv-section">
            <h3 className="cv-section-title">{t('cv.aboutMe')}</h3>
            <p className="cv-about-text">{user.aboutMe}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">{t('cv.skills')}</h3>
            <div className="cv-skills-grid">
              {skills.map((s, i) => (
                <span key={i} className="cv-skill-badge">{s}</span>
              ))}
            </div>
          </section>
        )}

        {user.experience?.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">{t('cv.experience')}</h3>
            {user.experience.map((exp, i) => (
              <div key={i} className="cv-experience-card">
                <strong>{exp.role}</strong>
                <p className="cv-meta">{exp.company} · {exp.period}</p>
              </div>
            ))}
          </section>
        )}

        {user.education?.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">{t('cv.education')}</h3>
            {user.education.map((ed, i) => (
              <div key={i} className="cv-experience-card">
                <strong>{ed.title || ed}</strong>
                {ed.institution && <p className="cv-meta">{ed.institution} · {ed.period}</p>}
              </div>
            ))}
          </section>
        )}

        {user.projects?.length > 0 && (
          <section className="cv-section">
            <h3 className="cv-section-title">{t('cv.projects')}</h3>
            {user.projects.map((p, i) => (
              <div key={i} className="cv-experience-card">
                <strong>{p.title}</strong>
                {p.description && <p>{p.description}</p>}
                {p.url && <a className="cv-project-link" href={p.url} target="_blank" rel="noreferrer">{t('cv.viewProject')}</a>}
              </div>
            ))}
          </section>
        )}

        {user.contact && (
          <section className="cv-section">
            <h3 className="cv-section-title">{t('cv.contact')}</h3>
            <div className="cv-contact-grid">
              {user.contact.email && <a href={`mailto:${user.contact.email}`}>{user.contact.email}</a>}
              {user.contact.github && <a href={user.contact.github} target="_blank" rel="noreferrer">GitHub</a>}
              {user.contact.linkedin && <a href={user.contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
