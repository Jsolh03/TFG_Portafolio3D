import React, { useState } from 'react';

export default function InfoApp({ user, onOpenCV }) {
    const [selectedOption, setSelectedOption] = useState(null);

    const options = [
        { id: 'cv', label: 'Ver CV Completo', icon: '📄', color: '#a034e7' },
        { id: 'resumen', label: 'Resumen Profesional', icon: '💼', color: '#74b9ff' },
        { id: 'contacto', label: 'Contacto', icon: '📧', color: '#4af626' },
    ];

    const getContentForOption = () => {
        switch (selectedOption) {
            case 'cv':
                return onOpenCV();
            case 'resumen':
                return (
                    <div style={{ padding: '30px', color: '#c9d1d9', fontSize: '1.1rem', lineHeight: '1.8' }}>
                        <h2 style={{ color: '#a034e7', marginTop: '0' }}>Resumen Profesional</h2>
                        <p>
                            Desarrollador {user === 'khaled' ? 'Full Stack' : 'especializado'} con experiencia en desarrollo web y aplicaciones interactivas.
                        </p>
                        <p>
                            Apasionado por crear soluciones innovadoras y experiencias de usuario excepcionales.
                        </p>
                        <button 
                            onClick={() => setSelectedOption('cv')}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #a034e7, #7c2aae)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                transition: '0.3s',
                                marginTop: '20px'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            Ver CV Completo →
                        </button>
                    </div>
                );
            case 'contacto':
                return (
                    <div style={{ padding: '30px', color: '#c9d1d9', fontSize: '1.1rem' }}>
                        <h2 style={{ color: '#a034e7', marginTop: '0' }}>Contacto</h2>
                        {user === 'khaled' ? (
                            <div>
                                <p><strong>Email:</strong> khaled@example.com</p>
                                <p><strong>LinkedIn:</strong> linkedin.com/in/khaled</p>
                                <p><strong>GitHub:</strong> github.com/khaled</p>
                            </div>
                        ) : (
                            <div>
                                <p><strong>Email:</strong> laurajaraloro@gmail.com</p>
                                <p><strong>LinkedIn:</strong> linkedin.com/in/laura</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    if (selectedOption) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
                <button 
                    onClick={() => setSelectedOption(null)}
                    style={{
                        padding: '12px 20px',
                        background: 'rgba(160, 52, 231, 0.1)',
                        color: '#a034e7',
                        border: '1px solid #a034e7',
                        borderRadius: '0',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        textAlign: 'left'
                    }}
                >
                    ← Volver al Menú
                </button>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {getContentForOption()}
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            background: '#0d1117',
            padding: '30px'
        }}>
            <h1 style={{ color: '#a034e7', marginTop: '0', fontSize: '2rem', textAlign: 'center' }}>
                Información
            </h1>
            <p style={{ color: '#888', textAlign: 'center', marginBottom: '40px' }}>
                Selecciona una opción para continuar
            </p>
            
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                flex: 1,
                justifyContent: 'center'
            }}>
                {options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => setSelectedOption(option.id)}
                        style={{
                            padding: '25px',
                            background: 'rgba(160, 52, 231, 0.05)',
                            border: '2px solid rgba(160, 52, 231, 0.2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#c9d1d9',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            transition: '0.3s',
                            fontFamily: 'inherit',
                            textAlign: 'left'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(160, 52, 231, 0.15)';
                            e.currentTarget.style.borderColor = option.color;
                            e.currentTarget.style.transform = 'translateX(10px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(160, 52, 231, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(160, 52, 231, 0.2)';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
