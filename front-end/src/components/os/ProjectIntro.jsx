import React from 'react';

export default function ProjectIntro({ onContinue }) {
  return (
    <div className="intro-overlay" style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh',
        background: 'radial-gradient(circle, #1a1a24 0%, #0d0d12 100%)',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 9999 // ← Cambiado de z-index a zIndex
    }}>
      <div className="os-window" style={{
          width: '600px', 
          background: '#0d1117', 
          border: '2px solid #a034e7',
          boxShadow: '0 0 30px rgba(160, 52, 231, 0.3)', 
          color: 'white'
      }}>
        <header style={{ 
            background: '#161b22', 
            padding: '10px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            borderBottom: '1px solid #333' 
        }}>
          <span>SYSTEM_INFO_v1.0.exe</span>
          <div style={{ cursor: 'pointer', color: '#a034e7', fontWeight: 'bold' }} onClick={onContinue}>✕</div>
        </header>

        <div style={{ padding: '30px' }}>
          <h1 style={{ color: '#a034e7', marginTop: 0 }}>PROYECTO: PORTFOLIO 3D</h1>
          <p>Bienvenido al entorno de desarrollo. Este sistema integra:</p>
          <ul style={{ lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
            <li><span style={{ color: '#a034e7' }}>▶</span> <strong>Frontend:</strong> React + Three.js</li>
            <li><span style={{ color: '#a034e7' }}>▶</span> <strong>Backend:</strong> Node.js + Express</li>
            <li><span style={{ color: '#a034e7' }}>▶</span> <strong>BBDD:</strong> MongoDB Atlas</li>
          </ul>
          
          <button 
            onClick={onContinue}
            style={{
                marginTop: '20px', 
                background: '#a034e7', 
                color: 'white', 
                border: 'none',
                padding: '15px 24px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                width: '100%',
                borderRadius: '4px',
                fontSize: '1rem'
            }}
          >
            INICIALIZAR ENTORNO_
          </button>
        </div>
      </div>
    </div>
  );
}