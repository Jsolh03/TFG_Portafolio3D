# 🎮 K-ROOM & LAURA-ROOM: Portfolio 3D Interactivo

Una experiencia inmersiva tipo metaverso que funciona como portal de portfolio. Dos salas 3D interactivas con sistemas operativos simulados, aplicaciones integradas y backend real.

**Proyecto de Fin de Grado (TFG)** - CFGS Desarrollo de Aplicaciones Multiplataforma - IES Lope de Vega

---

## 🌟 Características Principales

- **Salas 3D Interactivas**: Habitaciones isométricas en Spline con navegación WASD
- **Sistemas Operativos Simulados**: K-OS y L-OS con escritorio retro-gaming
- **IDE integrado con IA**: Editor de código (Monaco) + análisis con Gemini 1.5 Flash
- **Terminal Interactiva**: Comandos personalizados (whoami, experience, skills, github)
- **Encuesta Dinámica**: Conectada a Supabase para recopilación de datos
- **CVs Estéticos**: Portafolios HTML con diseño retro-gaming (púrpura #a034e7)
- **Autenticación Dual**: Login para Khaled y Laura
- **Multiidioma**: Interfaz en Español e Inglés
- **Responsive**: Modales con glassmorphism, optimizado para desktop

---

## 🚀 Instalación y Setup

### Requisitos Previos
- **Node.js** 18+ 
- **npm** o **yarn**

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repositorio-url>
   cd TFG

2. Instalar dependencias
npm install

3. Configurar variables de entorno
VITE_GEMINI_API_KEY=tu_clave_gemini_aqui
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_publica_supabase

4. Ejecutar en desarrollo
npm run dev

5. Build para producción
npm run build
npm run preview

📁 Estructura del ProyectoTFG/
├── src/
│   ├── pages/
│   │   ├── RoomKhaled.jsx       # Sala 3D de Khaled
│   │   └── RoomLaura.jsx        # Sala 3D de Laura
│   ├── components/os/
│   │   ├── ModalPC.jsx          # Sistema operativo simulado
│   │   ├── TerminalApp.jsx      # Terminal interactiva
│   │   ├── IdeApp.jsx           # Editor de código + IA
│   │   ├── LauraEncuestaApp.jsx # Encuesta de feedback
│   │   └── World2D.jsx          # Mundo 2D dentro del IDE
│   ├── data/
│   │   └── translations.js      # Traducciones ES/EN
│   ├── lib/
│   │   └── supabaseClient.js    # Configuración Supabase
│   ├── styles/
│   │   ├── App.css              # Estilos principales
│   │   └── index.css            # Reset global
│   ├── assets/
│   │   └── icons_laura/         # Iconos y fotos
│   ├── App.jsx                  # Componente raíz
│   └── main.jsx                 # Punto de entrada React
├── cvs/
│   ├── cv_web_khaled.html       # CV de Khaled (HTML standalone)
│   └── cv_web_lau.html          # CV de Laura (HTML standalone)
├── public/
├── index.html
├── vite.config.js
├── package.json
└── README.md

👥 Salas Disponibles
🧑‍💻 Khaled Solh El Hajji - K-ROOM
Rol: Full-Stack Developer & AI Integration Specialist

Ubicación: Madrid, España

Apps disponibles en K-OS:

Terminal.exe: Comandos interactivos (whoami, experience, skills, github)
IDE_Dev.app: Editor de código (Monaco) con análisis de código mediante IA Gemini
Mi_CV.html: Currículum vitae profesional
Stack: Java, Python, React, Node.js, Active Directory, Networks, Prompt Engineering

👩‍💻 Laura Jara Loro - LAURA-ROOM
Rol: Desarrolladora Back-End

Ubicación: Madrid, España

Apps disponibles en L-OS:

Feedback.exe: Encuesta interactiva (conectada a Supabase)
Mi_CV.html: Currículum vitae profesional
Mail.exe: Contacto directo por email
Stack: Java, Spring Boot, Python, SQL Server, Git, React

🛠️ Stack Tecnológico
Frontend
React 19.2.4 - Framework UI
Vite 8.0.1 - Build tool y dev server
CSS3 - Estilos nativos (Flexbox, Grid, animaciones)
3D & Gráficos
Three.js 0.183.2 - Renderizado 3D
@react-three/fiber 9.5.0 - Abstracción React para Three.js
@react-three/drei 10.7.7 - Utilidades para R3F
@splinetool/react-spline 4.1.0 - Integración de Spline (modelos 3D)
Editor de Código & IA
Monaco Editor 4.7.0 - Editor de código en navegador
Google Gemini 1.5 Flash API - Análisis de código con IA
Backend & Base de Datos
Supabase 2.45.0 - BaaS (PostgreSQL, Auth, Realtime)
Animaciones
GSAP 3.14.2 - Animaciones avanzadas
Code Quality
ESLint 9.39.4 - Linting de JavaScript
Vite Plugin React 6.0.1 - Plugin oficial (Oxc parser)

🔧 Variables de Entorno Requeridas
VITE_GEMINI_API_KEY         # API Key de Google Gemini para análisis de código
VITE_SUPABASE_URL           # URL de tu proyecto Supabase
VITE_SUPABASE_ANON_KEY      # Clave pública de Supabase

📝 Autores
Nombre	Rol	Links
Khaled Solh El Hajji	Full-Stack Developer & AI Specialist	GitHub
Laura Jara Loro	Back-End Developer	GitHub · LinkedIn

📚 Documentación & Recursos
Documentación de React
Documentación de Three.js
Documentación de Supabase
Documentación de Vite
Spline Docs

📄 Licencia
Proyecto educativo (TFG). © 2026 Khaled Solh El Hajji & Laura Jara Loro

🤝 Contribuciones
Este es un proyecto de fin de grado. Para sugerencias o issues, contacta con los autores.