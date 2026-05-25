import React, { useState } from 'react';
import { useT } from '../../context/LanguageContext';

export default function InfoApp({ user, fullData, onOpenCV }) {
  const t = useT();
  const [selectedOption, setSelectedOption] = useState(null);
  const data = fullData || {};

  const options = [
    { id: 'cv',       icon: '📄' },
    { id: 'resumen',  icon: '💼' },
    { id: 'contacto', icon: '📧' }
  ];

  const optionLabel = (id) => {
    if (id === 'cv')       return t('info.viewCV');
    if (id === 'resumen')  return t('info.profSummary');
    if (id === 'contacto') return t('info.contact');
    return id;
  };

  const handleSelect = (id) => {
    if (id === 'cv') { onOpenCV(); return; }
    setSelectedOption(id);
  };

  const getContent = () => {
    switch (selectedOption) {
      case 'resumen':
        return (
          <div className="info-detail">
            <h2>{data.name || user}</h2>
            <p>{data.tagline || ''}</p>
            <p><strong>{t('info.mainStack')}</strong> {data.skills?.join(', ') || ''}</p>
          </div>
        );
      case 'contacto':
        return (
          <div className="info-detail">
            <h2>{t('info.contact')}</h2>
            <p><strong>{t('info.email')}</strong> {data.contact?.email || t('common.notAvailable')}</p>
            <p><strong>{t('info.linkedin')}</strong> {data.contact?.linkedin || t('common.notAvailable')}</p>
            <p><strong>{t('info.github')}</strong> {data.contact?.github || t('common.notAvailable')}</p>
          </div>
        );
      default: return null;
    }
  };

  if (selectedOption) {
    return (
      <div className="info-app">
        <button className="info-back" onClick={() => setSelectedOption(null)}>{t('info.back')}</button>
        {getContent()}
      </div>
    );
  }

  return (
    <div className="info-app">
      <h1 className="info-title">{t('info.title')}</h1>
      <div className="info-menu">
        {options.map(opt => (
          <button key={opt.id} onClick={() => handleSelect(opt.id)} className="info-option">
            <span className="info-option-icon">{opt.icon}</span>
            {optionLabel(opt.id)}
          </button>
        ))}
      </div>
    </div>
  );
}
