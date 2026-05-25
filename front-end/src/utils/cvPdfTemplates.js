/**
 * Registro de plantillas de descarga del CV en PDF.
 *
 * Cada plantilla es un bloque de CSS que se inyecta al renderizar el PDF
 * (tanto en el DOM vivo como en el documento clonado de html2canvas).
 *
 * El selector `.cv-container` y sus hijos (`.cv-name`, `.cv-section`, etc.)
 * son los mismos que ya pinta DynamicCV — solo cambia el "vestido" para imprenta.
 *
 * ─── CRITERIOS ATS-FRIENDLY (aplicados a TODAS las plantillas) ───
 * Los CVs deben superar el filtro de los selectores automaticos (Greenhouse, Lever,
 * Workday, etc.) y ser legibles para reclutadores. Reglas que respetan TODAS las
 * plantillas, por innovadora que sea:
 *
 *   1. Una sola columna, flujo lineal arriba->abajo, sin tablas (los ATS leen en
 *      orden DOM y se rompen con layouts multi-columna).
 *   2. Nombres de seccion estandar visibles ("Sobre mi", "Experiencia", "Formacion",
 *      "Contacto"). Pueden ir decorados con un numero o prefijo pero el texto base
 *      tiene que estar.
 *   3. Datos criticos (nombre, email, telefono, empresas, fechas) van como TEXTO
 *      real en el DOM, nunca dentro de imagenes o iconos. Las decoraciones via
 *      ::before/::after son solo visuales.
 *   4. Sin headers/footers que se repitan por pagina (rompen el parseo).
 *   5. Fechas en formato estandar (los reclutadores y los parsers prefieren
 *      "2022 - 2024" o "ene 2022 - mar 2024", no formatos creativos).
 *   6. Suficiente contraste de color para OCR (los ATS modernos hacen vision).
 *      Texto principal siempre #000 / #111 / #1f1f1f sobre fondo blanco.
 *
 * Nota tecnica: html2pdf.js genera PDFs basados en imagen (rasterizados). ATS
 * antiguos basados en extraccion de texto-PDF tendran menos exito; los ATS
 * modernos (con OCR / vision LLM) los parsean sin problema. La plantilla
 * "Classic" es la mas segura para ATS antiguos.
 */

