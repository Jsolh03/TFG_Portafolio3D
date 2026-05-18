import React, { useState, useEffect, useRef } from 'react';

export default function World2D({ onInteract }) {
  const gridSize = 10;
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });

  const worldRef = useRef(null);

  // Auto-focus al cargar el componente
  useEffect(() => {
    if (worldRef.current) {
      worldRef.current.focus();
    }
  }, []);
  
  const mapObjects = [
    { id: 'hospital', x: 5, y: 2, type: 'npc', name: '🏥 Hospital', file: 'NexusAPI.java' },
    { id: 'arcade', x: 8, y: 8, type: 'arcade', name: '🕹️ Arcade', file: 'App.jsx' }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      setPlayerPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (e.key === 'ArrowUp') newY = Math.max(0, prev.y - 1);
        if (e.key === 'ArrowDown') newY = Math.min(gridSize - 1, prev.y + 1);
        if (e.key === 'ArrowLeft') newX = Math.max(0, prev.x - 1);
        if (e.key === 'ArrowRight') newX = Math.min(gridSize - 1, prev.x + 1);

        if (e.key === 'Enter') {
          const touchingObject = mapObjects.find(
            obj => Math.abs(obj.x - prev.x) <= 1 && Math.abs(obj.y - prev.y) <= 1
          );
          if (touchingObject) {
            onInteract(touchingObject);
          }
          return prev;
        }

        const isCollision = mapObjects.some(obj => obj.x === newX && obj.y === newY);
        return isCollision ? prev : { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onInteract]);

  return (
    <div ref={worldRef} className="world-container" tabIndex="0" style={{ outline: 'none' }}>
      <div className="world-grid">
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          // ESTAS SON LAS VARIABLES QUE SE HABÍAN BORRADO
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const isPlayer = playerPos.x === x && playerPos.y === y;
          const mapObj = mapObjects.find(obj => obj.x === x && obj.y === y);

          return (
            <div key={index} className="grid-cell" style={{ position: 'relative' }}>
              {/* PERSONAJE: Cuadrado azul */}
              {isPlayer && (
                <div style={{ width: '100%', height: '100%', background: '#4fc1ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', zIndex: 10, position: 'relative' }}>
                  👨‍💻
                </div>
              )}
              
              {/* EDIFICIOS: Cuadrados morados */}
              {mapObj && (
                <div style={{ width: '100%', height: '100%', background: '#9c88ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', position: 'relative' }}>
                  {mapObj.name.split(' ')[0]}
                  <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.9)', color: 'white', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap', zIndex: 20, border: '1px solid #555' }}>
                    {mapObj.name.split(' ')[1]}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="world-instructions" style={{ marginTop: '10px' }}>
        Haz <b>clic aquí</b> para usar el mapa. Acércate y pulsa <b>ENTER</b>.
      </div>
    </div>
  );
}