import React, { useState } from 'react';

// Apps de Khaled
import TerminalApp from './TerminalApp';
import IdeApp from './IdeApp';
import InfoApp from './InfoApp';

// Apps de Laura
import LauraEncuestaApp from './LauraEncuestaApp';
import iconEncuesta from '/src/assets/icons_laura/icon_encuesta.jpg';
import iconCV from '/src/assets/icons_laura/icon_cv.jpg';
import iconMail from '/src/assets/icons_laura/icon_email.jpg';

export default function ModalPC({ onClose, user }) {
    const [activeApp, setActiveApp] = useState(null);

    const renderAppContent = () => {
        switch (activeApp) {
            case 'terminal':
                return <TerminalApp />;
            case 'ide':
                return <IdeApp />;
            case 'encuesta':
                return <LauraEncuestaApp />;
            case 'info':
                return (
                    <InfoApp 
                        user={user} 
                        onOpenCV={() => {
                            const cvUrl = user === 'khaled' ? '/cvs/cv_web_khaled.html' : '/cvs/cv_web_lau.html';
                            window.open(cvUrl, '_blank');
                        }}
                    />
                );
            // case 'Reseñas':
            //     return
            default:
                return null;
        }
    };

    return (
        <div className="modal-glass">
            <div className="os-container">

                <header className="os-header">
                    <div className="os-controls">
                        <span className="dot close" onClick={onClose}></span>
                        <span className="dot minimize"></span>
                        <span className="dot maximize"></span>
                    </div>
                    <span className="os-title">K-OS Terminal_</span>
                </header>

                <div className="os-workspace">

                    {activeApp === null ? (
                        <div className="desktop-grid">

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
                                    <button className="desktop-icon" onClick={() => setActiveApp('info')}>
                                        <div className="icon-img cv-icon">{'📄'}</div>
                                        <span>Información</span>
                                    </button>
                                </>
                            )}

                            {user === 'laura' && (
                                <>
                                    <button className="desktop-icon" onClick={() => setActiveApp('encuesta')}>
                                        <div className="icon-wrapper">
                                            <img src={iconEncuesta} alt="Feedback" className="custom-app-icon" />
                                        </div>
                                        <span>Feedback.exe</span>
                                    </button>

                                    <button
                                        className="desktop-icon"
                                        onClick={() => window.open('/cvs/cv_web_lau.html', '_blank')}
                                    >
                                        <div className="icon-wrapper">
                                            <img src={iconCV} alt="CV" className="custom-app-icon" />
                                        </div>
                                        <span>Mi_CV.html</span>
                                    </button>

                                    <button
                                        className="desktop-icon"
                                        onClick={() => window.location.href = 'mailto:laurajaraloro@gmail.com?subject=Contacto desde el Portfolio 3D'}
                                    >
                                        <div className="icon-wrapper">
                                            <img src={iconMail} alt="Correo" className="custom-app-icon" />
                                        </div>
                                        <span>Mail.exe</span>
                                    </button>
                                </>
                            )}

                        </div>
                    ) : (
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