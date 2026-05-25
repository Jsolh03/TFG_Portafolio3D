// Script puntual para actualizar las apps disponibles del usuario "laura"
// Uso: node scripts/update-laura-apps.js
// Requiere variable de entorno MONGODB_URI o usa la conexión del back-end por defecto.

import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('✗ Falta MONGODB_URI en el entorno (.env)');
  process.exit(1);
}

const TARGET_USER = 'laura';
const APPS_TO_ADD = ['calc', 'clock', 'notes', 'snake'];

async function run() {
  await mongoose.connect(uri);
  const User = mongoose.connection.collection('users');

  const before = await User.findOne({ id: TARGET_USER }, { projection: { apps: 1 } });
  if (!before) {
    console.error(`✗ Usuario "${TARGET_USER}" no encontrado.`);
    process.exit(1);
  }

  const currentApps = Array.isArray(before.apps) ? before.apps : [];
  const merged = Array.from(new Set([...currentApps, ...APPS_TO_ADD]));

  console.log(`Apps actuales de ${TARGET_USER}:`, currentApps);
  console.log(`Apps tras update:        `, merged);

  const res = await User.updateOne(
    { id: TARGET_USER },
    { $set: { apps: merged } }
  );
  console.log(`✓ Actualizado. matched=${res.matchedCount}, modified=${res.modifiedCount}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});
