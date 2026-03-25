import React, { useState, useRef, useEffect } from 'react';

export default function TerminalApp() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', text: 'K-OS Terminal v1.0.0 inicializada.' },
    { type: 'system', text: 'Escribe "help" para ver los comandos disponibles.' }
  ]);
  const endOfTerminalRef = useRef(null);

  // Auto-scroll hacia abajo cada vez que se añade un comando
  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      let output = '';

      switch (cmd) {
        case 'help':
          output = 'Comandos: whoami, experience, skills, clear, github';
          break;
        case 'whoami':
          output = 'Khaled Solh El Hajji - Full-Stack Developer & AI Integrator.';
          break;
        case 'experience':
          output = '1. DSA NEXUX (Full-Stack & IA)\n2. Hospital U. José Germain (IT Systems)';
          break;
        case 'skills':
          output = 'Java, Python, React, Node.js, Active Directory, Prompt Engineering.';
          break;
        case 'github':
          output = 'Abriendo conexión segura con github.com/Jsolh03...';
          window.open('https://github.com/Jsolh03', '_blank');
          break;
        case 'clear':
          setHistory([]);
          setInput('');
          return;
        case '':
          output = '';
          break;
        default:
          output = `Comando no encontrado: ${cmd}. Escribe "help".`;
      }

      // Añadimos el comando escrito y su respuesta al historial
      setHistory((prev) => [
        ...prev,
        { type: 'user', text: `C:\\Users\\Invitado> ${cmd}` },
        ...(output ? [{ type: 'output', text: output }] : [])
      ]);
      setInput('');
    }
  };

  return (
    <div className="terminal-app" onClick={() => document.getElementById('term-input').focus()}>
      <div className="terminal-history">
        {history.map((line, index) => (
          <div key={index} className={`term-line ${line.type}`}>
            {line.text}
          </div>
        ))}
        <div ref={endOfTerminalRef} />
      </div>
      <div className="terminal-input-line">
        <span className="prompt">C:\Users\Invitado&gt;</span>
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