const CLASSIC_CSS = `
  html, body { background: #ffffff !important; }
  body * { animation: none !important; transition: none !important; }

  .cv-toolbar, .cv-lang-badge, .fsb-trigger,
  .settings-overlay, .floating-settings-button { display: none !important; }

  .cv-dynamic-wrapper {
    background: #ffffff !important;
    color: #111111 !important;
    padding: 0 !important;
    min-height: 0 !important;
    display: block !important;
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  }
  .cv-container {
    width: 688px !important;
    max-width: 688px !important;
    margin: 0 auto !important;
    padding: 32px 40px 40px !important;
    background: #ffffff !important;
    color: #111111 !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .cv-container * {
    text-shadow: none !important;
    box-shadow: none !important;
    background-image: none !important;
    -webkit-background-clip: border-box !important;
    background-clip: border-box !important;
    -webkit-text-fill-color: currentColor !important;
  }

  .cv-header {
    text-align: center !important;
    padding: 0 0 20px !important;
    margin: 0 0 12px !important;
    border-bottom: 1px solid #222222 !important;
  }
  .cv-avatar-frame {
    width: 120px !important;
    height: 120px !important;
    border-radius: 50% !important;
    border: 1px solid #888888 !important;
    background: transparent !important;
    margin: 0 auto 14px !important;
    overflow: hidden !important;
  }
  .cv-avatar-img { width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important; }
  .cv-avatar-placeholder { font-size: 48px !important; color: #888888 !important; }
  .cv-name {
    color: #000000 !important;
    font-size: 30px !important;
    font-weight: 700 !important;
    letter-spacing: 1px !important;
    margin: 0 0 6px !important;
    line-height: 1.2 !important;
  }
  .cv-tagline {
    color: #444444 !important;
    font-size: 13px !important;
    letter-spacing: 0.5px !important;
    font-weight: 400 !important;
    margin: 0 !important;
  }

  .cv-section {
    padding: 18px 0 4px !important;
    border-bottom: 1px solid #d6d6d6 !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .cv-section:last-child { border-bottom: none !important; }
  .cv-section-title {
    color: #000000 !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 3px !important;
    margin: 0 0 12px !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
  }
  .cv-section-title::after {
    content: '' !important;
    flex: 1 !important;
    height: 1px !important;
    background: #bbbbbb !important;
  }

  .cv-about-text { color: #222222 !important; font-size: 13px !important; line-height: 1.7 !important; margin: 0 !important; }

  .cv-skills-grid { display: flex !important; flex-wrap: wrap !important; gap: 6px !important; }
  .cv-skill-badge {
    background: #ffffff !important;
    border: 1px solid #999999 !important;
    color: #111111 !important;
    padding: 3px 10px !important;
    border-radius: 2px !important;
    font-size: 11px !important;
    letter-spacing: 0.2px !important;
    font-weight: 500 !important;
  }

  .cv-experience-card {
    border-left: 2px solid #888888 !important;
    padding: 2px 0 2px 14px !important;
    margin-bottom: 14px !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .cv-experience-card:last-child { margin-bottom: 0 !important; }
  .cv-experience-card strong {
    display: block !important;
    color: #000000 !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    margin-bottom: 3px !important;
    letter-spacing: 0.2px !important;
  }
  .cv-experience-card .cv-meta {
    color: #555555 !important;
    font-size: 11px !important;
    font-style: italic !important;
    margin: 0 0 4px !important;
    letter-spacing: 0 !important;
  }
  .cv-experience-card p {
    color: #222222 !important;
    font-size: 12px !important;
    line-height: 1.6 !important;
    margin: 4px 0 0 !important;
  }

  .cv-contact-grid {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 12px 20px !important;
    margin-top: 4px !important;
  }
  .cv-contact-grid a, .cv-project-link {
    color: #111111 !important;
    text-decoration: underline !important;
    font-size: 12px !important;
    letter-spacing: 0 !important;
  }
`;

