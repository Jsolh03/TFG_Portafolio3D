import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { setDefaultResultOrder } from 'node:dns';

setDefaultResultOrder('ipv4first');
const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb://portfolio-bbdd:7W2Cmdv0KlJWUHG6@ac-hsd1veq-shard-00-00.birtgpa.mongodb.net:27017,ac-hsd1veq-shard-00-01.birtgpa.mongodb.net:27017,ac-hsd1veq-shard-00-02.birtgpa.mongodb.net:27017/tfg_portfolio?replicaSet=atlas-3g6dnn-shard-0&ssl=true&authSource=admin";

mongoose.connect(uri)
  .then(() => console.log("✅ Servidor conectado a MongoDB Atlas"))
  .catch(err => console.error("❌ Error:", err.message));

// --- MODELO DE USUARIO (Basado en tu User.jsx) ---
const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  subtitle: String,
  splineScene: String,
  contact: { location: String, phone: String, email: String, githubHandle: String },
  coreStack: [String],
  experience: [{ company: String, period: String, role: String, descKey: String }],
}, { strict: false });

const User = mongoose.model('User', userSchema, 'users');

// --- MODELO DE ENCUESTAS (Para sustituir a Supabase) ---
const encuestaSchema = new mongoose.Schema({
  nombre: String,
  comentario: String,
  puntuacion: Number,
  created_at: { type: Date, default: Date.now }
});

const Encuesta = mongoose.model('Encuesta', encuestaSchema, 'encuestas');

// --- RUTAS ---

// 1. Obtener un usuario
app.get('/api/users/:userId', async (req, res) => {
    const userFound = await User.findOne({ id: req.params.userId });
    userFound ? res.json(userFound) : res.status(404).json({ error: "No encontrado" });
});

// 2. Guardar una nueva encuesta
app.post('/api/encuestas', async (req, res) => {
    try {
        const nueva = new Encuesta(req.body);
        await nueva.save();
        res.status(201).json(nueva);
    } catch (err) { res.status(500).json(err); }
});

// 3. Leer todas las encuestas (para el estilo Foro)
app.get('/api/encuestas', async (req, res) => {
    const lista = await Encuesta.find().sort({ created_at: -1 });
    res.json(lista);
});

app.listen(5000, () => console.log("🚀 Backend en puerto 5000"));