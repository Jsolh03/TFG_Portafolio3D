import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useT } from '../../context/LanguageContext';

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

/* Avatar reutilizable: si hay foto la pinta, si no muestra la inicial.
   Tamaños predefinidos para mantener consistencia (header, post, reply). */
function SocialAvatar({ src, name, size = 36, className = '' }) {
  const initial = (name || '?').slice(0, 1).toUpperCase();
  const dim = `${size}px`;
  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={className}
        style={{
          width: dim,
          height: dim,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0
        }}
        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.replaceWith(Object.assign(document.createElement('span'), { textContent: initial, className })); }}
      />
    );
  }
  return <div className={className}>{initial}</div>;
}

export default function SocialApp() {
  const t = useT();
  const { isAuthenticated, user, token } = useAuth();

  const goToMyRoom = () => {
    // Aviso a Landing: cierra el room actual y carga el del usuario logueado.
    // Si Landing aún no escucha, hacemos fallback con location.href.
    window.dispatchEvent(new CustomEvent('tfg:goto-my-room'));
  };
  const editMyRoom = () => {
    window.dispatchEvent(new CustomEvent('tfg:edit-my-room'));
  };
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
      setError(t('social.errorLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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

  const deletePost = async (postId) => {
    if (!window.confirm(t('social.confirmDeletePost'))) return;
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Error');
      }
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteReply = async (postId, replyId) => {
    if (!window.confirm(t('social.confirmDeleteReply'))) return;
    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/replies/${replyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Error');
      }
      setPosts(prev => prev.map(p =>
        p._id === postId
          ? { ...p, replies: (p.replies || []).filter(r => r._id !== replyId) }
          : p
      ));
    } catch (e) {
      setError(e.message);
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
        <h2 className="social-locked-title">{t('social.lockedTitle')}</h2>
        <p className="social-locked-text">{t('social.lockedText')}</p>
        <p className="social-locked-hint">{t('social.lockedHint')}</p>
      </div>
    );
  }

  return (
    <div className="social-app">
      <header className="social-header">
        <div>
          <h2 className="social-title">{t('social.title')}</h2>
          <span className="social-sub">{t('social.sub')}</span>
        </div>
        <div className="social-user-info" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <SocialAvatar
            src={user?.profileImg}
            name={user?.name || user?.id}
            size={34}
            className="social-post-avatar"
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{user?.name || user?.id}</span>
            <span className="social-user-id">@{user?.id}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <button
              type="button"
              className="social-action-btn"
              onClick={goToMyRoom}
              title={t('social.goToMyRoom')}
            >
              🏠 {t('social.goToMyRoom')}
            </button>
            <button
              type="button"
              className="social-action-btn"
              onClick={editMyRoom}
              title={t('social.editMyRoom')}
            >
              ✏️ {t('social.editMyRoom')}
            </button>
          </div>
        </div>
      </header>

      <form className="social-composer" onSubmit={submitPost}>
        <textarea
          className="social-composer-input"
          placeholder={t('social.composerPh')}
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
            {submitting ? t('social.publishing') : t('social.publishBtn')}
          </button>
        </div>
      </form>

      {error && <div className="social-error">{error}</div>}

      <div className="social-feed">
        {loading && <div className="social-feed-loading">{t('social.feedLoading')}</div>}

        {!loading && posts.length === 0 && (
          <div className="social-feed-empty">{t('social.feedEmpty')}</div>
        )}

        {!loading && posts.map(post => (
          <article key={post._id} className="social-post">
            <header className="social-post-head">
              <SocialAvatar
                src={post.authorProfileImg || (post.authorId === user?.id ? user?.profileImg : null)}
                name={post.authorName || post.authorId}
                size={40}
                className="social-post-avatar"
              />
              <div className="social-post-meta">
                <div className="social-post-author">{post.authorName || post.authorId} <span className="social-post-handle">@{post.authorId}</span></div>
                <div className="social-post-time">{timeAgo(post.createdAt)}</div>
              </div>
              {post.authorId === user?.id && (
                <button
                  type="button"
                  onClick={() => deletePost(post._id)}
                  title={t('social.deletePost')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--muted-color, #888)',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    padding: '2px 6px',
                    marginLeft: 'auto'
                  }}
                >🗑️</button>
              )}
            </header>
            <div className="social-post-body">{post.text}</div>

            {post.replies?.length > 0 && (
              <div className="social-replies">
                {post.replies.map(r => (
                  <div key={r._id} className="social-reply">
                    <SocialAvatar
                      src={r.authorProfileImg || (r.authorId === user?.id ? user?.profileImg : null)}
                      name={r.authorName || r.authorId}
                      size={28}
                      className="social-reply-avatar"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="social-reply-author">
                        {r.authorName || r.authorId} <span className="social-reply-handle">@{r.authorId}</span> · <span className="social-reply-time">{timeAgo(r.createdAt)}</span>
                        {r.authorId === user?.id && (
                          <button
                            type="button"
                            onClick={() => deleteReply(post._id, r._id)}
                            title={t('social.deleteReply')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--muted-color, #888)',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              padding: '0 4px',
                              marginLeft: 6
                            }}
                          >🗑️</button>
                        )}
                      </div>
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
                    placeholder={t('social.replyPh')}
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
                    <button type="button" onClick={() => { setReplyOpen(null); setReplyDraft(''); }} className="social-reply-cancel">{t('social.replyCancel')}</button>
                    <button type="button" onClick={() => submitReply(post._id)} disabled={submittingReply || !replyDraft.trim()} className="social-reply-submit">
                      {submittingReply ? t('social.replying') : t('social.replyBtn')}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => { setReplyOpen(post._id); setReplyDraft(''); }} className="social-reply-trigger">
                  {t('social.replyTrigger')}
                </button>
              )}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