const BLUE_CSS = `
  html, body { background: #ffffff !important; }
  body * { animation: none !important; transition: none !important; }

  .cv-toolbar, .cv-lang-badge, .fsb-trigger,
  .settings-overlay, .floating-settings-button { display: none !important; }

  .cv-dynamic-wrapper {
    background: #ffffff !important;
    color: #0f172a !important;
    padding: 0 !important;
    min-height: 0 !important;
    display: block !important;
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  }
  .cv-container {
    width: 688px !important;
    max-width: 688px !important;
    margin: 0 auto !important;
    padding: 32px 40px 40px !important;
    background: #ffffff !important;
    color: #0f172a !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .cv-container * {
    text-shadow: none !important;
    box-shadow: none !important;
    background-image: none !important;
    -webkit-background-clip: border-box !important;
    background-clip: border-box !important;
    -webkit-text-fill-color: currentColor !important;
  }

  .cv-header {
    text-align: center !important;
    padding: 0 0 22px !important;
    margin: 0 0 14px !important;
    border-bottom: 3px solid #1e3a8a !important;
  }
  .cv-avatar-frame {
    width: 120px !important;
    height: 120px !important;
    border-radius: 50% !important;
    border: 2px solid #1e3a8a !important;
    background: transparent !important;
    margin: 0 auto 14px !important;
    overflow: hidden !important;
  }
  .cv-avatar-img { width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important; }
  .cv-avatar-placeholder { font-size: 48px !important; color: #1e3a8a !important; }
  .cv-name {
    color: #0b2e5e !important;
    font-size: 32px !important;
    font-weight: 700 !important;
    letter-spacing: 1px !important;
    margin: 0 0 6px !important;
    line-height: 1.2 !important;
  }
  .cv-tagline {
    color: #2563eb !important;
    font-size: 13px !important;
    letter-spacing: 1px !important;
    font-weight: 500 !important;
    margin: 0 !important;
  }

  .cv-section {
    padding: 18px 0 4px !important;
    border-bottom: 1px solid #c7dafe !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .cv-section:last-child { border-bottom: none !important; }
  .cv-section-title {
    color: #0b2e5e !important;
    font-size: 12px !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 3px !important;
    margin: 0 0 12px !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
  }
  .cv-section-title::after {
    content: '' !important;
    flex: 1 !important;
    height: 2px !important;
    background: #93c5fd !important;
  }

  .cv-about-text { color: #1e293b !important; font-size: 13px !important; line-height: 1.7 !important; margin: 0 !important; }

  .cv-skills-grid { display: flex !important; flex-wrap: wrap !important; gap: 6px !important; }
  .cv-skill-badge {
    background: #eff6ff !important;
    border: 1px solid #1e3a8a !important;
    color: #0b2e5e !important;
    padding: 3px 10px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    letter-spacing: 0.2px !important;
    font-weight: 600 !important;
  }

  .cv-experience-card {
    border-left: 3px solid #1e3a8a !important;
    padding: 2px 0 2px 14px !important;
    margin-bottom: 14px !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .cv-experience-card:last-child { margin-bottom: 0 !important; }
  .cv-experience-card strong {
    display: block !important;
    color: #0b2e5e !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    margin-bottom: 3px !important;
    letter-spacing: 0.2px !important;
  }
  .cv-experience-card .cv-meta {
    color: #2563eb !important;
    font-size: 11px !important;
    font-style: italic !important;
    margin: 0 0 4px !important;
    letter-spacing: 0 !important;
    font-weight: 500 !important;
  }
  .cv-experience-card p {
    color: #1e293b !important;
    font-size: 12px !important;
    line-height: 1.6 !important;
    margin: 4px 0 0 !important;
  }

  .cv-contact-grid {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 12px 20px !important;
    margin-top: 4px !important;
  }
  .cv-contact-grid a, .cv-project-link {
    color: #1e40af !important;
    text-decoration: underline !important;
    font-size: 12px !important;
    letter-spacing: 0 !important;
    font-weight: 500 !important;
  }
`;

/**
 * Plantilla CYBER / DEV: tipografia monoespaciada en metadatos,
 * secciones numeradas estilo [01], headers con prompt de shell,
 * tags como `{ skill }`, color de acento verde fosforo.
 * Atrevido pero sigue siendo un CV imprimible y legible para reclutadores.
 */
