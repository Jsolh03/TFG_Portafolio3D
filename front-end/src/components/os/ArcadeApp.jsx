import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../../context/LanguageContext';
import Pong from './arcade-games/Pong';
import Breakout from './arcade-games/Breakout';
import Tetris from './arcade-games/Tetris';

const EJS_DATA = 'https://cdn.emulatorjs.org/stable/data/';
const MANIFEST_URL = '/roms/manifest.json';

const CORES = [
  { id: 'nes',     exts: ['nes'] },
  { id: 'snes',    exts: ['smc', 'sfc'] },
  { id: 'gb',      exts: ['gb', 'gbc'] },
  { id: 'gba',     exts: ['gba'] },
  { id: 'segaMD',  exts: ['md', 'smd', 'gen'] },
  { id: 'n64',     exts: ['n64', 'z64', 'v64'] },
  { id: 'psx',     exts: ['iso', 'bin', 'cue', 'chd'] },
  { id: 'arcade',  exts: ['zip'] }
];

const BUILTIN_COMPONENTS = { Pong, Breakout, Tetris };

const BUILTIN_GAMES = [
  {
    id: 'builtin-pong',
    title: 'Pong',
    type: 'builtin',
    component: 'Pong',
    core: 'CLASSIC',
    description: 'Player vs AI · primer en llegar a 7',
    accent: '#00ffea'
  },
  {
    id: 'builtin-breakout',
    title: 'Breakout',
    type: 'builtin',
    component: 'Breakout',
    core: 'CLASSIC',
    description: 'Rompe todos los ladrillos',
    accent: '#ff0099'
  },
  {
    id: 'builtin-tetris',
    title: 'Tetris',
    type: 'builtin',
    component: 'Tetris',
    core: 'CLASSIC',
    description: 'El clásico eterno',
    accent: '#ffeb3b'
  }
];

function coreFromExt(ext) {
  const found = CORES.find(c => c.exts.includes(ext.toLowerCase()));
  return found?.id || 'nes';
}

