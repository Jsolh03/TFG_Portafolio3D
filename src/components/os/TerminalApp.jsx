import React, { useState, useRef, useEffect } from 'react';

export default function TerminalApp() {
  // --- 1. ESTADOS (Memoria de la Terminal) ---
  // 'input' guarda lo que el usuario está escribiendo en este momento
  const [input, setInput] = useState('');
  
  // 'history' guarda todas las líneas de texto que ya se han mostrado en la pantalla
  const [history, setHistory] = useState([
    { type: 'system', text: 'K-OS Terminal v1.0.0 inicializada.' },
    { type: 'system', text: 'Escribe "help" para ver los comandos disponibles.' }
  ]);

  // 'endOfTerminalRef' es un "ancla" invisible que ponemos al final de la pantalla
  // Sirve para que la terminal haga scroll hacia abajo automáticamente
  const endOfTerminalRef = useRef(null);

  // --- 2. EFECTOS (Ciclo de vida) ---
  // Este useEffect se ejecuta CADA VEZ que el estado 'history' cambia (se añade un comando nuevo)
  useEffect(() => {
    // Busca el "ancla" y hace scroll suave hacia ella
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // --- 3. LÓGICA DE COMANDOS ---
  // Esta función se ejecuta cada vez que el usuario pulsa una tecla en el input
  const handleCommand = (e) => {
    // Solo nos interesa si la tecla pulsada es "Enter"
    if (e.key === 'Enter') {
      // Limpiamos espacios en blanco y pasamos a minúsculas para evitar errores (ej: "HELP ")
      const cmd = input.trim().toLowerCase();
      let output = '';

      // Evaluamos qué comando ha escrito el usuario
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
          // Abre el enlace en una pestaña nueva
          window.open('https://github.com/Jsolh03', '_blank');
          break;
        case 'clear':
          // Borra el historial y vacía el input. El 'return' evita que se ejecute el código de abajo.
          setHistory([]);
          setInput('');
          return;
        case '':
          // Si pulsa Enter sin escribir nada, no hacemos nada
          output = '';
          break;
        default:
          output = `Comando no encontrado: ${cmd}. Escribe "help".`;
      }

      // Actualizamos el historial: 
      // 1. Conservamos lo que ya había (...prev)
      // 2. Añadimos lo que escribió el usuario
      // 3. Si hay una respuesta (output), también la añadimos
      setHistory((prev) => [
        ...prev,
        { type: 'user', text: `C:\\Users\\Invitado> ${cmd}` },
        ...(output ? [{ type: 'output', text: output }] : [])
      ]);
      
      // Vaciamos la barra de escritura para el siguiente comando
      setInput('');
    }
  };

  // --- 4. INTERFAZ GRÁFICA (Renderizado) ---
  return (
    // Si hacemos clic en cualquier parte de la ventana negra, hacemos "focus" en la barra de texto
    <div className="terminal-app" onClick={() => document.getElementById('term-input').focus()}>
      
      {/* Zona donde se muestra el historial */}
      <div className="terminal-history">
        {history.map((line, index) => (
          // Asignamos una clase CSS dinámica (system, user u output) para darle colores distintos
          <div key={index} className={`term-line ${line.type}`}>
            {line.text}
          </div>
        ))}
        {/* Aquí está el "ancla" invisible para el auto-scroll */}
        <div ref={endOfTerminalRef} />
      </div>

      {/* Zona donde el usuario escribe */}
      <div className="terminal-input-line">
        <span className="prompt">C:\Users\Invitado&gt;</span>
        <input
          id="term-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)} // Actualiza el estado letra a letra
          onKeyDown={handleCommand} // Escucha la tecla Enter
          autoComplete="off"
          spellCheck="false"
          autoFocus // Pone el cursor aquí automáticamente al abrir la app
        />
      </div>
    </div>
  );
}