const CYBER_CSS = `
  html, body { background: #ffffff !important; }
  body * { animation: none !important; transition: none !important; }

  .cv-toolbar, .cv-lang-badge, .fsb-trigger,
  .settings-overlay, .floating-settings-button { display: none !important; }

  .cv-dynamic-wrapper {
    background: #ffffff !important;
    color: #0a0a0a !important;
    padding: 0 !important;
    min-height: 0 !important;
    display: block !important;
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  }
  .cv-container {
    width: 688px !important;
    max-width: 688px !important;
    margin: 0 auto !important;
    padding: 32px 40px 40px !important;
    background: #ffffff !important;
    color: #0a0a0a !important;
    box-shadow: none !important;
    position: relative !important;
    counter-reset: cvsec !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .cv-container * {
    text-shadow: none !important;
    box-shadow: none !important;
    background-image: none !important;
    -webkit-background-clip: border-box !important;
    background-clip: border-box !important;
    -webkit-text-fill-color: currentColor !important;
  }
  .cv-container::before {
    content: '$ cat curriculum.md' !important;
    display: block !important;
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
    font-size: 11px !important;
    color: #047857 !important;
    border-bottom: 1px dashed #10b981 !important;
    padding-bottom: 8px !important;
    margin-bottom: 18px !important;
    letter-spacing: 0.5px !important;
  }

  .cv-header {
    text-align: left !important;
    display: grid !important;
    grid-template-columns: 110px 1fr !important;
    column-gap: 22px !important;
    align-items: center !important;
    padding: 0 0 18px !important;
    margin: 0 0 12px !important;
    border-bottom: 1px solid #10b981 !important;
  }
  .cv-avatar-frame {
    width: 110px !important;
    height: 110px !important;
    border-radius: 4px !important;
    border: 1px solid #10b981 !important;
    background: transparent !important;
    margin: 0 !important;
    overflow: hidden !important;
  }
  .cv-avatar-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
    filter: grayscale(0.25) contrast(1.05) !important;
  }
  .cv-avatar-placeholder { font-size: 48px !important; color: #10b981 !important; }
  .cv-name {
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
    color: #0a0a0a !important;
    font-size: 24px !important;
    font-weight: 700 !important;
    letter-spacing: 0 !important;
    margin: 0 0 4px !important;
    line-height: 1.2 !important;
  }
  .cv-name::before {
    content: '> ' !important;
    color: #10b981 !important;
  }
  .cv-tagline {
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
    color: #555555 !important;
    font-size: 12px !important;
    letter-spacing: 0 !important;
    font-weight: 400 !important;
    margin: 0 !important;
  }
  .cv-tagline::before {
    content: '// ' !important;
    color: #10b981 !important;
  }

  .cv-section {
    counter-increment: cvsec !important;
    padding: 18px 0 6px !important;
    border-bottom: 1px dashed #d1d5db !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .cv-section:last-child { border-bottom: none !important; }
  .cv-section-title {
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
    color: #0a0a0a !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
    margin: 0 0 12px !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
  }
  .cv-section-title::before {
    content: '[' counter(cvsec, decimal-leading-zero) ']' !important;
    color: #10b981 !important;
    font-weight: 700 !important;
  }
  .cv-section-title::after {
    content: '' !important;
    flex: 1 !important;
    height: 1px !important;
    background: repeating-linear-gradient(to right, #cbd5e1 0, #cbd5e1 4px, transparent 4px, transparent 8px) !important;
  }

  .cv-about-text { color: #1f2937 !important; font-size: 13px !important; line-height: 1.7 !important; margin: 0 !important; }

  .cv-skills-grid { display: flex !important; flex-wrap: wrap !important; gap: 6px !important; }
  .cv-skill-badge {
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
    background: #f0fdf4 !important;
    border: 1px solid #10b981 !important;
    color: #064e3b !important;
    padding: 3px 8px !important;
    border-radius: 2px !important;
    font-size: 11px !important;
    letter-spacing: 0 !important;
    font-weight: 500 !important;
  }
  .cv-skill-badge::before { content: '{ ' !important; color: #10b981 !important; font-weight: 700 !important; }
  .cv-skill-badge::after  { content: ' }' !important; color: #10b981 !important; font-weight: 700 !important; }

  .cv-experience-card {
    border-left: 2px solid #10b981 !important;
    padding: 2px 0 2px 16px !important;
    margin-bottom: 14px !important;
    page-break-inside: avoid;
    break-inside: avoid;
    position: relative !important;
  }
  .cv-experience-card::before {
    content: '▸' !important;
    position: absolute !important;
    left: -7px !important;
    top: 0 !important;
    color: #10b981 !important;
    font-size: 12px !important;
    background: #ffffff !important;
    padding: 0 1px !important;
    line-height: 1.1 !important;
  }
  .cv-experience-card:last-child { margin-bottom: 0 !important; }
  .cv-experience-card strong {
    display: block !important;
    color: #0a0a0a !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    margin-bottom: 3px !important;
    letter-spacing: 0 !important;
  }
  .cv-experience-card .cv-meta {
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
    color: #10b981 !important;
    font-size: 10px !important;
    font-style: normal !important;
    margin: 0 0 4px !important;
    letter-spacing: 0 !important;
    font-weight: 500 !important;
  }
  .cv-experience-card .cv-meta::before {
    content: '// ' !important;
    color: #94a3b8 !important;
  }
  .cv-experience-card p {
    color: #1f2937 !important;
    font-size: 12px !important;
    line-height: 1.6 !important;
    margin: 4px 0 0 !important;
  }

  .cv-contact-grid {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 10px 18px !important;
    margin-top: 4px !important;
  }
  .cv-contact-grid a, .cv-project-link {
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
    color: #0a0a0a !important;
    text-decoration: underline !important;
    text-decoration-color: #10b981 !important;
    text-underline-offset: 2px !important;
    font-size: 12px !important;
    letter-spacing: 0 !important;
  }
`;

