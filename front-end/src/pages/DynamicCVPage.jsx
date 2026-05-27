import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import DynamicCV from '../components/os/DynamicCV';
import FloatingSettingsButton from '../components/ui/FloatingSettingsButton';
import CvAccessGate from '../components/auth/CvAccessGate';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import { API_BASE } from '../config';
import { generateCVPdf } from '../utils/cvPdf';
import { DEFAULT_TEMPLATE_ID } from '../utils/cvPdfTemplates';

export default function DynamicCVPage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const shouldAutoDownload = searchParams.get('download') === '1';
  const templateId = searchParams.get('template') || DEFAULT_TEMPLATE_ID;
  const t = useT();
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);

  const isCvOwner = isAuthenticated && authUser?.id === userId;

  useEffect(() => {
    // Si soy el dueño, mando el JWT para que el backend devuelva el CV completo
    // (sanitizeUser). Si no, recibo la versión pública (sin CV) y luego paso
    // por el gate de CvAccessGate.
    const headers = {};
    const jwt = localStorage.getItem('tfg_auth_token');
    if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
    fetch(`${API_BASE}/api/users/${userId}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('No encontrado');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, [userId]);

  // Si el response NO trae los datos del CV (visitante), tendremos que pasar
  // por el gate. Detectamos por la presencia de aboutMe/skills.
  const hasCvData = user && (user.aboutMe !== undefined || (Array.isArray(user.skills)));

  // Activar scroll en la pagina standalone (anula el overflow:hidden global).
  // Solo cuando NO es un download automatico (en ese caso la pestana se cierra al instante).
  useEffect(() => {
    if (shouldAutoDownload) return;
    document.documentElement.classList.add('cv-standalone-scroll');
    document.body.classList.add('cv-standalone-scroll');
    return () => {
      document.documentElement.classList.remove('cv-standalone-scroll');
      document.body.classList.remove('cv-standalone-scroll');
    };
  }, [shouldAutoDownload]);

  useEffect(() => {
    if (!shouldAutoDownload || !user) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      const safe = (user.name || user.id || 'portfolio').replace(/\s+/g, '_');
      try {
        await generateCVPdf({ filename: `CV_${safe}.pdf`, templateId });
      } catch (err) {
        console.error('Error generando PDF:', err);
      }
      setTimeout(() => { try { window.close(); } catch { /* ignore */ } }, 500);
    }, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [shouldAutoDownload, user, templateId]);

  if (error) {
    return (
      <>
        {!shouldAutoDownload && <FloatingSettingsButton />}
        <div style={{ color: 'var(--text-color)', padding: '20px' }}>
          {t('landing.userNotFound')}
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        {!shouldAutoDownload && <FloatingSettingsButton />}
        <div style={{ color: 'var(--text-color)', padding: '20px' }}>
          {t('cv.loading')}
        </div>
      </>
    );
  }

  // Visitante sin acceso al CV: bloquear con gate.
  if (!isCvOwner && !hasCvData) {
    return (
      <>
        {!shouldAutoDownload && <FloatingSettingsButton />}
        <CvAccessGate
          targetUserId={userId}
          onUnlock={(cv) => setUser({ ...user, ...cv })}
        />
      </>
    );
  }

  return (
    <>
      {!shouldAutoDownload && <FloatingSettingsButton />}
      <DynamicCV user={user} />
    </>
  );
}
