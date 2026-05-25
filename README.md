#  K-ROOM & LAURA-ROOM: Portfolio 3D Interactivo

Una experiencia inmersiva tipo metaverso que funciona como portal de portfolio. Dos salas 3D interactivas con sistemas operativos simulados, aplicaciones integradas y backend real.

**Proyecto de Fin de Grado (TFG)** - CFGS Desarrollo de Aplicaciones Multiplataforma - IES Lope de Vega

---

##  Características Principales

- **Salas 3D Interactivas**: Habitaciones isométricas en Spline con navegación WASD, E para interacción.
- **Sistemas Operativos Simulados**: K-OS y L-OS con escritorio retro-gaming.
- **IDE integrado**: Editor de código (Monaco) con descripciones de cada archivo del mundo 2D.
- **Terminal Interactiva**: Comandos personalizados (whoami, experience, skills, github).
- **Valoraciones Dinámicas**: Conectada a MongoDB para recopilación de datos de cada visitante.
- **CVs Estéticos**: Portafolios HTML con diseño retro-gaming.
- **Autenticación Dual**: Login para Khaled y Laura principalmente.
- **Registro nuevo user**: Puedes crear tu propio entorno interactivo con 9 tipos de habitaciones a elegir y tu propia configuración de datos de CV y URLs. (Guardado en formato JSON en MongoDB Atlas)
- **Multiidioma**: Interfaz en Español e Inglés.
- **Responsive**: Modales con glassmorphism, optimizado para desktop

---

##  Instalación y Setup

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

3. Ejecutar en desarrollo
npm run dev

4. Build para producción
npm run build
npm run preview

# Salas Disponibles
A parte de tu propio registro con más opciones de habitaciones, que cuando te la creas puedes buscarlo en el buscador de id usuario introduciendo el nick que pusiste para su búsqueda.

 - Khaled Solh El Hajji - K-ROOM
Rol: Full-Stack Developer

Ubicación: Madrid, España

Apps disponibles en K-OS:

Terminal.exe: Comandos interactivos (whoami, experience, skills, github)
IDE_Dev.app: Editor de código (Monaco) con descripciones de archivos del mundo 2D
Mi_CV.html: Currículum vitae profesional
Stack: Java, Python, React, Node.js, Active Directory, Networks

 - Laura Jara Loro - LAURA-ROOM
Rol: Desarrolladora Back-End

Ubicación: Madrid, España

Apps disponibles en L-OS:

Feedback.exe: Valoración interactiva (conectada a MongoDB)
Mi_CV.html: Currículum vitae profesional
Mail.exe: Contacto directo por email (API EmailJS)
Stack: Java, Spring Boot, Python, SQL Server, Git, React

# Stack Tecnológico
Frontend
React 19.2.4 - Framework UI
Vite 8.0.1 - Build tool y dev server
CSS3 - Estilos nativos (Flexbox, Grid, animaciones)
3D & Gráficos
Three.js 0.183.2 - Renderizado 3D
@react-three/fiber 9.5.0 - Abstracción React para Three.js
@react-three/drei 10.7.7 - Utilidades para R3F
@splinetool/react-spline 4.1.0 - Integración de Spline (modelos 3D)
Editor de Código
Monaco Editor 4.7.0 - Editor de código en navegador
Backend & Base de Datos
MongoDB Atlas
Animaciones
GSAP 3.14.2 - Animaciones avanzadas
Code Quality
ESLint 9.39.4 - Linting de JavaScript
Vite Plugin React 6.0.1 - Plugin oficial (Oxc parser)

# Autores

Khaled Solh El Hajji |	Full-Stack Developer
Laura Jara Loro |	Back-End Developer

# Documentación & Recursos
Documentación de React
Documentación de Three.js
Documentación de MongoDB Atlas
Documentación de Vite
Spline Docs

# Licencia
Proyecto educativo (TFG). © 2026 Khaled Solh El Hajji & Laura Jara Loro

# Contribuciones
Este es un proyecto de fin de grado. Para sugerencias o issues, contacta con los autores.
