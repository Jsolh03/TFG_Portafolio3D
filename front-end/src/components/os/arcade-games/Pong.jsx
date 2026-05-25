import React, { useEffect, useRef, useState } from 'react';

const W = 720, H = 480;
const PADDLE_W = 12, PADDLE_H = 90;
const BALL_R = 7;
const WIN_SCORE = 7;
const PADDLE_SPEED = 6;
const AI_SPEED = 4.5;

const initialState = () => ({
  pY: H / 2 - PADDLE_H / 2,
  aiY: H / 2 - PADDLE_H / 2,
  bx: W / 2,
  by: H / 2,
  bvx: Math.random() > 0.5 ? 5 : -5,
  bvy: (Math.random() - 0.5) * 6
});

export default function Pong() {
  const canvasRef = useRef(null);
  const stateRef = useRef(initialState());
  const keysRef = useRef({});
  const rafRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState({ p: 0, ai: 0 });
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if ([' ', 'arrowup', 'arrowdown'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const onKeyUp = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!running || winner) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      const k = keysRef.current;

      // Player paddle (W/S or ↑/↓)
      if (k['w'] || k['arrowup'])    s.pY = Math.max(0, s.pY - PADDLE_SPEED);
      if (k['s'] || k['arrowdown'])  s.pY = Math.min(H - PADDLE_H, s.pY + PADDLE_SPEED);

      // AI paddle — siguiendo bola con margen
      const aiCenter = s.aiY + PADDLE_H / 2;
      if (aiCenter < s.by - 8) s.aiY = Math.min(H - PADDLE_H, s.aiY + AI_SPEED);
      else if (aiCenter > s.by + 8) s.aiY = Math.max(0, s.aiY - AI_SPEED);

      // Ball movement
      s.bx += s.bvx;
      s.by += s.bvy;

      // Top/bottom walls
      if (s.by < BALL_R) { s.by = BALL_R; s.bvy = -s.bvy; }
      if (s.by > H - BALL_R) { s.by = H - BALL_R; s.bvy = -s.bvy; }

      // Paddle collisions
      if (s.bx - BALL_R < 30 + PADDLE_W && s.by > s.pY && s.by < s.pY + PADDLE_H && s.bvx < 0) {
        s.bvx = -s.bvx * 1.05;
        s.bvy += (s.by - (s.pY + PADDLE_H / 2)) * 0.08;
      }
      if (s.bx + BALL_R > W - 30 - PADDLE_W && s.by > s.aiY && s.by < s.aiY + PADDLE_H && s.bvx > 0) {
        s.bvx = -s.bvx * 1.05;
        s.bvy += (s.by - (s.aiY + PADDLE_H / 2)) * 0.08;
      }

      // Cap ball speed
      const maxV = 12;
      s.bvx = Math.max(-maxV, Math.min(maxV, s.bvx));
      s.bvy = Math.max(-maxV, Math.min(maxV, s.bvy));

      // Scoring
      if (s.bx < 0) {
        setScore(prev => {
          const next = { ...prev, ai: prev.ai + 1 };
          if (next.ai >= WIN_SCORE) setWinner('AI');
          return next;
        });
        Object.assign(s, initialState(), { bvx: -5 });
      } else if (s.bx > W) {
        setScore(prev => {
          const next = { ...prev, p: prev.p + 1 };
          if (next.p >= WIN_SCORE) setWinner('YOU');
          return next;
        });
        Object.assign(s, initialState(), { bvx: 5 });
      }

      // Draw
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // Center line
      ctx.strokeStyle = '#1e3a8a';
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Paddles
      ctx.fillStyle = '#00ffea';
      ctx.shadowColor = '#00ffea';
      ctx.shadowBlur = 12;
      ctx.fillRect(30, s.pY, PADDLE_W, PADDLE_H);
      ctx.fillStyle = '#ff0099';
      ctx.shadowColor = '#ff0099';
      ctx.fillRect(W - 30 - PADDLE_W, s.aiY, PADDLE_W, PADDLE_H);

      // Ball
      ctx.fillStyle = '#ffeb3b';
      ctx.shadowColor = '#ffeb3b';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, winner]);

  const start = () => {
    stateRef.current = initialState();
    setScore({ p: 0, ai: 0 });
    setWinner(null);
    setRunning(true);
  };

  return (
    <div className="ag-root">
      <div className="ag-hud">
        <span className="ag-hud-left">YOU: {score.p}</span>
        <span className="ag-hud-center">PONG</span>
        <span className="ag-hud-right">AI: {score.ai}</span>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="ag-canvas" />
      {(!running || winner) && (
        <div className="ag-overlay">
          {winner && <div className="ag-msg">{winner === 'YOU' ? 'YOU WIN!' : 'GAME OVER'}</div>}
          <button className="ag-btn" onClick={start}>
            {winner ? 'PLAY AGAIN' : 'PLAY'}
          </button>
        </div>
      )}
      <div className="ag-controls">W/S · ↑↓ · ESC para salir</div>
    </div>
  );
}
