import React, { useEffect, useRef, useState } from 'react';

const W = 720, H = 480;
const PADDLE_W = 100, PADDLE_H = 12;
const BALL_R = 7;
const ROWS = 6, COLS = 12;
const BRICK_W = (W - 40) / COLS;
const BRICK_H = 22;
const BRICK_TOP = 60;
const COLORS = ['#ff0099', '#ff44a8', '#ffeb3b', '#00ffea', '#22d3ee', '#a3e635'];

const createBricks = () => {
  const arr = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      arr.push({
        x: 20 + c * BRICK_W,
        y: BRICK_TOP + r * BRICK_H,
        alive: true,
        color: COLORS[r % COLORS.length]
      });
    }
  }
  return arr;
};

const initialState = () => ({
  px: W / 2 - PADDLE_W / 2,
  bx: W / 2,
  by: H - 60,
  bvx: 4,
  bvy: -4,
  bricks: createBricks()
});

export default function Breakout() {
  const canvasRef = useRef(null);
  const stateRef = useRef(initialState());
  const keysRef = useRef({});
  const rafRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState(null); // 'win' | 'gameover'

  useEffect(() => {
    const onKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (['arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    const onKeyUp = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    const onMouseMove = (e) => {
      const c = canvasRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (W / rect.width);
      stateRef.current.px = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2));
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    const c = canvasRef.current;
    c?.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      c?.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!running || status) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      const k = keysRef.current;

      if (k['a'] || k['arrowleft'])  s.px = Math.max(0, s.px - 7);
      if (k['d'] || k['arrowright']) s.px = Math.min(W - PADDLE_W, s.px + 7);

      s.bx += s.bvx;
      s.by += s.bvy;

      if (s.bx < BALL_R || s.bx > W - BALL_R) s.bvx = -s.bvx;
      if (s.by < BALL_R) s.bvy = -s.bvy;

      // Paddle collision
      if (s.by + BALL_R > H - 30 && s.by < H - 18 && s.bx > s.px && s.bx < s.px + PADDLE_W && s.bvy > 0) {
        s.bvy = -Math.abs(s.bvy);
        const offset = (s.bx - (s.px + PADDLE_W / 2)) / (PADDLE_W / 2);
        s.bvx = offset * 6;
      }

      // Brick collision
      let hit = false;
      for (const b of s.bricks) {
        if (!b.alive) continue;
        if (s.bx > b.x && s.bx < b.x + BRICK_W && s.by > b.y && s.by < b.y + BRICK_H) {
          b.alive = false;
          s.bvy = -s.bvy;
          hit = true;
          setScore(prev => prev + 10);
          break;
        }
      }

      if (hit && s.bricks.every(b => !b.alive)) {
        setStatus('win');
        return;
      }

      // Lost ball
      if (s.by > H) {
        setLives(prev => {
          const next = prev - 1;
          if (next <= 0) {
            setStatus('gameover');
            return 0;
          }
          s.bx = W / 2;
          s.by = H - 60;
          s.bvx = 4 * (Math.random() > 0.5 ? 1 : -1);
          s.bvy = -4;
          return next;
        });
      }

      // Draw
      ctx.fillStyle = '#050010';
      ctx.fillRect(0, 0, W, H);

      // Bricks
      for (const b of s.bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x + 2, b.y + 2, BRICK_W - 4, BRICK_H - 4);
        ctx.shadowBlur = 0;
      }

      // Paddle
      ctx.fillStyle = '#00ffea';
      ctx.shadowColor = '#00ffea';
      ctx.shadowBlur = 14;
      ctx.fillRect(s.px, H - 30, PADDLE_W, PADDLE_H);

      // Ball
      ctx.fillStyle = '#ffeb3b';
      ctx.shadowColor = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, status]);

  const start = () => {
    stateRef.current = initialState();
    setScore(0);
    setLives(3);
    setStatus(null);
    setRunning(true);
  };

  return (
    <div className="ag-root">
      <div className="ag-hud">
        <span className="ag-hud-left">SCORE: {score}</span>
        <span className="ag-hud-center">BREAKOUT</span>
        <span className="ag-hud-right">♥ {lives}</span>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="ag-canvas" />
      {(!running || status) && (
        <div className="ag-overlay">
          {status === 'win' && <div className="ag-msg">YOU WIN!</div>}
          {status === 'gameover' && <div className="ag-msg">GAME OVER</div>}
          <button className="ag-btn" onClick={start}>
            {status ? 'PLAY AGAIN' : 'PLAY'}
          </button>
        </div>
      )}
      <div className="ag-controls">A/D · ←→ · MOUSE · ESC para salir</div>
    </div>
  );
}
