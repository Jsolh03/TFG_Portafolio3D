import React, { useEffect, useState } from 'react';
import { useT } from '../../context/LanguageContext';

const storageKey = (userId) => `notes_${userId || 'guest'}`;

export default function NotesApp({ user }) {
  const t = useT();
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(user));
      const parsed = raw ? JSON.parse(raw) : [];
      setNotes(parsed);
      if (parsed.length) setActiveId(parsed[0].id);
    } catch {
      setNotes([]);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(storageKey(user), JSON.stringify(notes));
  }, [notes, user]);

  const active = notes.find(n => n.id === activeId);

  const createNote = () => {
    const id = Date.now().toString(36);
    const note = { id, title: t('notes.newTitle'), body: '', updated: Date.now() };
    setNotes([note, ...notes]);
    setActiveId(id);
  };

  const updateActive = (patch) => {
    setNotes(notes.map(n => n.id === activeId ? { ...n, ...patch, updated: Date.now() } : n));
  };

  const deleteNote = (id, e) => {
    e?.stopPropagation();
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id || null);
  };

  return (
    <div className="notes-app">
      <aside className="notes-sidebar">
        <div className="notes-list-header">
          <span>{t('notes.heading')}</span>
          <button className="notes-add" onClick={createNote} title={t('notes.newTitle')}>+</button>
        </div>
        <div className="notes-list">
          {notes.length === 0 && (
            <div style={{ padding: 16, fontSize: 12, color: 'var(--muted-color)', textAlign: 'center' }}>
              {t('notes.noNotes')}
            </div>
          )}
          {notes.map(n => (
            <div
              key={n.id}
              className={`notes-item ${n.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(n.id)}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.title || t('notes.untitled')}
              </span>
              <button className="notes-item-del" onClick={(e) => deleteNote(n.id, e)}>×</button>
            </div>
          ))}
        </div>
      </aside>

      {active ? (
        <div className="notes-editor">
          <input
            className="notes-title-input"
            value={active.title}
            onChange={e => updateActive({ title: e.target.value })}
            placeholder={t('notes.titlePh')}
          />
          <textarea
            className="notes-body-input"
            value={active.body}
            onChange={e => updateActive({ body: e.target.value })}
            placeholder={t('notes.bodyPh')}
          />
        </div>
      ) : (
        <div className="notes-empty">{t('notes.emptyHint')}</div>
      )}
    </div>
  );
}
