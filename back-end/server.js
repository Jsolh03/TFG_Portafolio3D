import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { setDefaultResultOrder } from 'node:dns';

setDefaultResultOrder('ipv4first');
const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI || "mongodb://portfolio-bbdd:7W2Cmdv0KlJWUHG6@ac-hsd1veq-shard-00-00.birtgpa.mongodb.net:27017,ac-hsd1veq-shard-00-01.birtgpa.mongodb.net:27017,ac-hsd1veq-shard-00-02.birtgpa.mongodb.net:27017/tfg_portfolio?replicaSet=atlas-3g6dnn-shard-0&ssl=true&authSource=admin";

mongoose.connect(uri)
  .then(() => console.log("Servidor conectado a MongoDB Atlas"))
  .catch(err => console.error("Error de conexión:", err.message));

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: String,
  tagline: String,
  profileImg: String,
  aboutMe: String,
  education: [{
    title: String,
    institution: String,
    period: String
  }],
  skills: [String],
  projects: [{
    title: String,
    description: String
  }],
  contact: {
    email: String,
    github: String,
    linkedin: String
  },
  isGuest: { type: Boolean, default: false },
  roomType: { type: String, default: 'generic1' },
  font: { type: String, default: 'Inter' },
  apps: { type: [String], default: ['terminal', 'cv'] },
  tagline: { type: String, default: '' },
  aboutMe: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: { type: Array, default: [] },
  education: { type: Array, default: [] },
  projects: { type: Array, default: [] },
  contact: { type: Object, default: {} },
  zoneFunctions: {
    zona1: { type: String, default: 'pc' },
    zona2: { type: String, default: 'cv' },
    zona3: { type: String, default: 'bed' }
  }
}, {
  strict: false,
  timestamps: true
});

const User = mongoose.model('User', userSchema, 'users');

const encuestaSchema = new mongoose.Schema({
  targetUserId: String, // Para saber a quién pertenece esta encuesta
  nombre: String,
  comentario: String,
  puntuacion: Number,
  created_at: { type: Date, default: Date.now }
}, { 
  versionKey: false // <--- Esto evita que se cree el campo __v
});

const Encuesta = mongoose.model('Encuesta', encuestaSchema, 'encuestas');

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'id name roomType created_at isGuest');
    res.json(users);
  } catch (err) {
    console.error("Error en GET /api/users:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

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

app.delete('/api/users/:userId', async (req, res) => {
  try {
    const result = await User.deleteOne({ id: req.params.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    // Opcional: borrar también sus encuestas
    await Encuesta.deleteMany({ targetUserId: req.params.userId });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error en DELETE /api/users/:userId:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get('/api/check-user/:userId', async (req, res) => {
  try {
    const userFound = await User.findOne({ id: req.params.userId });
    res.json({ exists: !!userFound });
  } catch (err) {
    res.status(500).json({ error: "Error comprobando usuario" });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { 
      id, name, roomType, font, apps, zoneFunctions,
      tagline, aboutMe, skills, experience, education, projects, contact
    } = req.body;
    
    // Validar datos básicos
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: "El ID de usuario es obligatorio" });
    }

    const existingUser = await User.findOne({ id });
    if (existingUser) {
      return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
    }

    const newUser = new User({
      id,
      name: name || id,
      roomType: roomType || 'generic1',
      font: font || 'Inter',
      apps: apps || ['terminal', 'cv'],
      tagline: tagline || '',
      aboutMe: aboutMe || '',
      skills: skills || [],
      experience: experience || [],
      education: education || [],
      projects: projects || [],
      contact: contact || {},
      zoneFunctions: zoneFunctions || { zona1: 'pc', zona2: 'cv', zona3: 'bed' },
      isGuest: false
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error en POST /api/register:", err.message);
    res.status(500).json({ error: "Error interno del servidor al registrar usuario" });
  }
});

app.post('/api/encuestas', async (req, res) => {
  try {
    const nueva = new Encuesta(req.body);
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.listen(5000, () => console.log(" -- Backend en puerto 5000 --"));