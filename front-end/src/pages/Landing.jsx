import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { useT } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import ProjectIntro from '../components/os/ProjectIntro';
import Register from '../components/auth/Register';
import Login from '../components/auth/Login';
import SettingsPanel from '../components/ui/SettingsPanel';
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

export default function Landing() {
  const t = useT();
  const { user: authUser, isAuthenticated, logout } = useAuth();

  const [userData, setUserData] = useState(null);
  const [view, setView] = useState('login');
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null); // null | 'pending' | 'ok' | 'error'
  const [verifyMessage, setVerifyMessage] = useState('');

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
        if (!r.ok) throw new Error(data?.error || 'No se pudo verificar el email');
        setVerifyStatus('ok');
        setVerifyMessage(`✅ Email verificado. Ya puedes iniciar sesión como "${data.id}".`);
        // Limpia el parámetro de la URL para que no se quede pegado
        window.history.replaceState({}, '', window.location.pathname);
      })
      .catch(err => {
        setVerifyStatus('error');
        setVerifyMessage(`❌ ${err.message || 'Verificación fallida'}`);
      });
  }, []);

  const handleLogin = async (userId) => {
    setIsLoading(true);
    setLoginError('');
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}`);
      if (!response.ok) throw new Error('not_found');
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      setLoginError(error.message === 'not_found' ? t('landing.userNotFound') : t('landing.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    setUserData({
      id: 'guest',
      name: 'Invitado',
      isGuest: true,
      roomType: 'generic1',
      apps: ['terminal', 'ide', 'cv', 'encuesta', 'info', 'mail', 'notes', 'calc', 'clock', 'gallery', 'snake']
    });
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

  if (view === 'register') {
    return (
      <div className="main-container login-screen lp-root">
        <div className="lp-bg" aria-hidden="true">
          <div className="lp-blob lp-blob-1"></div>
          <div className="lp-blob lp-blob-2"></div>
          <div className="lp-blob lp-blob-3"></div>
        </div>
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
        <div className="lp-bg" aria-hidden="true">
          <div className="lp-blob lp-blob-1"></div>
          <div className="lp-blob lp-blob-2"></div>
          <div className="lp-blob lp-blob-3"></div>
        </div>
        <Login
          onLoginSuccess={(user) => { setUserData(user); }}
          onCancel={() => setView('login')}
          onSwitchToRegister={() => setView('register')}
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
              <button type="button" className="lp-session-logout" onClick={logout} title="Cerrar sesión">×</button>
            </div>
          )}
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
            {verifyStatus === 'pending' && '⌛ Verificando email…'}
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

        <section className="lp-quick">
          <div className="lp-section-label">{t('landing.quickAccess')}</div>
          <div className="lp-quick-input">
            <input
              type="text"
              placeholder={t('landing.quickAccessPlaceholder')}
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && loginId.trim()) handleLogin(loginId.toLowerCase().trim());
              }}
              disabled={isLoading}
            />
            <button
              className="lp-quick-btn"
              onClick={() => handleLogin(loginId.toLowerCase().trim())}
              disabled={isLoading || !loginId.trim()}
            >
              {t('landing.enter')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
          {loginError && <div className="lp-error">{loginError}</div>}
        </section>

        <section className="lp-cta-grid">
          <button className="lp-cta-card" onClick={handleGuest} disabled={isLoading}>
            <div className="lp-cta-emoji">👤</div>
            <div className="lp-cta-title">{t('landing.guest')}</div>
            <div className="lp-cta-desc">{t('landing.guestDesc')}</div>
          </button>

          <button className="lp-cta-card" onClick={() => setView('login-form')} disabled={isLoading}>
            <div className="lp-cta-emoji">🔐</div>
            <div className="lp-cta-title">Iniciar sesión</div>
            <div className="lp-cta-desc">Con tu cuenta verificada por email</div>
          </button>

          <button className="lp-cta-card lp-cta-card--accent" onClick={() => setView('register')} disabled={isLoading}>
            <div className="lp-cta-emoji">✨</div>
            <div className="lp-cta-title">{t('landing.register')}</div>
            <div className="lp-cta-desc">{t('landing.registerDesc')}</div>
          </button>
        </section>
      </main>

      <footer className="lp-footer">
        <span>{t('landing.footer')}</span>
      </footer>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
