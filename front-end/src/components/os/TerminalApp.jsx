import React, { useState, useRef, useEffect } from 'react';
import { useT } from '../../context/LanguageContext';

export default function TerminalApp({ fullData, user }) {
  const t = useT();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const endOfTerminalRef = useRef(null);

  useEffect(() => {
    setHistory([
      { type: 'system', text: t('terminal.boot1') },
      { type: 'system', text: t('terminal.boot2') }
    ]);
  }, [t]);

  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim().toLowerCase();
    let output = '';
    const data = fullData || {};

    switch (cmd) {
      case 'help':
        output = t('terminal.helpResp');
        break;
      case 'whoami':
        output = `${data.name || user} - ${data.tagline || t('terminal.defaultRole')}`;
        break;
      case 'about':
        output = data.aboutMe || t('terminal.aboutFallback');
        break;
      case 'skills':
        output = data.skills?.join(', ') || t('terminal.skillsFallback');
        break;
      case 'github':
        if (data.contact?.github) {
          output = t('terminal.githubOpening', { url: data.contact.github });
          window.open(data.contact.github, '_blank');
        } else {
          output = t('terminal.githubMissing');
        }
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case '':
        output = '';
        break;
      default:
        output = t('terminal.cmdNotFound', { cmd });
    }

    setHistory((prev) => [
      ...prev,
      { type: 'user', text: `C:\\Users\\${(user || 'guest').toUpperCase()}> ${cmd}` },
      ...(output ? [{ type: 'output', text: output }] : [])
    ]);
    setInput('');
  };

  return (
    <div className="terminal-app" onClick={() => document.getElementById('term-input').focus()}>
      <div className="terminal-history">
        {history.map((line, index) => (
          <div key={index} className={`term-line ${line.type}`}>{line.text}</div>
        ))}
        <div ref={endOfTerminalRef} />
      </div>

      <div className="terminal-input-line">
        <span className="prompt">C:\Users\{(user || 'guest').toUpperCase()}&gt;</span>
        <input
          id="term-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          autoComplete="off"
          spellCheck="false"
          autoFocus
        />
      </div>
    </div>
  );
}
