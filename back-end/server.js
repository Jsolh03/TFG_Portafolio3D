import dotenv from 'dotenv';
const result = dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setDefaultResultOrder } from 'node:dns';


setDefaultResultOrder('ipv4first');
const app = express();

// Detrás de Render/Vercel/etc. para que req.ip refleje la IP real (necesario para rate-limit)
app.set('trust proxy', 1);

// Cabeceras de seguridad estándar
app.use(helmet());

// CORS restringido a orígenes permitidos (separados por coma en ALLOWED_ORIGINS)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    // Permite tools sin Origin (curl, healthchecks) y orígenes en la whitelist
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origen no permitido por CORS'));
  }
}));

// Límite de tamaño del body para evitar payloads enormes
app.use(express.json({ limit: '50kb' }));

// Rate limiters por endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Espera unos minutos.' }
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados registros desde tu IP. Inténtalo más tarde.' }
});
const encuestasLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas valoraciones desde tu IP. Inténtalo más tarde.' }
});

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("✗ Falta MONGODB_URI en el entorno (.env / variables del servidor)");
  process.exit(1);
}

//Conexión a la BBDD (MongoDB)
mongoose.connect(uri)
  .then(() => console.log("Servidor conectado a MongoDB Atlas"))
  .catch(err => console.error("Error de conexión:", err.message));

// Esquema de User
const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  tagline: { type: String, default: '' },
  profileImg: { type: String, default: '' },
  aboutMe: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: { type: Array, default: [] },
  education: { type: Array, default: [] },
  projects: { type: Array, default: [] },
  contact: { type: Object, default: {} },
  isGuest: { type: Boolean, default: false },
  roomType: { type: String, default: 'generic1' },
  font: { type: String, default: 'Inter' },
  apps: { type: [String], default: ['terminal', 'cv'] },
  zoneFunctions: {
    zona1: { type: String, default: 'pc' },
    zona2: { type: String, default: 'cv' },
    zona3: { type: String, default: 'bed' },
    zona4: { type: String, default: 'arcade' }
  }
}, {
  strict: false,
  timestamps: true
});

const User = mongoose.model('User', userSchema, 'users');

// Esquema para guardar valoraciones:
const encuestaSchema = new mongoose.Schema({
  targetUserId: String, // Name - Alias a la que pertenece la valoración.
  nombre: String,
  comentario: String,
  puntuacion: Number,
  created_at: { type: Date, default: Date.now }
}, { 
  versionKey: false 
});

const Encuesta = mongoose.model('Encuesta', encuestaSchema, 'encuestas');

