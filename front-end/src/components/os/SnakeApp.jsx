import React, { useEffect, useRef, useState } from 'react';
import { useT } from '../../context/LanguageContext';

const COLS = 20;
const ROWS = 20;
const CELL = 16;
const TICK_MS = 110;

const DIRECTIONS = {
  ArrowUp:    { x: 0,  y: -1 }, w: { x: 0,  y: -1 },
  ArrowDown:  { x: 0,  y: 1 },  s: { x: 0,  y: 1 },
  ArrowLeft:  { x: -1, y: 0 },  a: { x: -1, y: 0 },
  ArrowRight: { x: 1,  y: 0 },  d: { x: 1,  y: 0 }
};

const randomFood = (snake) => {
  while (true) {
    const f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some(s => s.x === f.x && s.y === f.y)) return f;
  }
};

const initialSnake = () => [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];

export default function SnakeApp({ onExit }) {
  const t = useT();
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState(initialSnake);
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [pendingDir, setPendingDir] = useState({ x: 1, y: 0 });
  const [food, setFood] = useState({ x: 5, y: 10 });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('snake_best') || 0));
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit?.();
        return;
      }
      const next = DIRECTIONS[e.key];
      if (!next) return;
      e.preventDefault();
      if (next.x === -dir.x && next.y === -dir.y) return;
      setPendingDir(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dir, onExit]);

  useEffect(() => {
    if (!running || gameOver) return;
    const tick = setInterval(() => {
      setSnake(prev => {
        const direction = pendingDir;
        setDir(direction);
        const head = { x: prev[0].x + direction.x, y: prev[0].y + direction.y };

        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
            prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          setRunning(false);
          setBest(b => {
            const nb = Math.max(b, score);
            localStorage.setItem('snake_best', nb);
            return nb;
          });
          return prev;
        }

        const ateFood = head.x === food.x && head.y === food.y;
        const next = [head, ...prev];
        if (!ateFood) next.pop();
        else {
          setScore(s => s + 10);
          setFood(randomFood(next));
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(tick);
  }, [running, gameOver, pendingDir, food, score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

    ctx.strokeStyle = '#0a1a0a';
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, ROWS * CELL); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(COLS * CELL, y * CELL); ctx.stroke();
    }

    ctx.fillStyle = '#ff4477';
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);

    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#50ff9b' : '#22ff77';
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, [snake, food]);

  const start = () => {
    setSnake(initialSnake());
    setDir({ x: 1, y: 0 });
    setPendingDir({ x: 1, y: 0 });
    setFood(randomFood(initialSnake()));
    setScore(0);
    setGameOver(false);
    setRunning(true);
  };

  return (
    <div className="snake-app">
      <div className="snake-hud">
        <span>{t('snake.score')}: {score}</span>
        <span>{t('snake.best')}: {best}</span>
      </div>

      <canvas
        ref={canvasRef}
        className="snake-canvas"
        width={COLS * CELL}
        height={ROWS * CELL}
      />

      {!running && (
        <div className="snake-overlay">
          {gameOver ? t('snake.gameOver') : t('snake.snake')}
          <div>
            <button className="snake-btn" onClick={start}>
              {gameOver ? t('snake.retry') : t('snake.play')}
            </button>
          </div>
        </div>
      )}

      <div className="snake-controls-hint">{t('snake.controlsHint')}</div>
    </div>
  );
}
