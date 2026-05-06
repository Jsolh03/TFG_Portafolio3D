import React, { useState } from 'react';

export default function InfoApp({ user, fullData, onOpenCV }) {
    const [selectedOption, setSelectedOption] = useState(null);

    const options = [
        { id: 'cv', label: 'Ver CV Completo', icon: '📄', color: '#a034e7' },
        { id: 'resumen', label: 'Resumen Profesional', icon: '💼', color: '#74b9ff' },
        { id: 'contacto', label: 'Contacto', icon: '📧', color: '#4af626' },
    ];

    const getContentForOption = () => {
        const data = fullData || {};
        switch (selectedOption) {
            case 'cv':
                return onOpenCV();
            case 'resumen':
                return (
                    <div style={{ padding: '30px', color: '#c9d1d9' }}>
                        <h2 style={{ color: '#a034e7' }}>{data.name || user}</h2>
                        <p>{data.tagline || ''}</p>
                        <p><strong>Stack Principal:</strong> {data.skills?.join(', ') || ''}</p>
                    </div>
                );
            case 'contacto':
                return (
                    <div style={{ padding: '30px', color: '#c9d1d9' }}>
                        <h2 style={{ color: '#a034e7' }}>Contacto</h2>
                        <p><strong>Email:</strong> {data.contact?.email || 'No disponible'}</p>
                        <p><strong>LinkedIn:</strong> {data.contact?.linkedin || 'No disponible'}</p>
                        <p><strong>GitHub:</strong> {data.contact?.github || 'No disponible'}</p>
                    </div>
                );
            default: return null;
        }
    };

    if (selectedOption) {
        return (
            <div style={{ width: '100%', height: '100%', background: '#0d1117' }}>
                <button onClick={() => setSelectedOption(null)} style={{ padding: '10px', color: '#a034e7', background: 'none', border: 'none', cursor: 'pointer' }}>← Volver</button>
                {getContentForOption()}
            </div>
        );
    }

    return (
        <div style={{ padding: '30px', background: '#0d1117', height: '100%' }}>
            <h1 style={{ color: '#a034e7', textAlign: 'center' }}>Información</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {options.map(opt => (
                    <button key={opt.id} onClick={() => setSelectedOption(opt.id)} style={{ padding: '20px', background: 'rgba(160, 52, 231, 0.05)', color: 'white', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}>
                        {opt.icon} {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}