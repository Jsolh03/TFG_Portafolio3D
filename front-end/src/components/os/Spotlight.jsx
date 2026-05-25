import React, { useEffect, useRef, useState } from 'react';
import { APP_ICON_MAP } from './AppIcons';

export default function Spotlight({ open, onClose, apps, onSelect }) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlighted(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const filtered = apps.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.id.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => { setHighlighted(0); }, [query]);

  const submit = (app) => {
    if (!app) return;
    onSelect(app.id);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    }
    else if (e.key === 'Enter') {
      e.preventDefault();
      submit(filtered[highlighted]);
    }
  };

  if (!open) return null;

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-shell" onClick={e => e.stopPropagation()} onKeyDown={onKeyDown}>
        <div className="sp-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search apps..."
          />
          <kbd className="sp-kbd">ESC</kbd>
        </div>

        <ul className="sp-results">
          {filtered.length === 0 && (
            <li className="sp-empty">No results</li>
          )}
          {filtered.map((a, i) => {
            const IconCmp = a.Icon || APP_ICON_MAP[a.id];
            return (
              <li
                key={a.id}
                className={`sp-item ${i === highlighted ? 'highlighted' : ''}`}
                onClick={() => submit(a)}
                onMouseEnter={() => setHighlighted(i)}
              >
                <span className={`sp-item-glyph ${a.iconClass}`}>
                  {IconCmp ? <IconCmp /> : a.glyph}
                </span>
                <span className="sp-item-label">{a.label}</span>
                {i === highlighted && <kbd className="sp-kbd">⏎</kbd>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
