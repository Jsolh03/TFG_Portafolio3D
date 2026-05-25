// Script puntual para añadir DSAnexus + Hospital José Germain a la
// experiencia del usuario "khaled" y reforzar skills relacionadas con
// vibecoding y agentes IA. Idempotente: no duplica entries ya presentes.
//
// Uso: node scripts/update-khaled-info.js
// Requiere MONGODB_URI en el entorno (ya configurado en .env del proyecto).

import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('✗ Falta MONGODB_URI en el entorno (.env)');
  process.exit(1);
}

const TARGET_USER = 'khaled';

// Experiencias a fusionar. Si ya existe una con el mismo `company`,
// no se sobrescribe (idempotencia).
const EXPERIENCES_TO_ADD = [
  {
    role: 'Técnico en Sistemas',
    company: 'Hospital Universitario José Germain',
    period: '2024 — 2025',
    description: 'Migración Windows 10 → Windows 11 de equipos clínicos, mantenimiento de la intranet hospitalaria y la web pública, y soporte HW/SW en incidencias diarias (perfiles, drivers, conectividad, reemplazo de componentes).'
  },
  {
    role: 'Técnico colaborador',
    company: 'DSAnexus',
    period: '2025 — actualidad',
    description: 'Colaboración en proyectos de actualización tecnológica corporativa: migraciones, soporte y modernización de infraestructura para clientes finales. https://www.dsanexus.com/'
  }
];

const SKILLS_TO_ADD = [
  'Vibe Coding',
  'Agentes IA (Claude Code, MCP)',
  'Migraciones Windows 10/11',
  'Soporte HW/SW'
];

const sameCompany = (a, b) =>
  (a.company || '').trim().toLowerCase() === (b.company || '').trim().toLowerCase();

async function run() {
  await mongoose.connect(uri);
  const Users = mongoose.connection.collection('users');

  const before = await Users.findOne({ id: TARGET_USER });
  if (!before) {
    console.error(`✗ Usuario "${TARGET_USER}" no encontrado.`);
    process.exit(1);
  }

  const currentExp = Array.isArray(before.experience) ? before.experience : [];
  const currentSkills = Array.isArray(before.skills) ? before.skills : [];

  // Merge experience: añade solo las que no estén ya por nombre de empresa.
  const mergedExp = [...currentExp];
  for (const newExp of EXPERIENCES_TO_ADD) {
    if (!mergedExp.some(e => sameCompany(e, newExp))) {
      mergedExp.push(newExp);
    }
  }

  // Merge skills: dedup case-insensitive.
  const lowerCurrentSkills = new Set(currentSkills.map(s => s.toLowerCase()));
  const mergedSkills = [...currentSkills];
  for (const skill of SKILLS_TO_ADD) {
    if (!lowerCurrentSkills.has(skill.toLowerCase())) {
      mergedSkills.push(skill);
    }
  }

  const expChanged = mergedExp.length !== currentExp.length;
  const skillsChanged = mergedSkills.length !== currentSkills.length;

  if (!expChanged && !skillsChanged) {
    console.log('Nada que actualizar — toda la info ya estaba presente.');
    await mongoose.disconnect();
    return;
  }

  console.log('Experiencia antes:', currentExp.length, 'entradas');
  console.log('Experiencia después:', mergedExp.length, 'entradas');
  console.log('Skills antes:', currentSkills.length);
  console.log('Skills después:', mergedSkills.length);

  const res = await Users.updateOne(
    { id: TARGET_USER },
    { $set: { experience: mergedExp, skills: mergedSkills } }
  );
  console.log(`✓ Actualizado. matched=${res.matchedCount}, modified=${res.modifiedCount}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});
