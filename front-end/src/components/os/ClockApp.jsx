import React, { useEffect, useRef, useState } from 'react';
import { useT, useLanguage } from '../../context/LanguageContext';

const FOCUS_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;
const LOCALE_BY_LANG = { es: 'es-ES', en: 'en-GB', zh: 'zh-CN', de: 'de-DE' };

const pad = (n) => String(n).padStart(2, '0');
const fmtClock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const fmtMMSS  = (s) => `${pad(Math.floor(s/60))}:${pad(s%60)}`;

function AnalogClock({ now }) {
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hourAngle = (h * 30) + (m * 0.5);
  const minAngle  = (m * 6) + (s * 0.1);
  const secAngle  = s * 6;

  return (
    <svg className="clock-analog" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="95" fill="var(--card-bg)" stroke="var(--accent-color)" strokeWidth="2"/>
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const x1 = 100 + Math.sin(angle) * 82;
        const y1 = 100 - Math.cos(angle) * 82;
        const x2 = 100 + Math.sin(angle) * 90;
        const y2 = 100 - Math.cos(angle) * 90;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted-light)" strokeWidth="2" strokeLinecap="round"/>;
      })}
      <line x1="100" y1="100" x2="100" y2="55" stroke="var(--text-color)" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hourAngle} 100 100)`}/>
      <line x1="100" y1="100" x2="100" y2="35" stroke="var(--text-color)" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minAngle} 100 100)`}/>
      <line x1="100" y1="100" x2="100" y2="25" stroke="var(--accent-color)" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${secAngle} 100 100)`}/>
      <circle cx="100" cy="100" r="5" fill="var(--accent-color)"/>
    </svg>
  );
}

export default function ClockApp() {
  const t = useT();
  const { lang } = useLanguage();
  const locale = LOCALE_BY_LANG[lang] || 'en-GB';
  const [now, setNow] = useState(new Date());

  const [mode, setMode] = useState('focus');
  const [remaining, setRemaining] = useState(FOCUS_SECS);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          const nextMode = mode === 'focus' ? 'break' : 'focus';
          setMode(nextMode);
          setRunning(false);
          return nextMode === 'focus' ? FOCUS_SECS : BREAK_SECS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = (next) => {
    setMode(next);
    setRunning(false);
    setRemaining(next === 'focus' ? FOCUS_SECS : BREAK_SECS);
  };

  const reset = () => {
    setRunning(false);
    setRemaining(mode === 'focus' ? FOCUS_SECS : BREAK_SECS);
  };

  const dateLabel = now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="clock-app">
      <div className="clock-digital">{fmtClock(now)}</div>
      <div className="clock-date">{dateLabel}</div>
      <AnalogClock now={now} />

      <div className="clock-pomodoro">
        <div className="clock-pomodoro-label">{mode === 'focus' ? t('clock.focus') : t('clock.break')}</div>
        <div className="clock-pomodoro-time">{fmtMMSS(remaining)}</div>
        <div className="clock-pomodoro-controls">
          <button className={mode === 'focus' ? 'primary' : ''} onClick={() => switchMode('focus')}>{t('clock.focus25')}</button>
          <button className={mode === 'break' ? 'primary' : ''} onClick={() => switchMode('break')}>{t('clock.break5')}</button>
          <button onClick={() => setRunning(r => !r)}>{running ? t('clock.pause') : t('clock.start')}</button>
          <button onClick={reset}>{t('clock.reset')}</button>
        </div>
      </div>
    </div>
  );
}
