import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../context/LanguageContext';
import FloatingSettingsButton from '../components/ui/FloatingSettingsButton';
import { API_BASE } from '../config';

const PROTECTED_IDS = new Set(['khaled', 'laura']);
const SLEEP_HINT_MS = 5000;
const LOAD_TIMEOUT_MS = 60000;

function BackLink({ label }) {
  return (
    <Link to="/" className="dev-portal-back" aria-label={label}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      {label}
    </Link>
  );
}

function SecurityIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.75c.52 0 1.02.11 1.47.31L19 5.5c1.1.48 1.84 1.56 1.84 2.75v4.85c0 3.85-2.54 7.25-6.29 8.54L12.4 22.4c-.14.05-.27.05-.41 0L9.84 21.64C6.09 20.35 3.56 16.95 3.56 13.1V8.25c0-1.19.74-2.27 1.84-2.75L10.93 3.06c.45-.2.95-.31 1.47-.31z"/>
      <path d="M9.2 12.25L11.2 14.25L15.4 10.05"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="dev-portal-spinner" width="22" height="22" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="80" strokeDashoffset="60"/>
    </svg>
  );
}

export default function DevPortal() {
  const t = useT();
  const [devPass, setDevPass] = useState('');
  const [token, setToken] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [showSleepHint, setShowSleepHint] = useState(false);

  const loadAllUsers = async (authToken = token) => {
    setLoadingUsers(true);
    setLoadError('');
    setShowSleepHint(false);
    const sleepTimer = setTimeout(() => setShowSleepHint(true), SLEEP_HINT_MS);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.status === 401) {
        setToken('');
        setIsAuth(false);
        throw new Error('Sesión expirada');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name === 'AbortError') setLoadError(`${t('devPortal.loadError')} (timeout)`);
      else setLoadError(`${t('devPortal.loadError')} (${e.message || 'unknown'})`);
    } finally {
      clearTimeout(sleepTimer);
      clearTimeout(timeoutId);
      setLoadingUsers(false);
      setShowSleepHint(false);
    }
  };

  const handleDevAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: devPass })
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.token) throw new Error('Token no recibido');
        setToken(data.token);
        setIsAuth(true);
        setDevPass('');
        await loadAllUsers(data.token);
      } else {
        setError(t('devPortal.wrongPassword'));
        setIsAuth(false);
      }
    } catch (e) {
      console.error("Error conectando con el servidor", e);
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(t('devPortal.deleteConfirm', { id }))) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setToken('');
        setIsAuth(false);
        alert(t('devPortal.deleteError'));
        return;
      }
      if (res.ok) await loadAllUsers();
      else alert(t('devPortal.deleteError'));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter(u =>
      (u.id || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.roomType || '').toLowerCase().includes(q)
    );
  }, [allUsers, search]);

  const stats = useMemo(() => ({
    total: allUsers.length,
    protected: allUsers.filter(u => PROTECTED_IDS.has(u.id)).length,
    visible: filteredUsers.length
  }), [allUsers, filteredUsers]);

  return (
    <div className="dev-portal-root">
      <div className="dev-portal-bg" aria-hidden="true" />
      <FloatingSettingsButton />

      <div className="dev-portal-shell">
        {!isAuth ? (
          <div className="dev-portal-panel">
            <div className="dev-portal-topbar">
              <BackLink label={t('devPortal.backHome')} />
              <span className="dev-portal-brand">{t('devPortal.brand')}</span>
            </div>

            <div className="dev-portal-breadcrumb">{t('devPortal.breadcrumb')}</div>
            <div className="dev-portal-title">
              <span className="dev-portal-title-main">{t('devPortal.loginTitle')}</span>
            </div>
            <div className="dev-portal-subtitle">
              <SecurityIcon />
              <span>{t('devPortal.loginSubtitle')}</span>
            </div>

            <form className="dev-portal-form" onSubmit={handleDevAuth}>
              <label className="dev-portal-label" htmlFor="devPass">{t('devPortal.password')}</label>
              <input
                id="devPass"
                className="dev-portal-input"
                type="password"
                placeholder={t('devPortal.passwordPh')}
                value={devPass}
                onChange={e => setDevPass(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />

              {error && <div className="dev-portal-error">{error}</div>}

              <button className="dev-portal-btn" type="submit" disabled={isLoading || !devPass.trim()}>
                {isLoading ? t('devPortal.verifying') : t('devPortal.login')}
              </button>

              <div className="dev-portal-footnote">{t('devPortal.footnote')}</div>
            </form>
          </div>
        ) : (
          <div className="dev-portal-panel dev-portal-panel--authed">
            <div className="dev-portal-topbar" style={{ borderBottom: 'none', padding: '0 0 14px' }}>
              <BackLink label={t('devPortal.backHome')} />
              <div className="dev-portal-header-actions">
                <button
                  className="dev-portal-btn dev-portal-btn--ghost"
                  type="button"
                  onClick={() => { setIsAuth(false); setToken(''); setDevPass(''); setError(''); setSearch(''); setAllUsers([]); }}
                >
                  {t('devPortal.logout')}
                </button>
              </div>
            </div>

            <div>
              <div className="dev-portal-breadcrumb" style={{ padding: 0 }}>{t('devPortal.accessConfirmed')}</div>
              <div className="dev-portal-title dev-portal-title--sm" style={{ padding: '6px 0 0' }}>
                {t('devPortal.userMgmt')}
              </div>
            </div>

            <div className="dev-portal-stats">
              <div className="stat-card">
                <div className="stat-card-k">{t('devPortal.statTotal')}</div>
                <div className="stat-card-v">{stats.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-k">{t('devPortal.statProtected')}</div>
                <div className="stat-card-v">{stats.protected}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-k">{t('devPortal.statVisible')}</div>
                <div className="stat-card-v">{stats.visible}</div>
              </div>
            </div>

            <div className="dev-portal-toolbar">
              <input
                className="dev-portal-search"
                type="search"
                placeholder={t('devPortal.searchPh')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button
                className="dev-portal-btn--icon"
                type="button"
                onClick={loadAllUsers}
                title={t('devPortal.refresh')}
                disabled={loadingUsers}
                style={loadingUsers ? { opacity: 0.6 } : undefined}
              >
                <RefreshIcon />
              </button>
            </div>

            <div className="dev-users">
              {loadingUsers && (
                <div className="dev-portal-loading">
                  <Spinner />
                  <span>{t('devPortal.loadingUsers')}</span>
                  {showSleepHint && <small>{t('devPortal.serverSleeping')}</small>}
                </div>
              )}

              {!loadingUsers && loadError && (
                <div className="dev-portal-loaderror">
                  <span>{loadError}</span>
                  <button className="dev-portal-btn--ghost" onClick={loadAllUsers}>
                    {t('common.retry')}
                  </button>
                </div>
              )}

              {!loadingUsers && !loadError && filteredUsers.length === 0 && (
                <div className="dev-portal-empty">
                  {search ? t('devPortal.emptySearch') : t('devPortal.emptyUsers')}
                </div>
              )}

              {!loadingUsers && !loadError && filteredUsers.map(u => (
                <div key={u.id} className="dev-user-row">
                  <div className="dev-user-left">
                    <div className="dev-avatar">{String(u.name || u.id).slice(0, 1).toUpperCase()}</div>
                    <div>
                      <div className="dev-user-id">
                        <span className="dev-user-id-main">{u.id}</span>
                        {u.name && <span className="dev-user-name">({u.name})</span>}
                      </div>
                      <div className="dev-user-meta">{t('devPortal.roomLabel')}: {u.roomType || '—'}</div>
                    </div>
                  </div>

                  {PROTECTED_IDS.has(u.id) ? (
                    <div className="dev-user-protected">{t('devPortal.protectedTag')}</div>
                  ) : (
                    <button className="dev-user-del" type="button" onClick={() => deleteUser(u.id)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <TrashIcon /> {t('devPortal.delete')}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