/**
 * Plantilla EDITORIAL / APUESTA: estilo revista de moda / diario editorial.
 * Tipografia masiva, banda magenta de cabecera, secciones numeradas como
 * "Nº 01", skills en linea separados por puntos magenta. Atrevida y memorable
 * pero sigue siendo una sola columna con texto plano negro -> ATS lo lee bien.
 */
const EDITORIAL_CSS = `
  html, body { background: #ffffff !important; }
  body * { animation: none !important; transition: none !important; }

  .cv-toolbar, .cv-lang-badge, .fsb-trigger,
  .settings-overlay, .floating-settings-button { display: none !important; }

  .cv-dynamic-wrapper {
    background: #ffffff !important;
    color: #0a0a0a !important;
    padding: 0 !important;
    min-height: 0 !important;
    display: block !important;
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
  }
  .cv-container {
    width: 688px !important;
    max-width: 688px !important;
    margin: 0 auto !important;
    padding: 0 40px 40px !important;
    background: #ffffff !important;
    color: #0a0a0a !important;
    box-shadow: none !important;
    counter-reset: cvsec !important;
    position: relative !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .cv-container * {
    text-shadow: none !important;
    box-shadow: none !important;
    background-image: none !important;
    -webkit-background-clip: border-box !important;
    background-clip: border-box !important;
    -webkit-text-fill-color: currentColor !important;
  }
  /* Banda magenta editorial: edge-to-edge dentro del contenedor.
     overflow:hidden del container clipa lo que sobre -> sin desbordes a html2canvas. */
  .cv-container::before {
    content: '' !important;
    display: block !important;
    position: relative !important;
    left: -40px !important;
    width: calc(100% + 80px) !important;
    height: 10px !important;
    background: #be185d !important;
    margin: 0 0 24px !important;
  }

  /* Header: nombre grande a izquierda, foto cuadrada a derecha */
  .cv-header {
    text-align: left !important;
    display: grid !important;
    grid-template-columns: 1fr 90px !important;
    grid-template-rows: auto auto !important;
    column-gap: 20px !important;
    row-gap: 4px !important;
    align-items: end !important;
    padding: 0 0 16px !important;
    margin: 0 0 8px !important;
    border-bottom: 3px solid #0a0a0a !important;
  }
  .cv-avatar-frame {
    width: 90px !important;
    height: 90px !important;
    border-radius: 2px !important;
    border: 2px solid #0a0a0a !important;
    background: transparent !important;
    margin: 0 !important;
    overflow: hidden !important;
    grid-column: 2 !important;
    grid-row: 1 / span 2 !important;
    align-self: end !important;
  }
  .cv-avatar-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
    filter: grayscale(0.7) contrast(1.1) !important;
  }
  .cv-avatar-placeholder { font-size: 44px !important; color: #0a0a0a !important; }

  .cv-name {
    color: #0a0a0a !important;
    font-size: 42px !important;
    font-weight: 900 !important;
    letter-spacing: -1.2px !important;
    text-transform: uppercase !important;
    margin: 0 !important;
    line-height: 1 !important;
    grid-column: 1 !important;
    grid-row: 1 !important;
    word-break: break-word !important;
  }
  .cv-tagline {
    color: #525252 !important;
    font-size: 14px !important;
    letter-spacing: 0.3px !important;
    font-weight: 400 !important;
    font-style: italic !important;
    margin: 0 !important;
    grid-column: 1 !important;
    grid-row: 2 !important;
  }

  /* Secciones numeradas estilo revista: Nº 01, Nº 02... */
  .cv-section {
    counter-increment: cvsec !important;
    padding: 22px 0 6px !important;
    border-bottom: none !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .cv-section-title {
    color: #0a0a0a !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 4px !important;
    margin: 0 0 14px !important;
    display: flex !important;
    align-items: baseline !important;
    gap: 14px !important;
    padding-bottom: 8px !important;
    border-bottom: 1px solid #d4d4d8 !important;
  }
  .cv-section-title::before {
    content: 'Nº ' counter(cvsec, decimal-leading-zero) !important;
    color: #be185d !important;
    font-weight: 900 !important;
    font-size: 20px !important;
    letter-spacing: -0.5px !important;
    font-style: italic !important;
  }
  .cv-section-title::after {
    content: '' !important;
    display: none !important;
  }

  .cv-about-text {
    color: #1f1f1f !important;
    font-size: 14px !important;
    line-height: 1.75 !important;
    margin: 0 !important;
    font-weight: 400 !important;
  }

  /* Skills como sentencia inline separada por punto magenta */
  .cv-skills-grid {
    display: block !important;
    line-height: 1.9 !important;
  }
  .cv-skill-badge {
    display: inline !important;
    background: transparent !important;
    border: none !important;
    color: #0a0a0a !important;
    padding: 0 !important;
    border-radius: 0 !important;
    font-size: 13px !important;
    letter-spacing: 0.2px !important;
    font-weight: 700 !important;
  }
  .cv-skill-badge:not(:last-child)::after {
    content: '  ·  ' !important;
    color: #be185d !important;
    font-weight: 900 !important;
  }

  /* Cards de experiencia: empresa MAYUSCULAS bold, meta small-caps */
  .cv-experience-card {
    border-left: none !important;
    padding: 0 !important;
    margin-bottom: 18px !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .cv-experience-card:last-child { margin-bottom: 0 !important; }
  .cv-experience-card strong {
    display: block !important;
    color: #0a0a0a !important;
    font-size: 16px !important;
    font-weight: 800 !important;
    margin-bottom: 2px !important;
    letter-spacing: -0.2px !important;
    text-transform: uppercase !important;
  }
  .cv-experience-card .cv-meta {
    color: #525252 !important;
    font-size: 11px !important;
    font-style: normal !important;
    margin: 0 0 6px !important;
    letter-spacing: 1px !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
  }
  .cv-experience-card p {
    color: #1f1f1f !important;
    font-size: 13px !important;
    line-height: 1.65 !important;
    margin: 4px 0 0 !important;
    font-weight: 400 !important;
  }

  .cv-contact-grid {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 8px 22px !important;
    margin-top: 4px !important;
  }
  .cv-contact-grid a, .cv-project-link {
    color: #0a0a0a !important;
    text-decoration: underline !important;
    text-decoration-color: #be185d !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px !important;
    font-size: 13px !important;
    letter-spacing: 0 !important;
    font-weight: 600 !important;
  }
`;

export const TEMPLATES = [
  {
    id: 'classic',
    swatch: '#111111',
    swatchAccent: '#888888',
    css: CLASSIC_CSS
  },
  {
    id: 'blue',
    swatch: '#1e3a8a',
    swatchAccent: '#93c5fd',
    css: BLUE_CSS
  },
  {
    id: 'cyber',
    swatch: '#0a0a0a',
    swatchAccent: '#10b981',
    css: CYBER_CSS
  },
  {
    id: 'editorial',
    swatch: '#0a0a0a',
    swatchAccent: '#be185d',
    css: EDITORIAL_CSS
  }
];

export const DEFAULT_TEMPLATE_ID = 'classic';

export function getTemplate(id) {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}
