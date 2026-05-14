
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
    zona3: { type: String, default: 'bed' }
  }

});