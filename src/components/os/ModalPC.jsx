import React, { useState } from 'react';

// Importamos las apps de Khaled
import TerminalApp from './TerminalApp';
import IdeApp from './IdeApp';

// Apps Laura PC:
import LauraEncuestaApp from './LauraEncuestaApp';

// (En el futuro, aquí importarás tu propia app, por ejemplo: import LauraPixelApp from './LauraPixelApp')

export default function ModalPC({ onClose, user }) {
    // Controla qué aplicación está abierta. Si es 'null', vemos el Escritorio.
    const [activeApp, setActiveApp] = useState(null);

    // Función que carga el interior de la ventana según la app seleccionada
    const renderAppContent = () => {
        switch (activeApp) {
            // Apps de Khaled
            case 'terminal':
                return <TerminalApp />;
            case 'ide':
                return <IdeApp />;

            // Apps de Laura
            case 'encuesta':
                return <LauraEncuestaApp />;
            case 'cv-web':
                return (
                    <iframe src="/cv_web_lau.html" style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} />
                );
            default:
                return null;
        }
    };

    return (
        <div className="modal-glass">
            <div className="os-container">

                {/* BARRA SUPERIOR DEL SISTEMA */}
                <header className="os-header">
                    <div className="os-controls">
                        <span className="dot close" onClick={onClose}></span>
                        <span className="dot minimize"></span>
                        <span className="dot maximize"></span>
                    </div>
                    <span className="os-title">K-OS Terminal_</span>
                </header>

                {/* ÁREA DE TRABAJO (Escritorio o App abierta) */}
                <div className="os-workspace">

                    {activeApp === null ? (
                        // --- ESCRITORIO ---
                        <div className="desktop-grid">

                            {/* ICONOS SI EL USUARIO ES KHALED */}
                            {user === 'khaled' && (
                                <>
                                    <button className="desktop-icon" onClick={() => setActiveApp('terminal')}>
                                        <div className="icon-img terminal-icon">{'>_'}</div>
                                        <span>Terminal.exe</span>
                                    </button>
                                    <button className="desktop-icon" onClick={() => setActiveApp('ide')}>
                                        <div className="icon-img ide-icon">{'</>'}</div>
                                        <span>IDE_Dev.app</span>
                                    </button>
                                </>
                            )}

                            {/* ICONOS SI EL USUARIO ES LAURA */}
                            {user === 'laura' && (
                                <>
                                    <button className="desktop-icon" onClick={() => setActiveApp('encuesta')}>
                                        <div className="icon-img" style={{ background: '#4f46e5', color: 'white' }}>📝</div>
                                        <span>Encuesta.exe</span>
                                    </button>

                                    {/* Aquí puedes dejar el icono de tu juego Pixel si lo tenías, o el del CV */}
                                    <button className="desktop-icon" onClick={() => setActiveApp('cv-web')}>
                                        <div className="icon-img" style={{ background: '#f59e0b', color: 'white' }}>👤</div>
                                        <span>Mi_CV.html</span>
                                    </button>
                                </>
                            )}

                        </div>
                    ) : (
                        // --- VENTANA DE LA APP ACTIVA ---
                        <div className="app-window">
                            <div className="app-header">
                                <span>{activeApp.toUpperCase()}</span>
                                <button className="btn-close-app" onClick={() => setActiveApp(null)}>✕ Cerrar</button>
                            </div>
                            <div className="app-content">
                                {renderAppContent()}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}