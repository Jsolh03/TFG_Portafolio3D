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
  }
}, {
  strict: false,
  timestamps: true
});

const User = mongoose.model('User', userSchema, 'users');

const encuestaSchema = new mongoose.Schema({
  nombre: String,
  comentario: String,
  puntuacion: Number,
  created_at: { type: Date, default: Date.now }
}, { 
  versionKey: false // <--- Esto evita que se cree el campo __v
});

const Encuesta = mongoose.model('Encuesta', encuestaSchema, 'encuestas');

app.get('/api/users/:userId', async (req, res) => {
  try {
    const userFound = await User.findOne({ id: req.params.userId });
    userFound
      ? res.json(userFound)
      : res.status(404).json({ error: "No encontrado" });
  } catch (err) {
    console.error("Error en GET /api/users:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
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
    const lista = await Encuesta.find().sort({ created_at: -1 });
    res.json(lista);
  } catch (err) {
    console.error("Error en GET /api/encuestas:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(5000, () => console.log(" -- Backend en puerto 5000 --"));