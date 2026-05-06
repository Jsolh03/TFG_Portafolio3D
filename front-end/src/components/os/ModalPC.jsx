import React, { useState, useEffect } from 'react';
import DynamicCV from './DynamicCV';
import { API_BASE } from '../../config';

// Apps de Khaled
import TerminalApp from './TerminalApp';
import IdeApp from './IdeApp';
import InfoApp from './InfoApp';

// Apps
import EncuestaApp from './EncuestaApp';
import iconEncuesta from '../../assets/icons_laura/icon_encuesta.jpg';
import iconCV from '../../assets/icons_laura/icon_cv.jpg';
import iconMail from '../../assets/icons_laura/icon_email.jpg';

export default function ModalPC({ onClose, user, userData }) {
    const [activeApp, setActiveApp] = useState(null);
    const [fullData, setFullData] = useState(userData || null);

    // Cargamos los datos de la API al iniciar (necesarios para el CV interno)
    useEffect(() => {
        if (user && user !== 'guest') {
            fetch(`${API_BASE}/api/users/${user}`)
                .then(res => res.json())
                .then(data => setFullData(data))
                .catch(err => console.error("Error cargando datos API:", err));
        }
    }, [user]);

    const apps = fullData?.apps || userData?.apps || (user === 'khaled' ? ['terminal', 'ide', 'info'] : ['encuesta', 'cv', 'mail']);

    const renderAppContent = () => {
        switch (activeApp) {
            case 'terminal':
                return <TerminalApp fullData={fullData} user={user} />;
            case 'ide':
                return <IdeApp />;
            case 'encuesta':
                return <EncuestaApp targetUserId={user} />;
            case 'cv':
                // Ahora el CV se renderiza internamente usando los datos de la API
                return (
                    <div style={{ overflowY: 'auto', height: '100%', width: '100%', background: '#0d1117' }}>
                        <div className="cv-internal-view">
                            <DynamicCV user={fullData} />
                        </div>
                    </div>
                );
            case 'info':
                return (
                    <InfoApp 
                        user={user} 
                        fullData={fullData}
                        onOpenCV={() => setActiveApp('cv')} 
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="modal-glass">
            <div className="os-container">

                <header className="os-header">
                    <div className="os-controls">
                        {/* Si hay una app abierta, el botón de cerrar vuelve al escritorio. Si no, cierra el modal */}
                        <span className="dot close" onClick={activeApp ? () => setActiveApp(null) : onClose}></span>
                        <span className="dot minimize"></span>
                        <span className="dot maximize"></span>
                    </div>
                    <span className="os-title">
                        {activeApp ? `K-OS System / ${activeApp.toUpperCase()}` : 'K-OS Terminal_'}
                    </span>
                </header>

                <div className="os-workspace">

                    {activeApp === null ? (
                        <div className="desktop-grid">

                            {/* --- APLICACIONES DINÁMICAS --- */}
                            {apps.includes('terminal') && (
                                <button className="desktop-icon" onClick={() => setActiveApp('terminal')}>
                                    <div className="icon-img terminal-icon">{'>_'}</div>
                                    <span>Terminal.exe</span>
                                </button>
                            )}
                            
                            {apps.includes('ide') && (
                                <button className="desktop-icon" onClick={() => setActiveApp('ide')}>
                                    <div className="icon-img ide-icon">{'</>'}</div>
                                    <span>IDE_Dev.app</span>
                                </button>
                            )}
                            
                            {apps.includes('info') && (
                                <button className="desktop-icon" onClick={() => setActiveApp('info')}>
                                    <div className="icon-img cv-icon">{'📄'}</div>
                                    <span>Información</span>
                                </button>
                            )}
                            
                            {apps.includes('encuesta') && (
                                <button className="desktop-icon" onClick={() => setActiveApp('encuesta')}>
                                    <div className="icon-wrapper">
                                        <img src={iconEncuesta} alt="Feedback" className="custom-app-icon" />
                                    </div>
                                    <span>Feedback.exe</span>
                                </button>
                            )}
                            
                            {apps.includes('cv') && (
                                <button className="desktop-icon" onClick={() => setActiveApp('cv')}>
                                    <div className="icon-wrapper">
                                        <img src={iconCV} alt="CV" className="custom-app-icon" />
                                    </div>
                                    <span>Mi_CV.exe</span>
                                </button>
                            )}
                            
                            {apps.includes('mail') && (
                                <button
                                    className="desktop-icon"
                                    onClick={() => window.location.href = 'mailto:laurajaraloro@gmail.com?subject=Contacto desde el Portfolio 3D'}
                                >
                                    <div className="icon-wrapper">
                                        <img src={iconMail} alt="Correo" className="custom-app-icon" />
                                    </div>
                                    <span>Mail.exe</span>
                                </button>
                            )}

                            {/* Icono de GitHub (Dinámico según base de datos) */}
                            {(fullData?.contact?.github || fullData?.githubUrl) && (
                                <button className="desktop-icon" onClick={() => window.open(fullData?.contact?.github || fullData?.githubUrl, '_blank')}>
                                    <div className="icon-img">📂</div>
                                    <span>GitHub</span>
                                </button>
                            )}

                        </div>
                    ) : (
                        /* --- VENTANA DE APLICACIÓN ABIERTA --- */
                        <div className="app-window">
                            <div className="app-header">
                                <span>{activeApp.toUpperCase()}</span>
                                <button className="btn-close-app" onClick={() => setActiveApp(null)}>✕ Cerrar</button>
                            </div>
                            <div className="app-content" style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                                {renderAppContent()}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}