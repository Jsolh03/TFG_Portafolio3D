import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Login({ onLoginSuccess, onCancel, onSwitchToRegister }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.id.toLowerCase().trim(), form.password);
      onLoginSuccess?.(user);
    } catch (err) {
      setError(err?.message || 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form-wrap">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Iniciar sesión</h2>
        <p className="auth-subtitle">Accede con tu usuario verificado por email.</p>

        <div className="auth-field">
          <label className="auth-label">Nombre de usuario</label>
          <input
            name="id"
            value={form.id}
            onChange={handleChange}
            required
            autoComplete="username"
            placeholder="tu_usuario"
            className="auth-input"
            disabled={submitting}
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Contraseña</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="********"
            className="auth-input"
            disabled={submitting}
            minLength={8}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-actions">
          <button type="button" onClick={onCancel} className="auth-btn auth-btn--ghost" disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="auth-btn auth-btn--primary" disabled={submitting}>
            {submitting ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </div>

        <div className="auth-switch">
          ¿No tienes cuenta?{' '}
          <button type="button" onClick={onSwitchToRegister} className="auth-link" disabled={submitting}>
            Regístrate
          </button>
        </div>
      </form>
    </div>
  );
}
