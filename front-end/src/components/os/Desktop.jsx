import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useT } from '../../context/LanguageContext';
import { useTheme, STYLES } from '../../context/ThemeContext';
import Spotlight from './Spotlight';
import { APP_ICON_MAP } from './AppIcons';

const BOOT_KEY_PREFIX = 'kos_booted_';
const BOOT_DURATION_MS = 2400;

// Posiciones predefinidas para que los iconos se vean "tirados" por el escritorio
// (left/top en % del área visible de iconos, tilt = ligera rotación en grados)
const ICON_POSITIONS = [
  { left: 3,  top: 4,  tilt: -3 },
  { left: 22, top: 9,  tilt:  2 },
  { left: 41, top: 3,  tilt: -1 },
  { left: 60, top: 11, tilt:  3 },
  { left: 9,  top: 28, tilt:  1 },
  { left: 30, top: 32, tilt: -2 },
  { left: 52, top: 26, tilt:  2 },
  { left: 72, top: 34, tilt: -3 },
  { left: 4,  top: 52, tilt: -1 },
  { left: 24, top: 58, tilt:  3 },
  { left: 46, top: 50, tilt: -2 },
  { left: 64, top: 60, tilt:  1 },
  { left: 14, top: 76, tilt:  2 },
  { left: 36, top: 78, tilt: -3 },
  { left: 56, top: 74, tilt:  1 }
];

const BOOT_LINES = [
  '[ OK ] Initializing kernel...',
  '[ OK ] Loading modules...',
  '[ OK ] Mounting filesystem...',
  '[ OK ] Starting display manager...',
  '[ OK ] Booting K-OS...'
];

function useTick(intervalMs) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => String(n).padStart(2, '0');
  return <span>{pad(now.getHours())}:{pad(now.getMinutes())}</span>;
}

function DateBlock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  const day = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dd = String(now.getDate()).padStart(2, '0');
  const month = now.toLocaleDateString(undefined, { month: 'short' });
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <>
      <span className="dt-widget-day">{day}</span>
      <span className="dt-widget-bigdate">{dd}</span>
      <span className="dt-widget-month">{month}</span>
      <span className="dt-widget-time">{pad(now.getHours())}:{pad(now.getMinutes())}</span>
    </>
  );
}

function StatBar({ label, value, color }) {
  const v = Math.max(2, Math.min(100, Math.round(value)));
  return (
    <div className="dt-stat" title={`${label}: ${v}%`}>
      <span className="dt-stat-label">{label}</span>
      <span className="dt-stat-bar">
        <span className="dt-stat-fill" style={{ width: `${v}%`, background: color }} />
      </span>
      <span className="dt-stat-value">{v}%</span>
    </div>
  );
}

function LiveStats() {
  const tick = useTick(2000);
  const t = tick * 0.7;
  const cpu = 32 + 18 * Math.sin(t) + 6 * Math.sin(t * 2.3);
  const ram = 48 + 14 * Math.sin(t * 0.6 + 1) + 4 * Math.cos(t * 1.9);
  const net = 12 + 22 * Math.abs(Math.sin(t * 0.45 + 2));
  return (
    <div className="dt-livestats">
      <StatBar label="CPU" value={cpu} color="var(--accent-color)" />
      <StatBar label="RAM" value={ram} color="rgba(var(--accent-rgb-light), 1)" />
      <StatBar label="NET" value={net} color="#22d3ee" />
    </div>
  );
}

function Particles({ paused }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (paused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const accentRgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '139,92,246';

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      particlesRef.current = Array.from({ length: 36 }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.4,
        o: Math.random() * 0.45 + 0.15
      }));
    };
    init();

    const loop = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = rect.width + 5;
        if (p.x > rect.width + 5) p.x = -5;
        if (p.y < -5) p.y = rect.height + 5;
        if (p.y > rect.height + 5) p.y = -5;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${accentRgb}, ${p.o})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [paused]);

  if (paused) return null;
  return <canvas ref={canvasRef} className="dt-particles" aria-hidden="true" />;
}

