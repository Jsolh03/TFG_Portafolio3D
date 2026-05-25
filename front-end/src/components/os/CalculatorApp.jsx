import React, { useEffect, useState, useCallback } from 'react';

const OPERATORS = { '+': (a,b) => a+b, '-': (a,b) => a-b, '*': (a,b) => a*b, '/': (a,b) => b === 0 ? NaN : a/b };

export default function CalculatorApp() {
  const [current, setCurrent] = useState('0');
  const [history, setHistory] = useState('');
  const [pending, setPending] = useState(null);
  const [op, setOp] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const inputDigit = useCallback((d) => {
    setCurrent(prev => waiting ? d : (prev === '0' ? d : prev + d));
    setWaiting(false);
  }, [waiting]);

  const inputDot = useCallback(() => {
    setCurrent(prev => {
      if (waiting) { setWaiting(false); return '0.'; }
      return prev.includes('.') ? prev : prev + '.';
    });
  }, [waiting]);

  const clearAll = useCallback(() => {
    setCurrent('0');
    setHistory('');
    setPending(null);
    setOp(null);
    setWaiting(false);
  }, []);

  const toggleSign = useCallback(() => {
    setCurrent(prev => prev.startsWith('-') ? prev.slice(1) : (prev === '0' ? prev : '-' + prev));
  }, []);

  const applyPercent = useCallback(() => {
    setCurrent(prev => String(parseFloat(prev) / 100));
  }, []);

  const compute = useCallback(() => {
    if (pending === null || !op) return parseFloat(current);
    const result = OPERATORS[op](pending, parseFloat(current));
    return Math.round(result * 1e10) / 1e10;
  }, [pending, op, current]);

  const setOperator = useCallback((nextOp) => {
    const value = parseFloat(current);
    if (pending !== null && op && !waiting) {
      const result = compute();
      setCurrent(String(result));
      setPending(result);
      setHistory(`${result} ${nextOp}`);
    } else {
      setPending(value);
      setHistory(`${value} ${nextOp}`);
    }
    setOp(nextOp);
    setWaiting(true);
  }, [current, pending, op, waiting, compute]);

  const equals = useCallback(() => {
    if (pending === null || !op) return;
    const result = compute();
    setHistory(`${history} ${current} =`);
    setCurrent(String(result));
    setPending(null);
    setOp(null);
    setWaiting(true);
  }, [pending, op, current, history, compute]);

  useEffect(() => {
    const onKey = (e) => {
      if (/^[0-9]$/.test(e.key)) inputDigit(e.key);
      else if (e.key === '.') inputDot();
      else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') setOperator(e.key);
      else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); }
      else if (e.key === 'Escape') clearAll();
      else if (e.key === '%') applyPercent();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inputDigit, inputDot, setOperator, equals, clearAll, applyPercent]);

  const Key = ({ children, onClick, kind = '' }) => (
    <button type="button" className={`calc-key ${kind}`} onClick={onClick}>{children}</button>
  );

  return (
    <div className="calc-app">
      <div className="calc-display">
        <div className="calc-history">{history || ' '}</div>
        <div className="calc-current">{current}</div>
      </div>
      <div className="calc-keys">
        <Key onClick={clearAll} kind="clear">C</Key>
        <Key onClick={toggleSign}>±</Key>
        <Key onClick={applyPercent}>%</Key>
        <Key onClick={() => setOperator('/')} kind="op">÷</Key>

        <Key onClick={() => inputDigit('7')}>7</Key>
        <Key onClick={() => inputDigit('8')}>8</Key>
        <Key onClick={() => inputDigit('9')}>9</Key>
        <Key onClick={() => setOperator('*')} kind="op">×</Key>

        <Key onClick={() => inputDigit('4')}>4</Key>
        <Key onClick={() => inputDigit('5')}>5</Key>
        <Key onClick={() => inputDigit('6')}>6</Key>
        <Key onClick={() => setOperator('-')} kind="op">−</Key>

        <Key onClick={() => inputDigit('1')}>1</Key>
        <Key onClick={() => inputDigit('2')}>2</Key>
        <Key onClick={() => inputDigit('3')}>3</Key>
        <Key onClick={() => setOperator('+')} kind="op">+</Key>

        <Key onClick={() => inputDigit('0')}>0</Key>
        <Key onClick={inputDot}>.</Key>
        <Key onClick={equals} kind="eq">=</Key>
      </div>
    </div>
  );
}
