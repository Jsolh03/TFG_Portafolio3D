import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../config';
import { useAuth } from '../../context/AuthContext';

const POST_MAX = 500;
const REPLY_MAX = 300;

function timeAgo(date) {
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return d.toLocaleDateString();
}

export default function SocialApp() {
  const { isAuthenticated, user, token, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyOpen, setReplyOpen] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/posts`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('No se pudo cargar el feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const submitPost = async (e) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || submitting || !isAuthenticated) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error al publicar');
      setPosts(prev => [data, ...prev]);
      setDraft('');
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (postId) => {
    const text = replyDraft.trim();
    if (!text || submittingReply || !isAuthenticated) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Error al responder');
      setPosts(prev => prev.map(p => p._id === postId ? data : p));
      setReplyDraft('');
      setReplyOpen(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Bloqueo si no hay sesión
  if (!isAuthenticated) {
    return (
      <div className="social-app social-app--locked">
        <div className="social-locked-icon">🔒</div>
        <h2 className="social-locked-title">Esta función es únicamente para usuarios logeados</h2>
        <p className="social-locked-text">
          Para postear y responder en la red social del PC necesitas haber iniciado sesión.
        </p>
        <p className="social-locked-hint">
          Vuelve al inicio, regístrate con email + contraseña y verifica tu cuenta para acceder.
        </p>
      </div>
    );
  }

  return (
    <div className="social-app">
      <header className="social-header">
        <div>
          <h2 className="social-title">Feed del K-OS</h2>
          <span className="social-sub">Red social interna · solo usuarios autenticados</span>
        </div>
        <div className="social-user-info">
          <span className="social-user-id">@{user?.id}</span>
          <button type="button" className="social-logout-btn" onClick={logout} title="Cerrar sesión">salir</button>
        </div>
      </header>

      <form className="social-composer" onSubmit={submitPost}>
        <textarea
          className="social-composer-input"
          placeholder="¿Qué pasa por aquí?"
          maxLength={POST_MAX}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          disabled={submitting}
          onKeyDown={e => e.stopPropagation()}
        />
        <div className="social-composer-bar">
          <span className={`social-counter ${draft.length >= POST_MAX ? 'limit' : ''}`}>
            {draft.length}/{POST_MAX}
          </span>
          <button type="submit" disabled={submitting || !draft.trim()} className="social-publish-btn">
            {submitting ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </form>

      {error && <div className="social-error">{error}</div>}

      <div className="social-feed">
        {loading && <div className="social-feed-loading">Cargando…</div>}

        {!loading && posts.length === 0 && (
          <div className="social-feed-empty">Aún no hay posts. ¡Estrena el feed!</div>
        )}

        {!loading && posts.map(post => (
          <article key={post._id} className="social-post">
            <header className="social-post-head">
              <div className="social-post-avatar">{(post.authorName || post.authorId).slice(0, 1).toUpperCase()}</div>
              <div className="social-post-meta">
                <div className="social-post-author">{post.authorName || post.authorId} <span className="social-post-handle">@{post.authorId}</span></div>
                <div className="social-post-time">{timeAgo(post.createdAt)}</div>
              </div>
            </header>
            <div className="social-post-body">{post.text}</div>

            {post.replies?.length > 0 && (
              <div className="social-replies">
                {post.replies.map(r => (
                  <div key={r._id} className="social-reply">
                    <div className="social-reply-avatar">{(r.authorName || r.authorId).slice(0, 1).toUpperCase()}</div>
                    <div>
                      <div className="social-reply-author">{r.authorName || r.authorId} <span className="social-reply-handle">@{r.authorId}</span> · <span className="social-reply-time">{timeAgo(r.createdAt)}</span></div>
                      <div className="social-reply-body">{r.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <footer className="social-post-actions">
              {replyOpen === post._id ? (
                <div className="social-reply-form">
                  <textarea
                    className="social-reply-input"
                    placeholder="Tu respuesta…"
                    value={replyDraft}
                    onChange={e => setReplyDraft(e.target.value)}
                    maxLength={REPLY_MAX}
                    disabled={submittingReply}
                    autoFocus
                    onKeyDown={e => e.stopPropagation()}
                  />
                  <div className="social-reply-bar">
                    <span className={`social-counter ${replyDraft.length >= REPLY_MAX ? 'limit' : ''}`}>
                      {replyDraft.length}/{REPLY_MAX}
                    </span>
                    <button type="button" onClick={() => { setReplyOpen(null); setReplyDraft(''); }} className="social-reply-cancel">Cancelar</button>
                    <button type="button" onClick={() => submitReply(post._id)} disabled={submittingReply || !replyDraft.trim()} className="social-reply-submit">
                      {submittingReply ? 'Enviando…' : 'Responder'}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => { setReplyOpen(post._id); setReplyDraft(''); }} className="social-reply-trigger">
                  💬 Responder
                </button>
              )}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