// Obtener todos los usuarios (solo admin)
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'id name roomType created_at isGuest');
    res.json(users);
  } catch (err) {
    console.error("Error en GET /api/users:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Encontrar user por ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const userFound = await User.findOne({ id: req.params.userId });
    userFound
      ? res.json(userFound)
      : res.status(404).json({ error: "No encontrado" });
  } catch (err) {
    console.error("Error en GET /api/users/:userId:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Borrar user (solo admin)
app.delete('/api/users/:userId', requireAdmin, async (req, res) => {
  try {
    const result = await User.deleteOne({ id: req.params.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    //Borrar las encuestas creadas suyas:
    await Encuesta.deleteMany({ targetUserId: req.params.userId });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error en DELETE /api/users/:userId:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Comprobar si un usuario existe
app.get('/api/check-user/:userId', async (req, res) => {
  try {
    const userFound = await User.findOne({ id: req.params.userId });
    res.json({ exists: !!userFound });
  } catch (err) {
    res.status(500).json({ error: "Error comprobando usuario" });
  }
});

// Registrar un usuario (rate-limited + validación + whitelist de campos)
const ID_RE = /^[a-zA-Z0-9_-]{2,32}$/;
const isStringArray = (v, maxLen = 50, maxItem = 100) =>
  Array.isArray(v) && v.length <= maxLen && v.every(s => typeof s === 'string' && s.length <= maxItem);

app.post('/api/register', registerLimiter, async (req, res) => {
  try {
    const {
      id, name, roomType, font, apps, zoneFunctions,
      tagline, profileImg, aboutMe, skills, experience, education, projects, contact
    } = req.body || {};

    if (typeof id !== 'string' || !ID_RE.test(id)) {
      return res.status(400).json({ error: 'ID inválido (2-32 caracteres: letras, números, _ o -)' });
    }
    if (name != null && (typeof name !== 'string' || name.length > 80)) {
      return res.status(400).json({ error: 'Nombre inválido' });
    }
    if (roomType != null && (typeof roomType !== 'string' || roomType.length > 32)) {
      return res.status(400).json({ error: 'roomType inválido' });
    }
    if (font != null && (typeof font !== 'string' || font.length > 64)) {
      return res.status(400).json({ error: 'font inválida' });
    }
    if (apps != null && !isStringArray(apps, 30, 32)) {
      return res.status(400).json({ error: 'apps inválido' });
    }
    if (tagline != null && (typeof tagline !== 'string' || tagline.length > 200)) {
      return res.status(400).json({ error: 'tagline inválido' });
    }
    if (profileImg != null && (typeof profileImg !== 'string' || profileImg.length > 2048)) {
      return res.status(400).json({ error: 'profileImg inválido' });
    }
    if (aboutMe != null && (typeof aboutMe !== 'string' || aboutMe.length > 2000)) {
      return res.status(400).json({ error: 'aboutMe inválido' });
    }
    if (skills != null && !isStringArray(skills, 50, 64)) {
      return res.status(400).json({ error: 'skills inválido' });
    }
    if (experience != null && (!Array.isArray(experience) || experience.length > 30)) {
      return res.status(400).json({ error: 'experience inválido' });
    }
    if (education != null && (!Array.isArray(education) || education.length > 30)) {
      return res.status(400).json({ error: 'education inválido' });
    }
    if (projects != null && (!Array.isArray(projects) || projects.length > 30)) {
      return res.status(400).json({ error: 'projects inválido' });
    }
    if (contact != null && (typeof contact !== 'object' || Array.isArray(contact))) {
      return res.status(400).json({ error: 'contact inválido' });
    }
    if (zoneFunctions != null && (typeof zoneFunctions !== 'object' || Array.isArray(zoneFunctions))) {
      return res.status(400).json({ error: 'zoneFunctions inválido' });
    }

    const existingUser = await User.findOne({ id });
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Sólo creamos con campos del whitelist — nada que venga extra en el body se guarda
    const newUser = new User({
      id,
      name: name || id,
      roomType: roomType || 'generic1',
      font: font || 'Inter',
      apps: apps || ['terminal', 'cv'],
      tagline: tagline || '',
      profileImg: profileImg || '',
      aboutMe: aboutMe || '',
      skills: skills || [],
      experience: experience || [],
      education: education || [],
      projects: projects || [],
      contact: contact || {},
      zoneFunctions: zoneFunctions || { zona1: 'pc', zona2: 'cv', zona3: 'bed', zona4: 'arcade' },
      isGuest: false
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error en POST /api/register:', err.message);
    res.status(500).json({ error: 'Error interno del servidor al registrar usuario' });
  }
});

// Guardar nueva valoración (rate-limited y validada)
app.post('/api/encuestas', encuestasLimiter, async (req, res) => {
  try {
    const { targetUserId, nombre, comentario, puntuacion } = req.body || {};

    if (typeof targetUserId !== 'string' || targetUserId.trim().length === 0 || targetUserId.length > 64) {
      return res.status(400).json({ error: 'targetUserId inválido' });
    }
    if (typeof nombre !== 'string' || nombre.trim().length === 0 || nombre.length > 80) {
      return res.status(400).json({ error: 'Nombre inválido' });
    }
    if (typeof comentario !== 'string' || comentario.length > 1000) {
      return res.status(400).json({ error: 'Comentario inválido (máx 1000 caracteres)' });
    }
    const score = Number(puntuacion);
    if (!Number.isFinite(score) || score < 0 || score > 5) {
      return res.status(400).json({ error: 'Puntuación debe estar entre 0 y 5' });
    }

    const nueva = new Encuesta({
      targetUserId: targetUserId.trim(),
      nombre: nombre.trim(),
      comentario: comentario.trim(),
      puntuacion: score
    });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) {
    console.error("Error en POST /api/encuestas:", err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todas las valoraciones del proyecto
app.get('/api/encuestas', async (req, res) => {
  try {
    const { targetUserId } = req.query;
    const query = targetUserId ? { targetUserId } : {};
    const lista = await Encuesta.find(query).sort({ created_at: -1 });
    res.json(lista);
  } catch (err) {
    console.error("Error en GET /api/encuestas:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// Middleware: exige un JWT válido en la cabecera Authorization
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Validar contraseña de Administrador y emitir un JWT (con rate limit anti fuerza bruta)
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { password } = req.body || {};
    const hash = process.env.ADMIN_PASSWORD_HASH;
    const secret = process.env.JWT_SECRET;

    if (!hash || !secret) {
      return res.status(500).json({ error: 'Servidor mal configurado' });
    }
    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Contraseña requerida' });
    }

    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '2h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error("Error en POST /api/login:", err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(5000, () => console.log(" -- Backend en puerto 5000 --"));