function BootSplash({ systemName, onDone }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lineInterval = BOOT_DURATION_MS / (BOOT_LINES.length + 1);
    const lineId = setInterval(() => {
      setLineIdx(i => Math.min(i + 1, BOOT_LINES.length));
    }, lineInterval);
    const progressId = setInterval(() => {
      setProgress(p => Math.min(100, p + 100 / (BOOT_DURATION_MS / 60)));
    }, 60);
    const done = setTimeout(onDone, BOOT_DURATION_MS);
    return () => {
      clearInterval(lineId);
      clearInterval(progressId);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="dt-boot">
      <div className="dt-boot-logo">
        <span className="dt-boot-logo-main">{systemName}</span>
        <span className="dt-boot-logo-sub">PORTFOLIO OPERATING SYSTEM</span>
      </div>
      <div className="dt-boot-lines">
        {BOOT_LINES.slice(0, lineIdx).map((l, i) => (
          <div key={i} className="dt-boot-line">{l}</div>
        ))}
        {lineIdx < BOOT_LINES.length && <div className="dt-boot-line dt-boot-line--active">{BOOT_LINES[lineIdx]}</div>}
      </div>
      <div className="dt-boot-progress">
        <div className="dt-boot-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <button className="dt-boot-skip" onClick={onDone} type="button">skip ›</button>
    </div>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="dt-toasts">
      {toasts.map(tt => {
        const IconCmp = tt.Icon;
        return (
          <div key={tt.id} className="dt-toast">
            <span className={`dt-toast-glyph ${tt.iconClass}`}>
              {IconCmp ? <IconCmp /> : tt.glyph}
            </span>
            <span className="dt-toast-text">{tt.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function StyleSwitcher() {
  const { style, setStyle } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const current = STYLES.find(s => s.id === style) || STYLES[0];

  return (
    <div className="dt-style-switcher" ref={ref}>
      <button
        className="dt-style-trigger"
        onClick={() => setOpen(o => !o)}
        title={current.label}
        type="button"
      >
        <span className="dt-style-trigger-icon">{current.icon}</span>
        <span className="dt-style-trigger-caret">▾</span>
      </button>
      {open && (
        <div className="dt-style-pop">
          {STYLES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`dt-style-opt ${style === s.id ? 'active' : ''}`}
              onClick={() => { setStyle(s.id); setOpen(false); }}
            >
              <span className="dt-style-opt-icon">{s.icon}</span>
              <span className="dt-style-opt-label">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusIcons({ t }) {
  return (
    <div className="dt-status-icons" title={`${t('desktop.wifi')} · ${t('desktop.battery')}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
      <svg width="22" height="14" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="1" y="2" width="18" height="10" rx="2"/>
        <line x1="21" y1="6" x2="21" y2="8"/>
        <rect x="3" y="4" width="12" height="6" fill="currentColor" rx="1"/>
      </svg>
    </div>
  );
}

export default function Desktop({ userId, systemName, apps, activeAppId, onOpenApp, githubUrl }) {
  const t = useT();
  const reducedMotion = typeof document !== 'undefined' && document.documentElement.dataset.reducedMotion === '1';
  const isKhaled = userId === 'khaled';
  const rootClass = `dt-root${isKhaled ? ' dt-khaled' : ''}`;

  const bootKey = `${BOOT_KEY_PREFIX}${systemName}`;
  const [booting, setBooting] = useState(() => {
    if (reducedMotion) return false;
    return typeof sessionStorage !== 'undefined' ? !sessionStorage.getItem(bootKey) : true;
  });

  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const handleOpenApp = useCallback((id) => {
    const app = apps.find(a => a.id === id);
    if (!app) return;
    const tid = ++toastIdRef.current;
    setToasts(prev => [...prev, {
      id: tid,
      text: `Initializing ${app.label}...`,
      Icon: app.Icon || APP_ICON_MAP[app.id],
      glyph: app.glyph,
      iconClass: app.iconClass
    }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x.id !== tid));
    }, 1800);
    onOpenApp(id);
  }, [apps, onOpenApp]);

  useEffect(() => {
    if (booting) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen(open => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [booting]);

  const finishBoot = useCallback(() => {
    setBooting(false);
    try { sessionStorage.setItem(bootKey, '1'); } catch {}
  }, [bootKey]);

  const handleIconClick = (e, id) => {
    const tile = e.currentTarget.querySelector('.dt-icon-tile');
    if (tile) {
      tile.classList.remove('dt-ripple');
      void tile.offsetWidth;
      tile.classList.add('dt-ripple');
      setTimeout(() => tile.classList.remove('dt-ripple'), 600);
    }
    handleOpenApp(id);
  };

  const [trashShake, setTrashShake] = useState(false);
  const handleTrashClick = () => {
    setTrashShake(true);
    const tid = ++toastIdRef.current;
    setToasts(prev => [...prev, { id: tid, text: 'Trash is empty', glyph: '🗑', iconClass: 'dt-trash-toast' }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== tid)), 1600);
    setTimeout(() => setTrashShake(false), 500);
  };

  return (
    <div className={rootClass}>
      <div className="dt-wallpaper" aria-hidden="true">
        {isKhaled && <div className="dt-floor-grid"></div>}
        {isKhaled && <div className="dt-skyline"></div>}
        {isKhaled && <div className="dt-orb"></div>}
        {isKhaled && <div className="dt-aurora"></div>}
        {isKhaled && <div className="dt-stars"></div>}
        <div className="dt-mesh dt-mesh-1"></div>
        <div className="dt-mesh dt-mesh-2"></div>
        <div className="dt-mesh dt-mesh-3"></div>
        <div className="dt-grid"></div>
        <div className="dt-noise"></div>
        {isKhaled && <div className="dt-scanlines" aria-hidden="true"></div>}
        {isKhaled && <div className="dt-vignette" aria-hidden="true"></div>}
      </div>

      <Particles paused={booting || reducedMotion} />

      {booting && <BootSplash systemName={systemName} onDone={finishBoot} />}

      <header className="dt-topbar">
        <div className="dt-topbar-left">
          <span className="dt-topbar-os">
            <span className="dt-topbar-dot"></span>
            {systemName}
          </span>
          <button
            className="dt-spotlight-trigger"
            onClick={() => setSpotlightOpen(true)}
            title="Spotlight (⌘K)"
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <kbd>⌘K</kbd>
          </button>
        </div>
        <div className="dt-topbar-center">
          <LiveStats />
        </div>
        <div className="dt-topbar-right">
          <StyleSwitcher />
          <StatusIcons t={t} />
          <span className="dt-topbar-clock"><Clock /></span>
        </div>
      </header>

      <main className={`dt-icons-area ${isKhaled ? 'dt-icons-area--scatter' : ''}`}>
        {isKhaled ? (
          <>
            <div className="dt-icons-scatter">
              {apps.map((a, i) => {
                const IconCmp = a.Icon || APP_ICON_MAP[a.id];
                const pos = ICON_POSITIONS[i % ICON_POSITIONS.length];
                return (
                  <button
                    key={a.id}
                    className="dt-icon"
                    onClick={(e) => handleIconClick(e, a.id)}
                    style={{
                      '--enter-delay': `${i * 60}ms`,
                      left: `${pos.left}%`,
                      top: `${pos.top}%`,
                      '--tilt': `${pos.tilt}deg`
                    }}
                  >
                    <div className={`dt-icon-tile ${a.iconClass}`}>
                      <span className="dt-icon-svg" aria-hidden="true">
                        {IconCmp ? <IconCmp /> : <span className="dt-icon-glyph">{a.glyph}</span>}
                      </span>
                      <span className="dt-icon-shine" aria-hidden="true"></span>
                      <span className="dt-icon-halo" aria-hidden="true"></span>
                    </div>
                    <span className="dt-icon-label">{a.label}</span>
                  </button>
                );
              })}

              {githubUrl && (() => {
                const pos = ICON_POSITIONS[apps.length % ICON_POSITIONS.length];
                return (
                  <button
                    className="dt-icon"
                    onClick={() => window.open(githubUrl, '_blank')}
                    style={{
                      '--enter-delay': `${apps.length * 60}ms`,
                      left: `${pos.left}%`,
                      top: `${pos.top}%`,
                      '--tilt': `${pos.tilt}deg`
                    }}
                  >
                    <div className="dt-icon-tile dt-icon-github">
                      <span className="dt-icon-svg" aria-hidden="true">
                        <APP_ICON_MAP.github />
                      </span>
                      <span className="dt-icon-shine" aria-hidden="true"></span>
                      <span className="dt-icon-halo" aria-hidden="true"></span>
                    </div>
                    <span className="dt-icon-label">{t('apps.github')}</span>
                  </button>
                );
              })()}
            </div>

            <aside className="dt-widgets" aria-hidden="true">
              <div className="dt-widget dt-widget-welcome">
                <div className="dt-widget-head">
                  <span className="dt-widget-dot"></span>
                  <span className="dt-widget-title">{systemName}</span>
                </div>
                <div className="dt-widget-greet">Hola, <b>{userId || 'guest'}</b></div>
                <div className="dt-widget-sub">{apps.length} apps disponibles · todo en orden</div>
              </div>

              <div className="dt-widget dt-widget-date">
                <DateBlock />
              </div>

              <div className="dt-widget dt-widget-stats">
                <span className="dt-widget-title">SYSTEM</span>
                <LiveStats />
              </div>

              <div className="dt-widget dt-widget-tip">
                <span className="dt-widget-title">TIP</span>
                <span className="dt-widget-tip-text">Pulsa <kbd>⌘K</kbd> para abrir Spotlight</span>
              </div>
            </aside>

            <button
              className={`dt-trash ${trashShake ? 'shake' : ''}`}
              onClick={handleTrashClick}
              title="Papelera (vacía)"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              <span className="dt-trash-label">Papelera</span>
            </button>
          </>
        ) : (
          <div className="dt-icons-grid">
            {apps.map((a, i) => {
              const IconCmp = a.Icon || APP_ICON_MAP[a.id];
              return (
                <button
                  key={a.id}
                  className="dt-icon"
                  onClick={(e) => handleIconClick(e, a.id)}
                  style={{ '--enter-delay': `${i * 60}ms` }}
                >
                  <div className={`dt-icon-tile ${a.iconClass}`}>
                    <span className="dt-icon-svg" aria-hidden="true">
                      {IconCmp ? <IconCmp /> : <span className="dt-icon-glyph">{a.glyph}</span>}
                    </span>
                    <span className="dt-icon-shine" aria-hidden="true"></span>
                    <span className="dt-icon-halo" aria-hidden="true"></span>
                  </div>
                  <span className="dt-icon-label">{a.label}</span>
                </button>
              );
            })}

            {githubUrl && (
              <button
                className="dt-icon"
                onClick={() => window.open(githubUrl, '_blank')}
                style={{ '--enter-delay': `${apps.length * 60}ms` }}
              >
                <div className="dt-icon-tile dt-icon-github">
                  <span className="dt-icon-svg" aria-hidden="true">
                    <APP_ICON_MAP.github />
                  </span>
                  <span className="dt-icon-shine" aria-hidden="true"></span>
                  <span className="dt-icon-halo" aria-hidden="true"></span>
                </div>
                <span className="dt-icon-label">{t('apps.github')}</span>
              </button>
            )}
          </div>
        )}
      </main>

      <nav className="dt-dock">
        {apps.slice(0, 5).map(a => {
          const IconCmp = a.Icon || APP_ICON_MAP[a.id];
          return (
            <button
              key={`dock-${a.id}`}
              className={`dt-dock-item ${activeAppId === a.id ? 'active' : ''}`}
              onClick={() => handleOpenApp(a.id)}
              title={a.label}
            >
              <span className={`dt-dock-tile ${a.iconClass}`}>
                {IconCmp ? <IconCmp /> : a.glyph}
              </span>
              <span className="dt-dock-tooltip">{a.label}</span>
              {activeAppId === a.id && <span className="dt-dock-active-indicator"></span>}
            </button>
          );
        })}
      </nav>

      <ToastStack toasts={toasts} />

      <Spotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        apps={apps}
        onSelect={handleOpenApp}
      />
    </div>
  );
}
