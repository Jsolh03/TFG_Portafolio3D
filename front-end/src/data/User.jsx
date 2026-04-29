const userSchema = new mongoose.Schema({
  id: String,          // id usuario hab
  name: String,
  subtitle: String,
  githubUrl: String,
  splineScene: String, // La URL del modelo 3D
  contact: {
    location: String,
    phone: String,     
    email: String,
    githubHandle: String
  },
  coreStack: [String], // Array con conocimientos: ['Java', 'Python', ...]
  extraSection: {      // Para "AI Mastery" o "Habilidades"
    title: String,
    items: [String]
  },
  experience: [{
    company: String,
    period: String,
    role: String,
    descKey: String   
  }],
  education: [String]  
});