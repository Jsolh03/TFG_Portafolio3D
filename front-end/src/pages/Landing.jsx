import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { useT } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import ProjectIntro from '../components/os/ProjectIntro';
import Register from '../components/auth/Register';
import RegisterAccount from '../components/auth/RegisterAccount';
import Login from '../components/auth/Login';
import SettingsPanel from '../components/ui/SettingsPanel';
import ContactPanel from '../components/ui/ContactPanel';
import { USER_PHOTOS } from '../data/userMedia';

const Room = lazy(() => import('./Room'));

const TYPEWRITER_INTERVAL = 80;
const TYPEWRITER_HOLD = 1800;

function Typewriter({ phrases }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[idx % phrases.length];
    if (!deleting && text === current) {
      const hold = setTimeout(() => setDeleting(true), TYPEWRITER_HOLD);
      return () => clearTimeout(hold);
    }
    if (deleting && text === '') {
      setDeleting(false);
      setIdx(i => (i + 1) % phrases.length);
      return;
    }
    const next = deleting
      ? current.slice(0, text.length - 1)
      : current.slice(0, text.length + 1);
    const id = setTimeout(() => setText(next), deleting ? TYPEWRITER_INTERVAL / 2 : TYPEWRITER_INTERVAL);
    return () => clearTimeout(id);
  }, [text, deleting, idx, phrases]);

  return <span className="lp-typewriter">{text}<span className="lp-caret">|</span></span>;
}

