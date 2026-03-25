import React, { useState } from 'react';
import TerminalApp from './TerminalApp';
import IdeApp from './IdeApp';
export default function ModalPC({ onClose }) {
    // Estado que controla qué aplicación está abierta (null = Escritorio)
    const [activeApp, setActiveApp] = useState(null);

    // Diccionario de aplicaciones para renderizar el contenido dinámico
    const renderAppContent = () => {
        switch (activeApp) {
            case 'terminal':
                return <TerminalApp />;
            case 'ide':
                return <IdeApp/>;
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
                        // ESCRITORIO CON ICONOS
                        <div className="desktop-grid">
                            <button className="desktop-icon" onClick={() => setActiveApp('terminal')}>
                                <div className="icon-img terminal-icon">{'>_'}</div>
                                <span>Terminal.exe</span>
                            </button>
                            <button className="desktop-icon" onClick={() => setActiveApp('ide')}>
                                <div className="icon-img ide-icon">{'</>'}</div>
                                <span>IDE_Dev.app</span>
                            </button>
                        </div>
                    ) : (
                        // VENTANA DE LA APP ACTIVA
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