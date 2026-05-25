import React, { useState, useEffect } from 'react';
import { useT } from '../../context/LanguageContext';
import { API_BASE } from '../../config';

const MAX_CHARS = 280;

export default function EncuestaApp({ targetUserId }) {
  const t = useT();
  const [view, setView] = useState(() => {
    return localStorage.getItem(`encuesta_realizada_${targetUserId}`) === 'true' ? 'list' : 'form';
  });

  const [opiniones, setOpiniones] = useState([]);
  const [puntuacion, setPuntuacion] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/encuestas?targetUserId=${targetUserId}`)
      .then(res => res.json())
      .then(data => setOpiniones(data))
      .catch(err => console.error('Error cargando encuestas:', err));
  }, [view, targetUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (puntuacion === 0) return;
    const formData = new FormData(e.target);
    const nuevaOpinion = {
      targetUserId,
      nombre: formData.get('nombre'),
      comentario: formData.get('opinion'),
      puntuacion
    };
    const response = await fetch(`${API_BASE}/api/encuestas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevaOpinion)
    });

    if (response.ok) {
      localStorage.setItem(`encuesta_realizada_${targetUserId}`, 'true');
      setView('list');
      setPuntuacion(0);
      e.target.reset();
    }
  };

  const handleCaptureKeys = (e) => e.stopPropagation();

  if (view === 'list') {
    return (
      <div className="encuesta-app encuesta-app--list">
        <header className="encuesta-list-header">
          <h3>{t('encuesta.listTitle')}</h3>
          <button className="encuesta-new-btn" onClick={() => setView('form')}>{t('encuesta.newReview')}</button>
        </header>

        {opiniones.map((item) => (
          <div key={item._id} className="encuesta-review">
            <div className="encuesta-review-head">
              <strong>@{item.nombre}</strong>
              <span className="encuesta-review-stars">
                {'★'.repeat(item.puntuacion)}{'☆'.repeat(5 - item.puntuacion)}
              </span>
            </div>
            <p className="encuesta-review-text">"{item.comentario}"</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="encuesta-app encuesta-app--form">
      <div className="encuesta-form-head">
        <h2>{t('encuesta.reviewTitle')}</h2>
        <button type="button" className="encuesta-view-btn" onClick={() => setView('list')}>{t('encuesta.viewReviews')}</button>
      </div>

      <div className="encuesta-field">
        <label>{t('encuesta.name')}</label>
        <input name="nombre" placeholder={t('encuesta.namePh')} required onKeyDown={handleCaptureKeys} />
      </div>

      <div className="encuesta-field">
        <label>
          {t('encuesta.rating')} {puntuacion === 0 && <span className="encuesta-warn">{t('encuesta.ratingMissing')}</span>}
        </label>
        <div className="encuesta-stars">
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              onClick={() => setPuntuacion(n)}
              className={`encuesta-star ${n <= puntuacion ? 'active' : ''}`}
            >★</span>
          ))}
        </div>
      </div>

      <div className="encuesta-field">
        <label>{t('encuesta.comment')}</label>
        <textarea
          name="opinion"
          placeholder={t('encuesta.commentPh')}
          required
          maxLength={MAX_CHARS}
          onChange={e => setChars(e.target.value.length)}
          onKeyDown={handleCaptureKeys}
        />
        <span className={`encuesta-chars ${chars >= MAX_CHARS ? 'limit' : ''}`}>
          {t('encuesta.chars')}: {chars}/{MAX_CHARS}
        </span>
      </div>

      <button type="submit" className="encuesta-submit">{t('encuesta.submit')}</button>
    </form>
  );
}