function HeroTitle({ text }) {
  return (
    <h1 className="lp-title">
      {text.split('').map((ch, i) => (
        <span key={i} className="lp-title-letter" style={{ animationDelay: `${i * 50}ms` }}>
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </h1>
  );
}

function UserCard({ id, name, photo, onClick, tagline, disabled }) {
  const ref = useRef(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--tx', `${x * 8}deg`);
    el.style.setProperty('--ty', `${-y * 8}deg`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tx', '0deg');
    el.style.setProperty('--ty', '0deg');
  };

  const showPhoto = photo && !photoFailed;

  return (
    <button
      ref={ref}
      className="lp-user-card"
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      disabled={disabled}
    >
      <div className="lp-user-card-glow"></div>
      <div className="lp-user-avatar">
        {showPhoto
          ? <img src={photo} alt={name} onError={() => setPhotoFailed(true)} />
          : <span>{name.slice(0, 1).toUpperCase()}</span>
        }
      </div>
      <div className="lp-user-name">{name}</div>
      <div className="lp-user-tagline">{tagline}</div>
      <div className="lp-user-id">@{id}</div>
    </button>
  );
}

function VisitRoomForm({ isLoading, loginError, onCancel, onSubmit }) {
  const t = useT();
  const [id, setId] = useState('');
  const [token, setToken] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!id.trim()) return;
    onSubmit(id.toLowerCase().trim(), token.trim());
  };
  return (
    <div className="auth-form-wrap">
      <form onSubmit={submit} className="auth-form">
        <button type="button" onClick={onCancel} className="auth-back" aria-label={t('common.back')}>← {t('common.back')}</button>
        <h2 className="auth-title">{t('landing.visitRoomTitle')}</h2>
        <p className="auth-subtitle">{t('landing.visitRoomSubtitle')}</p>

        <div className="auth-field">
          <label className="auth-label">{t('landing.visitRoomUserId')}</label>
          <input
            value={id}
            onChange={e => setId(e.target.value)}
            required maxLength={32} className="auth-input"
            placeholder="ej. khaled" disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">{t('landing.visitRoomToken')}</label>
          <input
            value={token}
            onChange={e => setToken(e.target.value)}
            maxLength={64} className="auth-input"
            placeholder={t('landing.visitRoomTokenPh')} disabled={isLoading}
          />
          <small style={{ color: 'var(--muted-color, #888)', fontSize: '0.78rem' }}>
            {t('landing.visitRoomTokenHint')}
          </small>
        </div>

        {loginError && <div className="auth-error">{loginError}</div>}

        <div className="auth-actions">
          <button type="button" onClick={onCancel} className="auth-btn auth-btn--ghost" disabled={isLoading}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="auth-btn auth-btn--primary" disabled={isLoading || !id.trim()}>
            {isLoading ? t('landing.visitRoomLoading') : t('landing.visitRoomEnter')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Landing() {
  const t = useT();
  const { user: authUser, isAuthenticated, logout } = useAuth();

  const [userData, setUserData] = useState(null);
  const [view, setView] = useState('login');
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null); // null | 'pending' | 'ok' | 'error'
  const [verifyMessage, setVerifyMessage] = useState('');
  const [registerPrefill, setRegisterPrefill] = useState(null); // { id, email } al venir desde room temporal

  // Permite que ModalPC (habitación temporal) navegue al RegisterAccount con
  // prefill del id y email, sin romper la arquitectura de props.
  useEffect(() => {
    const onSwitchToRegister = (e) => {
      const { id, email } = e.detail || {};
      setRegisterPrefill({ id, email });
      setUserData(null);
      setView('register-account');
    };
    window.addEventListener('tfg:switch-to-register', onSwitchToRegister);
    return () => window.removeEventListener('tfg:switch-to-register', onSwitchToRegister);
  }, []);

  const phrases = t('landing.taglineRotator');

  // Detecta ?verify=TOKEN en la URL y confirma email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify');
    if (!token) return;
    setVerifyStatus('pending');
    fetch(`${API_BASE}/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async r => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.error || t('landing.verifyError'));
        setVerifyStatus('ok');
        setVerifyMessage(`${t('landing.verifyOkPrefix')} "${data.id}".`);
        // Limpia el parámetro de la URL para que no se quede pegado
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch(err => {
        setVerifyStatus('error');
        setVerifyMessage(`${t('landing.verifyError')}: ${err.message || ''}`.trim());
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga la info de un user y entra a su habitación. Si la habitación
  // está protegida con token, lo pide; si está expirada (temporal), informa.
  const handleLogin = async (userId, accessToken = '') => {
    setIsLoading(true);
    setLoginError('');
    try {
      const url = new URL(`${API_BASE}/api/users/${userId}`);
      url.searchParams.set('visit', 'true');
      if (accessToken) url.searchParams.set('token', accessToken);

      // Header con JWT si el usuario está autenticado (le permite ver su
      // propia room privada sin token, p.ej.)
      const headers = {};
      const jwt = localStorage.getItem('tfg_auth_token');
      if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

      const response = await fetch(url.toString(), { headers });
      const data = await response.json().catch(() => ({}));
      if (response.status === 403 && data?.requiresToken) {
        throw new Error('requires_token');
      }
      if (response.status === 404 && data?.expired) {
        throw new Error('expired');
      }
      if (!response.ok) throw new Error('not_found');
      setUserData(data);
    } catch (error) {
      if (error.message === 'requires_token') setLoginError(t('landing.requiresToken'));
      else if (error.message === 'expired') setLoginError(t('landing.roomExpired'));
      else if (error.message === 'not_found') setLoginError(t('landing.userNotFound'));
      else setLoginError(t('landing.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (userData) {
    return (
      <Suspense fallback={<div className="loading-screen">Cargando 3D...</div>}>
        <Room
          userData={userData}
          onLogout={() => { setUserData(null); setView('login'); }}
        />
      </Suspense>
    );
  }

  const bgLayer = (
    <div className="lp-bg" aria-hidden="true">
      <div className="lp-blob lp-blob-1"></div>
      <div className="lp-blob lp-blob-2"></div>
      <div className="lp-blob lp-blob-3"></div>
    </div>
  );

  if (view === 'register') {
    return (
      <div className="main-container login-screen lp-root">
        {bgLayer}
        <Register
          onRegisterSuccess={(data) => { setUserData(data); }}
          onCancel={() => setView('login')}
        />
      </div>
    );
  }

  if (view === 'login-form') {
    return (
      <div className="main-container login-screen lp-root">
        {bgLayer}
        <Login
          onLoginSuccess={(user) => { setUserData(user); }}
          onCancel={() => setView('login')}
          onSwitchToRegister={() => setView('register-account')}
        />
      </div>
    );
  }

  if (view === 'register-account') {
    return (
      <div className="main-container login-screen lp-root">
        {bgLayer}
        <RegisterAccount
          onCancel={() => { setRegisterPrefill(null); setView('login'); }}
          onSwitchToLogin={() => { setRegisterPrefill(null); setView('login-form'); }}
          prefillId={registerPrefill?.id}
          prefillEmail={registerPrefill?.email}
        />
      </div>
    );
  }

  if (view === 'visit') {
    return (
      <div className="main-container login-screen lp-root">
        {bgLayer}
        <VisitRoomForm
          isLoading={isLoading}
          loginError={loginError}
          onCancel={() => { setView('login'); setLoginError(''); }}
          onSubmit={(id, token) => handleLogin(id, token)}
        />
      </div>
    );
  }

  return (
    <div className="main-container login-screen lp-root">
      <div className="lp-bg" aria-hidden="true">
        <div className="lp-blob lp-blob-1"></div>
        <div className="lp-blob lp-blob-2"></div>
        <div className="lp-blob lp-blob-3"></div>
        <div className="lp-grid-overlay"></div>
      </div>

      <header className="lp-topbar">
        <div className="lp-brand">
          <div className="lp-brand-dot"></div>
          <span>KyL</span>
        </div>

        <div className="lp-topbar-actions">
          {isAuthenticated && authUser && (
            <div className="lp-session-chip" title={`Sesión: ${authUser.id}`}>
              <span className="lp-session-dot" />
              <span className="lp-session-id">@{authUser.id}</span>
              <button type="button" className="lp-session-logout" onClick={logout} title={t('landing.sessionLogout')}>×</button>
            </div>
          )}
          <button
            className="lp-icon-btn"
            onClick={() => setContactOpen(true)}
            aria-label={t('contact.title')}
            title={t('contact.title')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </button>
          <button
            className="lp-icon-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('landing.settings')}
            title={t('landing.settings')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button
            className="lp-icon-btn lp-icon-btn--dev"
            onClick={() => window.location.assign('/dev')}
            aria-label={t('landing.devMode')}
            title={t('landing.devMode')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
            <span className="lp-icon-btn-tag">DEV</span>
          </button>
        </div>
      </header>

      <main className="lp-main">
        {verifyStatus && (
          <div className={`lp-verify-banner lp-verify-banner--${verifyStatus}`}>
            {verifyStatus === 'pending' && t('landing.verifyPending')}
            {verifyStatus !== 'pending' && (
              <>
                {verifyMessage}
                <button type="button" onClick={() => setVerifyStatus(null)} className="lp-verify-close">×</button>
              </>
            )}
          </div>
        )}

        <section className="lp-hero">
          <HeroTitle text={t('landing.title')} />
          <div className="lp-subtitle">
            <Typewriter phrases={phrases} />
          </div>
          <p className="lp-description">{t('landing.description')}</p>
        </section>

        <section className="lp-users-section">
          <div className="lp-section-label">{t('landing.featuredUsers')}</div>
          <div className="lp-users-grid">
            <UserCard
              id="khaled"
              name="Khaled Solh"
              tagline="Full-Stack Developer"
              photo={USER_PHOTOS.khaled}
              onClick={() => handleLogin('khaled')}
              disabled={isLoading}
            />
            <UserCard
              id="laura"
              name="Laura Jara"
              tagline="Back-End Developer"
              photo={USER_PHOTOS.laura}
              onClick={() => handleLogin('laura')}
              disabled={isLoading}
            />
          </div>
        </section>

        {loginError && <div className="lp-error" style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>{loginError}</div>}

        <section className="lp-cta-grid">
          <button className="lp-cta-card" onClick={() => { setLoginError(''); setView('visit'); }} disabled={isLoading}>
            <div className="lp-cta-emoji">👤</div>
            <div className="lp-cta-title">{t('landing.visitCta')}</div>
            <div className="lp-cta-desc">{t('landing.visitCtaDesc')}</div>
          </button>

          <button className="lp-cta-card lp-cta-card--accent" onClick={() => setView('login-form')} disabled={isLoading}>
            <div className="lp-cta-emoji">🔐</div>
            <div className="lp-cta-title">{t('landing.loginCta')}</div>
            <div className="lp-cta-desc">{t('landing.loginCtaDesc')}</div>
          </button>

          <button className="lp-cta-card" onClick={() => setView('register')} disabled={isLoading}>
            <div className="lp-cta-emoji">⏳</div>
            <div className="lp-cta-title">{t('landing.temporalCta')}</div>
            <div className="lp-cta-desc">{t('landing.temporalCtaDesc')}</div>
          </button>
        </section>
      </main>

      <footer className="lp-footer">
        <span>{t('landing.footer')}</span>
        <span className="lp-footer-sep">·</span>
        <span className="lp-footer-copyright">{t('landing.copyrightShort')}</span>
      </footer>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ContactPanel open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
