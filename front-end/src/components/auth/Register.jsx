import React, { useState } from 'react';
import { useT, useLanguage } from '../../context/LanguageContext';
import { API_BASE } from '../../config';
import { AVAILABLE_ROOMS } from '../../data/roomUrls';

const TOTAL_STEPS = 4;

const APP_CATALOG = [
  { id: 'terminal', emoji: '>_' },
  { id: 'ide',      emoji: '</>' },
  { id: 'cv',       emoji: '📄' },
  { id: 'encuesta', emoji: '⭐' },
  { id: 'info',     emoji: 'ℹ️' },
  { id: 'mail',     emoji: '✉️' },
  { id: 'notes',    emoji: '📝' },
  { id: 'calc',     emoji: '🧮' },
  { id: 'clock',    emoji: '⏰' },
  { id: 'gallery',  emoji: '🖼️' },
  { id: 'snake',    emoji: '🐍' }
];

const EMPTY_EXPERIENCE = { role: '', company: '', period: '' };
const EMPTY_EDUCATION  = { title: '', institution: '', period: '' };
const EMPTY_PROJECT    = { title: '', description: '', url: '', image: '' };

export default function Register({ onRegisterSuccess, onCancel }) {
  const t = useT();
  const { lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgStatus, setImgStatus] = useState('idle');
  const [skillInput, setSkillInput] = useState('');
  const [roomIndex, setRoomIndex] = useState(0);
  // Tras crear la habitación temporal con éxito, guardamos los datos del user
  // para mostrar la cvAccessToken una vez antes de entrar. Como el usuario
  // no tiene auth en este flujo, no puede recuperarla luego: tiene que anotarla.
  const [createdTemporal, setCreatedTemporal] = useState(null);
  const [keyCopied, setKeyCopied] = useState(false);
  // Consentimiento RGPD + edad. Sin marcar ambos no se puede crear.
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    tagline: '',
    roomType: AVAILABLE_ROOMS[0]?.id || '',
    profileImg: '',
    email: '',
    linkedin: '',
    github: '',
    aboutMe: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    font: 'Inter',
    apps: ['terminal', 'cv'],
    cvLang: lang
  });

  const update = (patch) => setFormData(prev => ({ ...prev, ...patch }));

  const validateImageUrl = (url) => {
    if (!url) { setImgStatus('idle'); return; }
    setImgStatus('loading');
    const img = new Image();
    img.onload  = () => setImgStatus('ok');
    img.onerror = () => setImgStatus('error');
    img.src = url;
  };

  const canAdvance = () => {
    if (step === 1) return formData.id.trim() && formData.name.trim();
    if (step === 3) {
      if (imgStatus === 'error') return false;
      // Email obligatorio en wizard temporal para que después se pueda convertir
      // la habitación a cuenta permanente (matching id+email).
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
      return emailOk;
    }
    return true;
  };

  const next = () => { if (canAdvance() && step < TOTAL_STEPS) { setError(''); setStep(step + 1); } };
  const prev = () => { if (step > 1) { setError(''); setStep(step - 1); } };

  const goToRoom = (delta) => {
    const total = AVAILABLE_ROOMS.length;
    const newIdx = (roomIndex + delta + total) % total;
    setRoomIndex(newIdx);
    update({ roomType: AVAILABLE_ROOMS[newIdx].id });
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || formData.skills.includes(value)) { setSkillInput(''); return; }
    update({ skills: [...formData.skills, value] });
    setSkillInput('');
  };

  const removeSkill = (s) => update({ skills: formData.skills.filter(x => x !== s) });

  const updateListItem = (key, idx, patch) => {
    const arr = [...formData[key]];
    arr[idx] = { ...arr[idx], ...patch };
    update({ [key]: arr });
  };

  const removeListItem = (key, idx) => {
    update({ [key]: formData[key].filter((_, i) => i !== idx) });
  };

  const toggleApp = (appId) => {
    update({
      apps: formData.apps.includes(appId)
        ? formData.apps.filter(a => a !== appId)
        : [...formData.apps, appId]
    });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const payload = {
      id: formData.id,
      name: formData.name,
      tagline: formData.tagline,
      roomType: formData.roomType,
      profileImg: formData.profileImg,
      aboutMe: formData.aboutMe,
      skills: formData.skills,
      experience: formData.experience.filter(e => e.role || e.company),
      education: formData.education.filter(e => e.title || e.institution),
      projects: formData.projects.filter(p => p.title),
      font: formData.font,
      apps: formData.apps,
      cvLang: formData.cvLang,
      contact: {
        email: formData.email,
        linkedin: formData.linkedin,
        github: formData.github
      }
    };

    try {
      // /api/register crea HABITACIÓN TEMPORAL (3 días / 3 accesos). Para
      // habitaciones permanentes, ir por /api/auth/register + verificar.
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('common.error'));
      // Guardamos cvAccessToken en localStorage como fallback, pero el
      // usuario debería anotarla porque el navegador puede limpiarse.
      if (data.cvAccessToken && data.id) {
        try {
          localStorage.setItem(`tfg_cv_key_${data.id}`, data.cvAccessToken);
        } catch { /* localStorage bloqueado */ }
      }
      setCreatedTemporal(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (!createdTemporal?.cvAccessToken) return;
    try {
      await navigator.clipboard?.writeText(createdTemporal.cvAccessToken);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 1500);
    } catch { /* clipboard bloqueado */ }
  };

  const stepLabel = [
    t('wizard.identityLabel'),
    t('wizard.roomLabel'),
    t('wizard.profileLabel'),
    t('wizard.cvLabel')
  ][step - 1];

  // Pantalla intermedia: mostrar cvAccessToken UNA VEZ al usuario antes
  // de entrar a su habitación temporal. Sin auth no podrá recuperarla.
  if (createdTemporal?.cvAccessToken) {
    return (
      <div className="auth-form-wrap">
        <div className="auth-form" style={{ maxWidth: 520 }}>
          <h2 className="auth-title">🔑 {t('wizard.tempKeyTitle')}</h2>

          <div style={{
            padding: '12px 14px',
            background: 'rgba(245, 158, 11, 0.12)',
            borderLeft: '3px solid #f59e0b',
            borderRadius: 6,
            marginBottom: 16
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#fbbf24' }}>
              ⚠️ {t('wizard.tempKeyWarnTitle')}
            </p>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-color)' }}>
              {t('wizard.tempKeyWarnBody')}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            borderRadius: 8,
            padding: 14,
            marginBottom: 16
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted-color, #888)', marginBottom: 6 }}>
              {t('cvKey.currentKey')}
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              padding: '10px 12px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 4,
              wordBreak: 'break-all',
              color: '#58a6ff',
              marginBottom: 10
            }}>
              {createdTemporal.cvAccessToken}
            </div>
            <button
              type="button"
              onClick={handleCopyKey}
              className="auth-btn auth-btn--ghost"
              style={{ fontSize: '0.85rem' }}
            >
              {keyCopied ? `✓ ${t('cvKey.copied')}` : `📋 ${t('cvKey.copy')}`}
            </button>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--muted-color, #999)', lineHeight: 1.55, marginBottom: 16 }}>
            {t('wizard.tempKeyDesc')}
          </p>

          <div className="auth-actions">
            <button
              type="button"
              onClick={() => onRegisterSuccess(createdTemporal)}
              className="auth-btn auth-btn--primary"
            >
              {t('wizard.tempKeyContinue')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-root" onKeyDown={e => e.stopPropagation()} onKeyUp={e => e.stopPropagation()}>
      <div className="wizard-header">
        <button type="button" onClick={onCancel} className="wizard-back-arrow" aria-label={t('common.back')} title={t('common.back')}>←</button>
        <h1 className="wizard-title">{t('wizard.title')}</h1>
        <div className="wizard-step-label">
          {t('wizard.stepOf', { n: step, total: TOTAL_STEPS })} · {stepLabel}
        </div>
      </div>

      <div className="wizard-temporal-warning">
        ⏳ {t('wizard.temporalWarning')}
      </div>

      <div className="wizard-progress">
        {[...Array(TOTAL_STEPS)].map((_, i) => (
          <div
            key={i}
            className={`wizard-progress-segment ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'done' : ''}`}
          />
        ))}
      </div>

      <div className="wizard-body">

        {step === 1 && (
          <div className="wizard-step">
            <h3>{t('wizard.identityTitle')}</h3>
            <p className="wizard-hint">{t('wizard.identityHint')}</p>

            <div className="wizard-field">
              <label>{t('wizard.userId')}</label>
              <input
                type="text"
                className="wizard-input"
                placeholder={t('wizard.userIdPh')}
                value={formData.id}
                onChange={e => update({ id: e.target.value.toLowerCase().replace(/\s+/g, '') })}
              />
            </div>

            <div className="wizard-field">
              <label>{t('wizard.publicName')}</label>
              <input
                type="text"
                className="wizard-input"
                placeholder={t('wizard.publicNamePh')}
                value={formData.name}
                onChange={e => update({ name: e.target.value })}
              />
            </div>

            <div className="wizard-field">
              <label>{t('wizard.tagline')}</label>
              <input
                type="text"
                className="wizard-input"
                placeholder={t('wizard.taglinePh')}
                value={formData.tagline}
                onChange={e => update({ tagline: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h3>{t('wizard.roomTitle')}</h3>
            <p className="wizard-hint">{t('wizard.roomHint')}</p>

            <div className="wizard-carousel">
              <div className="wizard-carousel-frame">
                <button type="button" className="wizard-carousel-arrow" onClick={() => goToRoom(-1)}>◀</button>
                <div className="wizard-carousel-stage">
                  {AVAILABLE_ROOMS[roomIndex]?.image
                    ? <img src={AVAILABLE_ROOMS[roomIndex].image} alt={AVAILABLE_ROOMS[roomIndex].name} />
                    : <span style={{ color: 'var(--muted-color)' }}>🏠 {AVAILABLE_ROOMS[roomIndex]?.name}</span>
                  }
                </div>
                <button type="button" className="wizard-carousel-arrow" onClick={() => goToRoom(1)}>▶</button>
              </div>
              <div className="wizard-carousel-name">{AVAILABLE_ROOMS[roomIndex]?.name}</div>
              <div className="wizard-carousel-dots">
                {AVAILABLE_ROOMS.map((_, i) => (
                  <span key={i} className={i === roomIndex ? 'active' : ''} />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h3>{t('wizard.profileTitle')}</h3>
            <p className="wizard-hint">{t('wizard.profileHint')}</p>

            <div className="wizard-field">
              <label>{t('wizard.profileImg')}</label>
              <div className="wizard-profile">
                <div className={`wizard-avatar-preview ${imgStatus}`}>
                  {imgStatus === 'ok'
                    ? <img src={formData.profileImg} alt="preview" />
                    : <span className="wizard-avatar-placeholder">👤</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="url"
                    className="wizard-input"
                    placeholder={t('wizard.profileImgPh')}
                    value={formData.profileImg}
                    onChange={e => {
                      update({ profileImg: e.target.value });
                      validateImageUrl(e.target.value);
                    }}
                  />
                  <div className={`wizard-status ${imgStatus === 'ok' ? 'ok' : imgStatus === 'error' ? 'error' : ''}`}>
                    {imgStatus === 'idle'    && t('wizard.imgIdle')}
                    {imgStatus === 'loading' && t('wizard.imgLoading')}
                    {imgStatus === 'ok'      && t('wizard.imgOk')}
                    {imgStatus === 'error'   && t('wizard.imgError')}
                  </div>
                </div>
              </div>
            </div>

            <div className="wizard-field">
              <label>{t('wizard.email')} *</label>
              <input
                type="email"
                required
                className="wizard-input"
                placeholder={t('wizard.emailPh')}
                value={formData.email}
                onChange={e => update({ email: e.target.value })}
              />
              <small style={{ color: 'var(--muted-color, #888)', fontSize: '0.78rem' }}>
                {t('wizard.emailRequiredForSave')}
              </small>
              <div style={{
                background: 'rgba(88, 166, 255, 0.10)',
                borderLeft: '3px solid #58a6ff',
                borderRadius: 6,
                padding: '10px 12px',
                marginTop: 10,
                fontSize: '0.78rem',
                lineHeight: 1.55,
                color: 'var(--text-color)'
              }}>
                🔒 {t('account.emailUsageNote')}
              </div>
            </div>

            <div className="wizard-row">
              <div className="wizard-field">
                <label>{t('wizard.linkedin')}</label>
                <input
                  type="url"
                  className="wizard-input"
                  placeholder={t('wizard.linkedinPh')}
                  value={formData.linkedin}
                  onChange={e => update({ linkedin: e.target.value })}
                />
              </div>
              <div className="wizard-field">
                <label>{t('wizard.github')}</label>
                <input
                  type="url"
                  className="wizard-input"
                  placeholder={t('wizard.githubPh')}
                  value={formData.github}
                  onChange={e => update({ github: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="wizard-step">
            <h3>{t('wizard.cvTitle')}</h3>
            <p className="wizard-hint">{t('wizard.cvHint')}</p>

            <div className="wizard-field">
              <label>{t('wizard.aboutMe')}</label>
              <textarea
                className="wizard-textarea"
                placeholder={t('wizard.aboutMePh')}
                value={formData.aboutMe}
                onChange={e => update({ aboutMe: e.target.value })}
              />
            </div>

            <div className="wizard-field">
              <label>{t('wizard.skills')}</label>
              <div className="wizard-chips">
                {formData.skills.map(s => (
                  <span key={s} className="wizard-chip">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)}>×</button>
                  </span>
                ))}
                <input
                  type="text"
                  className="wizard-chips-input"
                  placeholder={formData.skills.length === 0 ? t('wizard.skillsPh') : ''}
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
                    if (e.key === 'Backspace' && !skillInput && formData.skills.length) {
                      update({ skills: formData.skills.slice(0, -1) });
                    }
                  }}
                />
              </div>
            </div>

            <div className="wizard-field">
              <label>{t('wizard.experience')}</label>
              {formData.experience.map((exp, i) => (
                <div key={i} className="wizard-list-item">
                  <button className="wizard-list-remove" onClick={() => removeListItem('experience', i)}>×</button>
                  <input className="wizard-input" placeholder={t('wizard.role')} value={exp.role} onChange={e => updateListItem('experience', i, { role: e.target.value })} />
                  <div className="wizard-row">
                    <input className="wizard-input" placeholder={t('wizard.company')} value={exp.company} onChange={e => updateListItem('experience', i, { company: e.target.value })} />
                    <input className="wizard-input" placeholder={t('wizard.period')} value={exp.period} onChange={e => updateListItem('experience', i, { period: e.target.value })} />
                  </div>
                </div>
              ))}
              <button type="button" className="wizard-add-btn" onClick={() => update({ experience: [...formData.experience, { ...EMPTY_EXPERIENCE }] })}>
                {t('wizard.experienceAdd')}
              </button>
            </div>

            <div className="wizard-field">
              <label>{t('wizard.education')}</label>
              {formData.education.map((ed, i) => (
                <div key={i} className="wizard-list-item">
                  <button className="wizard-list-remove" onClick={() => removeListItem('education', i)}>×</button>
                  <input className="wizard-input" placeholder={t('wizard.eduTitle')} value={ed.title} onChange={e => updateListItem('education', i, { title: e.target.value })} />
                  <div className="wizard-row">
                    <input className="wizard-input" placeholder={t('wizard.institution')} value={ed.institution} onChange={e => updateListItem('education', i, { institution: e.target.value })} />
                    <input className="wizard-input" placeholder={t('wizard.eduPeriod')} value={ed.period} onChange={e => updateListItem('education', i, { period: e.target.value })} />
                  </div>
                </div>
              ))}
              <button type="button" className="wizard-add-btn" onClick={() => update({ education: [...formData.education, { ...EMPTY_EDUCATION }] })}>
                {t('wizard.educationAdd')}
              </button>
            </div>

            <div className="wizard-field">
              <label>{t('wizard.projects')}</label>
              {formData.projects.map((p, i) => (
                <div key={i} className="wizard-list-item">
                  <button className="wizard-list-remove" onClick={() => removeListItem('projects', i)}>×</button>
                  <input className="wizard-input" placeholder={t('wizard.projectTitle')} value={p.title} onChange={e => updateListItem('projects', i, { title: e.target.value })} />
                  <textarea className="wizard-textarea" placeholder={t('wizard.projectDesc')} value={p.description} onChange={e => updateListItem('projects', i, { description: e.target.value })} />
                  <div className="wizard-row">
                    <input className="wizard-input" placeholder={t('wizard.projectUrl')} value={p.url} onChange={e => updateListItem('projects', i, { url: e.target.value })} />
                    <input className="wizard-input" placeholder={t('wizard.projectImg')} value={p.image} onChange={e => updateListItem('projects', i, { image: e.target.value })} />
                  </div>
                </div>
              ))}
              <button type="button" className="wizard-add-btn" onClick={() => update({ projects: [...formData.projects, { ...EMPTY_PROJECT }] })}>
                {t('wizard.projectsAdd')}
              </button>
            </div>

            <div className="wizard-field">
              <label>{t('wizard.pcApps')}</label>
              <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: 'var(--muted-color, #888)' }}>
                {t('wizard.pcAppsHint')}
              </p>
              <div className="wizard-apps-grid">
                {APP_CATALOG.map(app => {
                  const active = formData.apps.includes(app.id);
                  return (
                    <div
                      key={app.id}
                      className={`wizard-app-card ${active ? 'active' : ''}`}
                      onClick={() => toggleApp(app.id)}
                      title={t(`appsDesc.${app.id}`)}
                    >
                      <span className="wizard-app-card-emoji">{app.emoji}</span>
                      <span className="wizard-app-card-name">{t(`apps.${app.id}`)}</span>
                      <span className="wizard-app-card-desc">{t(`appsDesc.${app.id}`)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 0 4px', fontSize: '0.82rem', lineHeight: 1.5, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={confirmedAge}
                onChange={e => setConfirmedAge(e.target.checked)}
                disabled={loading}
                style={{ marginTop: 3 }}
              />
              <span>{t('account.confirmAge')}</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0 8px', fontSize: '0.82rem', lineHeight: 1.5, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                disabled={loading}
                style={{ marginTop: 3 }}
              />
              <span>
                {t('account.acceptTermsPre')}{' '}
                <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">{t('legal.privacyShort')}</a>
                {' '}{t('common.and') || 'y'}{' '}
                <a href="/legal/terms" target="_blank" rel="noopener noreferrer">{t('legal.termsShort')}</a>.
              </span>
            </label>
          </div>
        )}

        {error && <div className="wizard-error" style={{ marginTop: 14 }}>{error}</div>}
      </div>

      <div className="wizard-footer">
        <button type="button" className="wizard-btn" onClick={step === 1 ? onCancel : prev}>
          {step === 1 ? t('common.cancel') : t('wizard.backToLogin')}
        </button>

        {step < TOTAL_STEPS ? (
          <button type="button" className="wizard-btn wizard-btn--primary" onClick={next} disabled={!canAdvance()}>
            {t('common.next')} →
          </button>
        ) : (
          <button
            type="button"
            className="wizard-btn wizard-btn--primary"
            onClick={handleSubmit}
            disabled={loading || !acceptedTerms || !confirmedAge}
          >
            {loading ? t('wizard.creating') : t('wizard.createAccount')}
          </button>
        )}
      </div>
    </div>
  );
}