export default function ArcadeApp({ onClose }) {
  const t = useT();
  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [romUrl, setRomUrl] = useState(null);
  const [romName, setRomName] = useState('');
  const [core, setCore] = useState('nes');
  const [builtin, setBuiltin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pickedCore, setPickedCore] = useState('nes');
  const fileInputRef = useRef(null);
  const scriptRef = useRef(null);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    fetch(MANIFEST_URL, { cache: 'no-cache' })
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (!cancelled) setLibrary(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setLibrary([]); })
      .finally(() => { if (!cancelled) setLibraryLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!romUrl) return;
    setLoading(true);

    window.EJS_player = '#arcade-mount';
    window.EJS_gameUrl = romUrl;
    window.EJS_core = core;
    window.EJS_pathtodata = EJS_DATA;
    window.EJS_startOnLoaded = true;
    window.EJS_color = '#a3e635';
    window.EJS_gameName = romName || 'game';
    window.EJS_ready = () => setLoading(false);

    const script = document.createElement('script');
    script.src = `${EJS_DATA}loader.js`;
    script.async = true;
    script.onload = () => setLoading(false);
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
      ['EJS_player', 'EJS_gameUrl', 'EJS_core', 'EJS_pathtodata', 'EJS_startOnLoaded', 'EJS_color', 'EJS_gameName', 'EJS_ready', 'EJS_emulator'].forEach(k => {
        try { delete window[k]; } catch {}
      });
      const mount = document.getElementById('arcade-mount');
      if (mount) mount.innerHTML = '';
    };
  }, [romUrl, core, romName]);

  const cleanupBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const loadFromLibrary = (entry) => {
    cleanupBlob();
    if (entry.type === 'builtin') {
      setBuiltin(entry);
      return;
    }
    setBuiltin(null);
    setRomName(entry.title);
    setCore(entry.core);
    setRomUrl(entry.rom);
  };

  const handleFile = (file) => {
    if (!file) return;
    cleanupBlob();
    setBuiltin(null);
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const detectedCore = coreFromExt(ext);
    setCore(detectedCore);
    setPickedCore(detectedCore);
    setRomName(file.name);
    setRomUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleChangeRom = () => {
    cleanupBlob();
    setRomUrl(null);
    setRomName('');
    setBuiltin(null);
    const mount = document.getElementById('arcade-mount');
    if (mount) mount.innerHTML = '';
  };

  const coreBadge = (c) => (c || '').toUpperCase();
  const isPlaying = !!romUrl || !!builtin;
  const BuiltinComponent = builtin ? BUILTIN_COMPONENTS[builtin.component] : null;

  return (
    <div className="arcade-overlay" onClick={onClose}>
      <div className="arcade-frame" onClick={e => e.stopPropagation()}>
        <header className="arcade-header">
          <div className="arcade-header-left">
            <span className="arcade-header-led"></span>
            <span className="arcade-header-title">{t('arcade.header')}</span>
          </div>
          {isPlaying && (
            <button className="arcade-mini-btn" onClick={handleChangeRom}>{t('arcade.changeRom')}</button>
          )}
          <button className="arcade-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="arcade-body">
          {!isPlaying ? (
            <div className="arcade-selector">

              <div className="arcade-section-title">⭐ {t('arcade.builtins')}</div>
              <div className="arcade-library-grid">
                {BUILTIN_GAMES.map(g => (
                  <button
                    key={g.id}
                    className="arcade-game-card arcade-game-card--builtin"
                    onClick={() => loadFromLibrary(g)}
                    style={{ '--card-accent': g.accent }}
                  >
                    <div className="arcade-game-cover">
                      <span className="arcade-game-placeholder" style={{ color: g.accent }}>
                        {g.id === 'builtin-pong' ? '🏓' : g.id === 'builtin-breakout' ? '🧱' : '🟦'}
                      </span>
                      <span className="arcade-game-core-badge">{coreBadge(g.core)}</span>
                    </div>
                    <div className="arcade-game-info">
                      <div className="arcade-game-title">{g.title}</div>
                      <div className="arcade-game-desc">{g.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              {libraryLoading ? (
                <div className="arcade-library-loading">{t('arcade.loading')}</div>
              ) : library.length > 0 ? (
                <>
                  <div className="arcade-section-title">📦 {t('arcade.library')}</div>
                  <div className="arcade-library-grid">
                    {library.map(entry => (
                      <button
                        key={entry.id}
                        className="arcade-game-card"
                        onClick={() => loadFromLibrary(entry)}
                      >
                        <div className="arcade-game-cover">
                          {entry.cover
                            ? <img src={entry.cover} alt={entry.title} onError={e => { e.currentTarget.style.display = 'none'; }} />
                            : <span className="arcade-game-placeholder">🕹</span>
                          }
                          <span className="arcade-game-core-badge">{coreBadge(entry.core)}</span>
                        </div>
                        <div className="arcade-game-info">
                          <div className="arcade-game-title">{entry.title}</div>
                          {entry.description && <div className="arcade-game-desc">{entry.description}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="arcade-section-divider">{t('arcade.orUpload')}</div>

              <div
                className={`arcade-picker ${dragOver ? 'dragover' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="arcade-picker-icon">🕹</div>
                <div className="arcade-picker-text">{t('arcade.dropRom')}</div>

                <button
                  type="button"
                  className="arcade-pick-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('arcade.selectFile')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".nes,.smc,.sfc,.gb,.gbc,.gba,.md,.smd,.gen,.n64,.z64,.v64,.iso,.bin,.cue,.chd,.zip"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />

                <div className="arcade-core-select">
                  <label>{t('arcade.selectCore')}:</label>
                  <select value={pickedCore} onChange={e => setPickedCore(e.target.value)}>
                    {CORES.map(c => (
                      <option key={c.id} value={c.id}>{t(`arcade.cores.${c.id}`)}</option>
                    ))}
                  </select>
                </div>

                <p className="arcade-legal">{t('arcade.legalNote')}</p>
              </div>
            </div>
          ) : builtin && BuiltinComponent ? (
            <div className="arcade-stage arcade-stage--builtin">
              <BuiltinComponent />
            </div>
          ) : (
            <div className="arcade-stage">
              {loading && <div className="arcade-loading">{t('arcade.loading')}</div>}
              <div id="arcade-mount" className="arcade-mount" />
            </div>
          )}
        </div>

        <footer className="arcade-foot">
          <span className="arcade-blink">{t('arcade.insertCoin')}</span>
        </footer>
      </div>
    </div>
  );
}
