import React, { useEffect, useRef, useState } from 'react';

const COLS = 10, ROWS = 20;
const CELL = 22;
const W = COLS * CELL, H = ROWS * CELL;

const SHAPES = {
  I: { c: '#22d3ee', m: [[1,1,1,1]] },
  O: { c: '#ffeb3b', m: [[1,1],[1,1]] },
  T: { c: '#c084fc', m: [[0,1,0],[1,1,1]] },
  S: { c: '#a3e635', m: [[0,1,1],[1,1,0]] },
  Z: { c: '#ff44a8', m: [[1,1,0],[0,1,1]] },
  L: { c: '#fb923c', m: [[1,0,0],[1,1,1]] },
  J: { c: '#60a5fa', m: [[0,0,1],[1,1,1]] }
};
const KEYS = Object.keys(SHAPES);

const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const rotateMatrix = (m) => {
  const rows = m.length, cols = m[0].length;
  const result = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) result[c][rows - 1 - r] = m[r][c];
  return result;
};

const randomPiece = () => {
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  const { c, m } = SHAPES[key];
  return { c, m: m.map(row => [...row]), x: Math.floor(COLS / 2) - Math.floor(m[0].length / 2), y: 0 };
};

const collides = (board, piece, dx = 0, dy = 0, matrix = null) => {
  const m = matrix || piece.m;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
};

const merge = (board, piece) => {
  const next = board.map(row => [...row]);
  for (let r = 0; r < piece.m.length; r++) {
    for (let c = 0; c < piece.m[r].length; c++) {
      if (piece.m[r][c] && piece.y + r >= 0) next[piece.y + r][piece.x + c] = piece.c;
    }
  }
  return next;
};

const clearLines = (board) => {
  let cleared = 0;
  const next = board.filter(row => {
    if (row.every(cell => cell)) { cleared++; return false; }
    return true;
  });
  while (next.length < ROWS) next.unshift(Array(COLS).fill(null));
  return { board: next, cleared };
};

export default function Tetris() {
  const canvasRef = useRef(null);
  const boardRef = useRef(emptyBoard());
  const pieceRef = useRef(randomPiece());
  const lastDropRef = useRef(0);
  const rafRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const dropSpeed = () => Math.max(80, 720 - (level - 1) * 60);

  const draw = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#050010';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#1a0a2e';
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
    }

    // Board
    const b = boardRef.current;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (b[r][c]) drawCell(ctx, c, r, b[r][c]);
      }
    }

    // Piece
    const p = pieceRef.current;
    for (let r = 0; r < p.m.length; r++) {
      for (let c = 0; c < p.m[r].length; c++) {
        if (p.m[r][c]) drawCell(ctx, p.x + c, p.y + r, p.c);
      }
    }
  };

  const drawCell = (ctx, x, y, color) => {
    if (y < 0) return;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 6, 3);
  };

  const tryDrop = () => {
    const p = pieceRef.current;
    if (!collides(boardRef.current, p, 0, 1)) {
      pieceRef.current = { ...p, y: p.y + 1 };
      return true;
    }
    // Lock
    boardRef.current = merge(boardRef.current, p);
    const { board: cleared, cleared: nCleared } = clearLines(boardRef.current);
    boardRef.current = cleared;
    if (nCleared > 0) {
      const points = [0, 40, 100, 300, 1200][nCleared] || 0;
      setScore(prev => prev + points * level);
      setLines(prev => {
        const next = prev + nCleared;
        setLevel(Math.floor(next / 10) + 1);
        return next;
      });
    }
    const next = randomPiece();
    if (collides(boardRef.current, next)) {
      setGameOver(true);
      setRunning(false);
      return false;
    }
    pieceRef.current = next;
    return true;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!running) return;
      const k = e.key.toLowerCase();
      const p = pieceRef.current;
      if (k === 'arrowleft' || k === 'a') {
        if (!collides(boardRef.current, p, -1, 0)) { pieceRef.current = { ...p, x: p.x - 1 }; draw(); }
      } else if (k === 'arrowright' || k === 'd') {
        if (!collides(boardRef.current, p, 1, 0)) { pieceRef.current = { ...p, x: p.x + 1 }; draw(); }
      } else if (k === 'arrowdown' || k === 's') {
        if (tryDrop()) draw();
      } else if (k === 'arrowup' || k === 'w' || k === 'x') {
        const rotated = rotateMatrix(p.m);
        if (!collides(boardRef.current, p, 0, 0, rotated)) {
          pieceRef.current = { ...p, m: rotated };
          draw();
        }
      } else if (k === ' ') {
        e.preventDefault();
        while (tryDrop()) {}
        draw();
      } else { return; }
      if (['arrowleft','arrowright','arrowdown','arrowup',' '].includes(k)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const loop = (t) => {
      if (t - lastDropRef.current > dropSpeed()) {
        tryDrop();
        lastDropRef.current = t;
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, level]);

  useEffect(() => { if (running) draw(); /* eslint-disable-next-line */ }, [running]);

  const start = () => {
    boardRef.current = emptyBoard();
    pieceRef.current = randomPiece();
    lastDropRef.current = 0;
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setRunning(true);
  };

  return (
    <div className="ag-root">
      <div className="ag-hud">
        <span className="ag-hud-left">SCORE: {score}</span>
        <span className="ag-hud-center">TETRIS · LVL {level}</span>
        <span className="ag-hud-right">LINES: {lines}</span>
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="ag-canvas ag-canvas--narrow" />
      {(!running || gameOver) && (
        <div className="ag-overlay">
          {gameOver && <div className="ag-msg">GAME OVER</div>}
          <button className="ag-btn" onClick={start}>
            {gameOver ? 'PLAY AGAIN' : 'PLAY'}
          </button>
        </div>
      )}
      <div className="ag-controls">←→ MOVE · ↑ ROT · ↓ SOFT · SPACE HARD · ESC SALIR</div>
    </div>
  );
}
