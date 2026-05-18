import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DynamicCV from '../components/os/DynamicCV';
import { API_BASE } from '../config';

export default function DynamicCVPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/users/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("No encontrado");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, [userId]);

  if (error) return <div style={{ color: 'white', padding: '20px' }}>Error: Usuario no encontrado en la base de datos.</div>;
  if (!user) return <div style={{ color: 'white', padding: '20px' }}>Cargando datos desde MongoDB Atlas...</div>;

  return <DynamicCV user={user} />;
}