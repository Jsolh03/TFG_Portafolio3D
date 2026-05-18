import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../config';

function SecurityIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2.75C12.52 2.75 13.02 2.86 13.47 3.06L19 5.5C20.1 5.98 20.84 7.06 20.84 8.25V13.1C20.84 16.95 18.3 20.35 14.55 21.64L12.4 22.4C12.26 22.45 12.13 22.45 11.99 22.4L9.84 21.64C6.09 20.35 3.56 16.95 3.56 13.1V8.25C3.56 7.06 4.3 5.98 5.4 5.5L10.93 3.06C11.38 2.86 11.88 2.75 12.4 2.75H12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9.2 12.25L11.2 14.25L15.4 10.05"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DevPortal() {
  const [devPass, setDevPass] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState('');

  const DEV_PASSWORD = 'Qwerty12345*';

  const loadAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      if (res.ok) setAllUsers(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleDevAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (devPass !== DEV_PASSWORD) {
        setError('Contraseña incorrecta');
        setIsAuth(false);
        return;
      }
      setIsAuth(true);
      await loadAllUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(`¿Seguro que quieres borrar al usuario ${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) await loadAllUsers();
      else alert('Error al borrar usuario');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuth) loadAllUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  const headerStats = useMemo(() => {
    return {
      total: allUsers.length,
      protected: allUsers.filter((u) => u.id === 'khaled' || u.id === 'laura').length,
    };
  }, [allUsers]);

  return (
    <div className="dev-portal-root">
      <div className="dev-portal-bg" aria-hidden="true" />

      <div className="dev-portal-shell">
        {!isAuth ? (
          <div className="dev-portal-panel">
            <div className="dev-portal-breadcrumb">Portal de desarrolladores</div>
            <div className="dev-portal-title">
              <span className="dev-portal-title-main">Acceso para desarrolladores</span>
            </div>
            <div className="dev-portal-subtitle">
              <SecurityIcon />
              <span>Área restringida para miembros autorizados del proyecto</span>
            </div>

            <form className="dev-portal-form" onSubmit={handleDevAuth}>
              <label className="dev-portal-label" htmlFor="devPass">
                Contraseña
              </label>
              <input
                id="devPass"
                className="dev-portal-input"
                type="password"
                placeholder="••••••••••"
                value={devPass}
                onChange={(e) => setDevPass(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />

              {error ? <div className="dev-portal-error">{error}</div> : null}

              <button className="dev-portal-btn" type="submit" disabled={isLoading || !devPass.trim()}>
                {isLoading ? 'Verificando...' : 'Iniciar sesión'}
              </button>

              <div className="dev-portal-footnote">
                La contraseña se valida en el frontend para mantener compatibilidad con la lógica existente.
              </div>
            </form>
          </div>
        ) : (
          <div className="dev-portal-panel dev-portal-panel--authed">
            <div className="dev-portal-header">
              <div>
                <div className="dev-portal-breadcrumb">Acceso confirmado</div>
                <div className="dev-portal-title dev-portal-title--sm">Gestión de usuarios</div>
              </div>

              <div className="dev-portal-header-actions">
                <button
                  className="dev-portal-btn dev-portal-btn--ghost"
                  type="button"
                  onClick={() => {
                    setIsAuth(false);
                    setDevPass('');
                    setError('');
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="dev-portal-stats">
              <div className="stat-card">
                <div className="stat-card-k">Total</div>
                <div className="stat-card-v">{headerStats.total}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-k">Protegidos</div>
                <div className="stat-card-v">{headerStats.protected}</div>
              </div>
            </div>

            <div className="dev-users">
              {allUsers.map((u) => (
                <div key={u.id} className="dev-user-row">
                  <div className="dev-user-left">
                    <div className="dev-avatar">{String(u.name || u.id).slice(0, 1).toUpperCase()}</div>
                    <div>
                      <div className="dev-user-id">
                        <span className="dev-user-id-main">{u.id}</span>
                        {u.name ? <span className="dev-user-name">({u.name})</span> : null}
                      </div>
                      <div className="dev-user-meta">Habitación: {u.roomType}</div>
                    </div>
                  </div>

                  {u.id !== 'khaled' && u.id !== 'laura' ? (
                    <button className="dev-user-del" type="button" onClick={() => deleteUser(u.id)}>
                      Eliminar
                    </button>
                  ) : (
                    <div className="dev-user-protected">Protegido</div>
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

