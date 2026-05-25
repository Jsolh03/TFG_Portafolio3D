import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { API_BASE } from '../../config';

/* ────────────────────────────────────────────────────────────
   IDE_DEV.app — Editor + Agente IA simulado
   Demo del workflow real de Khaled con agentes (Claude Code, etc.).
   Toda la "IA" es scripted (sin API) pero imita tool-use, streaming
   y diff como un agente real.
──────────────────────────────────────────────────────────── */

const FILES = {
  'NexusAPI.java': {
    name: 'NexusAPI.java',
    language: 'java',
    icon: '☕',
    value: `// Sistema DB Hospital — José Germain
package com.nexus.hospital;

import java.sql.*;
import java.util.Optional;

public class NexusAPI {
  private final Connection conn;

  public NexusAPI(String url, String user, String pw) {
    this.conn = DriverManager.getConnection(url, user, pw);
  }

  public Optional<Patient> findById(long id) {
    var sql = "SELECT * FROM patients WHERE id = ?";
    try (var stmt = conn.prepareStatement(sql)) {
      stmt.setLong(1, id);
      var rs = stmt.executeQuery();
      return rs.next() ? Optional.of(Patient.from(rs)) : Optional.empty();
    } catch (SQLException e) {
      throw new DataAccessException("Lookup failed", e);
    }
  }
}`,
    explain: 'NexusAPI.java es la fachada de acceso a datos del sistema del hospital José Germain. Usa el patrón Repository sobre JDBC nativo (sin ORM por requisito de auditoría). Cada método cierra recursos con try-with-resources y envuelve SQLException en una excepción de dominio para no filtrar detalles de la capa de persistencia.',
    bug: 'Posible vulnerabilidad: `DriverManager.getConnection` puede devolver null en algunos drivers exóticos. Recomendación: añadir `Objects.requireNonNull(conn)` tras la asignación o migrar a HikariCP que garantiza no-null.',
    refactor: {
      before: 'public NexusAPI(String url, String user, String pw) {\n    this.conn = DriverManager.getConnection(url, user, pw);\n  }',
      after:  'public NexusAPI(DataSource ds) {\n    this.conn = Objects.requireNonNull(ds.getConnection(), "connection");\n  }'
    },
    tests: `@Test
void findById_returnsEmpty_whenNoMatch() throws Exception {
  try (var ds = TestDb.embedded()) {
    var api = new NexusAPI(ds);
    assertTrue(api.findById(999L).isEmpty());
  }
}

@Test
void findById_throws_whenSqlFails() throws Exception {
  var brokenDs = mock(DataSource.class);
  when(brokenDs.getConnection()).thenThrow(new SQLException("down"));
  assertThrows(DataAccessException.class,
    () -> new NexusAPI(brokenDs).findById(1L));
}`
  },

  'PromptEngine.py': {
    name: 'PromptEngine.py',
    language: 'python',
    icon: '🐍',
    value: `"""
Prompt orchestrator — selects the right system prompt
based on repo context. Used in CLI agents.
"""
from pathlib import Path
from typing import Literal

Mode = Literal["refactor", "debug", "explain", "test"]

class PromptEngine:
    def __init__(self, repo: Path):
        self.repo = repo
        self.stack = self._detect_stack()

    def _detect_stack(self) -> list[str]:
        signals = {
            "package.json": "node",
            "pom.xml": "java",
            "requirements.txt": "python",
            "Cargo.toml": "rust"
        }
        return [tag for f, tag in signals.items() if (self.repo / f).exists()]

    def build(self, mode: Mode, focus: str) -> str:
        ctx = ", ".join(self.stack) or "polyglot"
        return f"You are operating on a {ctx} repo. Mode: {mode}. Focus: {focus}."`,
    explain: 'PromptEngine.py construye system-prompts dinámicos para agentes IA. Detecta el stack del repo abriendo solo metadatos (package.json, pom.xml…) y compone el prompt según el modo de operación. La idea: el mismo agente sirve para refactor, debug, explicar o testear, cambiando solo el contexto inyectado.',
    bug: 'En `_detect_stack` la lectura es síncrona y bloqueante. Si el repo está en red lenta puede congelar. Mejor: cachear el resultado o usar `asyncio.to_thread`. Tampoco maneja monorepos (varios `package.json` anidados).',
    refactor: {
      before: 'def build(self, mode: Mode, focus: str) -> str:\n    ctx = ", ".join(self.stack) or "polyglot"\n    return f"You are operating on a {ctx} repo. Mode: {mode}. Focus: {focus}."',
      after:  'def build(self, mode: Mode, focus: str) -> str:\n    ctx = ", ".join(self.stack) or "polyglot"\n    template = self._template_for(mode)\n    return template.format(ctx=ctx, focus=focus)'
    },
    tests: `def test_detects_node_repo(tmp_path):
    (tmp_path / "package.json").write_text("{}")
    assert "node" in PromptEngine(tmp_path)._detect_stack()

def test_build_returns_focused_prompt(tmp_path):
    eng = PromptEngine(tmp_path)
    prompt = eng.build("debug", "memory leak")
    assert "debug" in prompt and "memory leak" in prompt`
  },

  'App.jsx': {
    name: 'App.jsx',
    language: 'javascript',
    icon: '⚛',
    value: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Landing from './pages/Landing';
import DevPortal from './pages/DevPortal';
import DynamicCVPage from './pages/DynamicCVPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dev" element={<DevPortal />} />
            <Route path="/cv/:userId" element={<DynamicCVPage />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}`,
    explain: 'App.jsx es el root de este portfolio. Anida dos providers (tema y lenguaje) sobre el router. Decisión arquitectónica: providers fuera del router, así el cambio de tema/idioma persiste entre páginas sin recargas. Tres rutas: landing público, portal de dev (protegido por clave) y vista de CV pública por slug.',
    bug: 'No hay un fallback (`<Route path="*">`) para rutas inexistentes. Un visitante que tipee mal una URL ve pantalla en blanco. Añadir `<Route path="*" element={<NotFound />}>` o redirigir a `/`.',
    refactor: {
      before: '<Routes>\n  <Route path="/" element={<Landing />} />\n  ...\n</Routes>',
      after:  '<Routes>\n  <Route path="/" element={<Landing />} />\n  <Route path="/dev" element={<DevPortal />} />\n  <Route path="/cv/:userId" element={<DynamicCVPage />} />\n  <Route path="*" element={<Navigate to="/" replace />} />\n</Routes>'
    },
    tests: `import { render, screen } from '@testing-library/react';

test('app monta Landing en /', () => {
  window.history.pushState({}, '', '/');
  render(<App />);
  expect(screen.getByText(/portfolio/i)).toBeInTheDocument();
});`
  }
};

FILES['DSAnexus.md'] = {
  name: 'DSAnexus.md',
  language: 'markdown',
  icon: '🏢',
  value: `# DSAnexus — Aceleración tecnológica corporativa

[DSAnexus](https://www.dsanexus.com/) es una empresa corporativa
especializada en la **actualización tecnológica de organizaciones**.
Acompañan a empresas y administraciones en transiciones de
plataformas, modernización de infraestructura y adopción de
nuevas herramientas.

## Mi colaboración

Como técnico colaboro en proyectos de migración, soporte y
modernización trabajando con clientes finales en entornos
de producción reales — el tipo de escenarios donde no hay
margen para improvisar.

## Lo que aporta a mi perfil

- Diagnóstico rápido en entornos heterogéneos (Windows
  Server, redes corporativas, Active Directory, intranets).
- Disciplina operativa: pruebas previas, ventanas de cambio
  acordadas, plan de rollback documentado.
- Comunicación con stakeholders no-técnicos: explicar el
  riesgo y el plan sin jerga.
- Documentación clara para handover entre técnicos.

## Por qué importa para este portfolio

DSAnexus es donde aprendo a pensar como un **proveedor de
servicios profesional**, no solo como un desarrollador.
Las migraciones y los SLA enseñan cosas que un curso no:
qué hacer cuando el sistema cae a las 3 AM, cómo priorizar
incidentes y cómo escribir un postmortem que no sea ficción.

Más info: https://www.dsanexus.com/`,
  explain: 'DSAnexus es una empresa corporativa que ayuda a otras organizaciones a modernizar su stack tecnológico. Khaled colabora con ellos como técnico en proyectos reales de migración, soporte y actualización de infraestructura. La experiencia aporta al perfil disciplina operativa, gestión de incidentes y comunicación con clientes no-técnicos.',
  bug: 'No hay bug aquí — es información biográfica. Si acaso, el riesgo es que el portfolio mencione una empresa real sin pedir permiso; este texto es deliberadamente descriptivo y no comparte detalles internos protegidos.',
  refactor: {
    before: '## Mi colaboración\\nComo técnico colaboro en proyectos…',
    after:  '## Mi colaboración\\n> Técnico de sistemas — proyectos reales de migración, soporte y modernización.'
  },
  tests: `# No aplica: documento informativo
# Pero validamos que el enlace funciona:
$ curl -I https://www.dsanexus.com/
HTTP/2 200`
};

FILES['HospitalJoseGermain.md'] = {
  name: 'HospitalJoseGermain.md',
  language: 'markdown',
  icon: '🏥',
  value: `# Hospital Universitario José Germain — Técnico en Sistemas

Estancia profesional como **Técnico en Sistemas** en el
Hospital Universitario José Germain, institución pública
de referencia en salud mental en la Comunidad de Madrid.

## Responsabilidades reales

### Migración Windows 10 → Windows 11
Planificación e implementación del proceso de actualización
de los equipos clínicos y administrativos del hospital,
garantizando compatibilidad con el software hospitalario
crítico (historia clínica electrónica, sistemas de cita,
periféricos médicos).

### Mantenimiento de la intranet hospitalaria
Gestión del contenido y la disponibilidad del portal interno
que usa el personal sanitario para acceder a protocolos,
documentación y herramientas internas.

### Web pública del hospital
Soporte y actualizaciones menores de la web oficial:
publicación de avisos, ajustes de contenido, depuración
de fallos puntuales.

### Soporte HW/SW
Diagnóstico y reparación de incidencias en los ordenadores
de las distintas unidades:
- Perfiles de Windows corruptos.
- Conectividad de red y Wi-Fi.
- Drivers de periféricos hospitalarios.
- Reemplazo de hardware (memoria, almacenamiento, fuentes).
- Limpieza de software no autorizado.

## Lo que me llevo de aquí

Trabajar en un hospital me enseñó algo que no aparece
en ningún curso: **el sistema no puede caer porque detrás
hay pacientes esperando**.

- Cada cambio se valida antes de tocarlo.
- Cada migración tiene plan B documentado.
- La comunicación con usuarios no-técnicos importa tanto
  como la solución técnica.
- Las prisas son tu enemigo. La calma resuelve más casos
  que la urgencia.

Es un entorno que enseña a tomarse en serio la palabra
"producción". Y eso se nota en cómo trabajo después.`,
  explain: 'Este fichero describe el rol técnico de Khaled en el Hospital José Germain: migraciones masivas W10→W11, mantenimiento de intranet y web pública, y soporte de incidencias HW/SW. Es un proyecto profesional real, no un proyecto académico, que aporta perspectiva de "producción de verdad" al perfil.',
  bug: 'Información sensible a evitar: nombres de pacientes, rutas de servidores internos, contraseñas, IPs internas. Este texto está deliberadamente redactado a alto nivel para no exponer nada de eso.',
  refactor: {
    before: '## Responsabilidades reales\\n### Migración Windows 10 → Windows 11\\n…',
    after:  '## Responsabilidades\\n- Migración W10→W11 de la flota clínica\\n- Mantenimiento intranet + web pública\\n- Soporte HW/SW de incidencias diarias'
  },
  tests: `# No aplica: documento informativo
# Validación: el hospital sigue funcionando ✓`
};

FILES['VibeCoding.md'] = {
  name: 'VibeCoding.md',
  language: 'markdown',
  icon: '🤖',
  value: `# Vibe Coding — Trabajo mano a mano con IA

Este portfolio no es solo un proyecto de fin de grado.
Es la demostración práctica de mi forma de trabajar:
**vibe coding** — colaboración constante con agentes
de IA para construir más rápido sin perder rigor.

## Herramientas que uso a diario

- **Claude Code** — agente principal en CLI / VS Code,
  para refactor, debug, arquitectura, navegación de repos
  grandes y operaciones git complejas.
- **GitHub Copilot** — autocompletado contextual línea
  a línea.
- **Cursor** — sesiones de pair programming visual cuando
  necesito un canvas más libre.
- **MCP servers** custom — extensiones propias que conectan
  el agente con Mongo, Spline u otras herramientas
  específicas del proyecto.
- **Prompts custom** por contexto — un system prompt
  distinto por proyecto, no uno universal.

## Mi flujo de trabajo con agentes

1. **Yo defino** el objetivo y los límites (qué tocar,
   qué no, qué riesgo asumimos).
2. **El agente propone** el plan ANTES de tocar código.
   Yo apruebo.
3. **Implementamos** en cambios pequeños y atómicos,
   un fichero a la vez.
4. **Validación automática** — tests + build antes de
   devolver control.
5. **Yo reviso**, yo decido qué entra en la rama.
   El \`git diff\` no miente.

## Reglas de oro

- Si el agente propone borrar algo, primero clasificarlo:
  ¿es código muerto al 100%? ¿requiere validación manual?
- Ningún cambio masivo sin plan documentado.
- Hooks pre-commit son sagrados — el agente NUNCA los
  salta.
- Backups antes de operaciones destructivas.
- Si algo huele raro: \`git status\` y \`git diff\` siempre
  cuentan la verdad.

## Por qué importa

La IA no me reemplaza, **me amplifica**. Sé qué quiero,
sé qué no debería hacer, y sé revisar lo que produce
el agente.

Eso es lo que aporto: **criterio**.

Una IA sin criterio del humano que la dirige produce
código rápido y roto. Con criterio, produce ingeniería
de verdad — más rápido y con menos errores que
trabajando solo.`,
  explain: 'VibeCoding.md describe el flujo de trabajo de Khaled con agentes IA. La tesis: la IA amplifica al desarrollador con criterio; no lo reemplaza. Detalla herramientas (Claude Code, Copilot, MCP servers, prompts custom), el flujo en 5 pasos (objetivo → plan → implementación atómica → validación → review humana) y las reglas de oro que evitan los fallos típicos de los LLMs.',
  bug: 'Riesgo del enfoque: depender demasiado del agente y perder criterio propio. Mitigación: nunca aceptar cambios sin entenderlos. Si no podrías escribirlo a mano, no deberías mergearlo.',
  refactor: {
    before: '## Mi flujo de trabajo con agentes\\n1. Yo defino el objetivo…\\n2. El agente propone…',
    after:  '## Flujo\\nObjetivo → Plan → Implementación atómica → Validación → Review humana'
  },
  tests: `# Cómo "testeo" un workflow con agentes:
$ git diff   # qué cambió de verdad
$ npm test   # nada se rompió
$ npm run build # produce artefacto válido
# Si los 3 pasan, el cambio entra.`
};

const FILE_ORDER = ['NexusAPI.java', 'PromptEngine.py', 'App.jsx', 'DSAnexus.md', 'HospitalJoseGermain.md', 'VibeCoding.md'];

/* ──────────────── Soporte para ficheros temporales ────────────────
   El usuario puede crear ficheros nuevos en memoria. Se pierden al
   cerrar el IDE. No se guardan en localStorage ni en el servidor.
─────────────────────────────────────────────────────────────────── */

const EXT_TO_LANGUAGE = {
  js: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python', java: 'java',
  md: 'markdown', txt: 'plaintext',
  json: 'json', yaml: 'yaml', yml: 'yaml',
  css: 'css', html: 'html', sh: 'shell', sql: 'sql'
};

const ICON_FOR_LANGUAGE = {
  javascript: '⚡', typescript: '🟦', python: '🐍', java: '☕',
  markdown: '📝', plaintext: '📄', json: '🔧', yaml: '📋',
  css: '🎨', html: '🌐', shell: '⌨', sql: '🗄'
};

// Validación de nombre de fichero: letras/números/guiones/punto, con extensión válida.
const FILENAME_RE = /^[A-Za-z0-9_\-]{1,40}\.[A-Za-z0-9]{1,6}$/;
const MAX_CUSTOM_FILES = 12;

const detectLanguage = (filename) => {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  return EXT_TO_LANGUAGE[ext] || 'plaintext';
};

const validateFilename = (name, existingFiles) => {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Nombre vacío';
  if (!FILENAME_RE.test(trimmed)) return 'Solo letras, números, guiones y una extensión (p.ej. nota.md)';
  const ext = trimmed.split('.').pop().toLowerCase();
  if (!EXT_TO_LANGUAGE[ext]) return `Extensión .${ext} no soportada`;
  if (existingFiles.includes(trimmed)) return 'Ya existe un fichero con ese nombre';
  return null;
};

/* ──────────────── Escenarios del agente ──────────────── */

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const SCENARIOS = {
  stack: () => [
    { kind: 'thinking', text: 'Analizando tu pregunta…', wait: 500 },
    { kind: 'tool', tool: 'Read', input: '~/.config/khaled/stack.json', output: 'OK · 6 herramientas', wait: 600 },
    { kind: 'message', text: 'Mi stack diario para desarrollo con agentes IA:' },
    { kind: 'code', lang: 'markdown', text:
`### Daily AI dev stack
- **Claude Code** (CLI / VS Code) — agente principal para refactor, debug y boilerplate
- **GitHub Copilot** — autocompletado inline
- **Cursor** — sesiones de pair programming visuales
- **Prompt Engineering propio** — system prompts custom por repo
- **Pre-commit hooks** — el agente NUNCA puede saltarse linter/tests
- **MCP servers** — extender al agente con tools propias (Mongo, Spline, etc.)` },
    { kind: 'message', text: 'La clave no es la herramienta, es **qué le pides** y **cómo verificas** lo que devuelve.' }
  ],

  workflow: () => [
    { kind: 'thinking', text: 'Cargando workflow…', wait: 500 },
    { kind: 'message', text: 'Mi workflow con un agente IA sigue 4 fases estrictas:' },
    { kind: 'code', lang: 'text', text:
`1. ANÁLISIS        El agente lee solo lo necesario, no todo el repo
2. PLAN            Presenta cambios ANTES de tocar nada (yo apruebo)
3. EJECUCIÓN       Cambios pequeños y atómicos, un fichero a la vez
4. VERIFICACIÓN    Tests + build automáticos antes de devolver control` },
    { kind: 'message', text: 'Esto elimina los dos mayores fallos de los LLMs: **alucinaciones** y **cambios masivos sin revisar**.' },
    { kind: 'message', text: 'Y siempre uso `git status` antes y después. Si algo huele raro, `git diff` te lo dice.' }
  ],

  explain: (file) => file.explain ? [
    { kind: 'thinking', text: `Leyendo ${file.name}…`, wait: 500 },
    { kind: 'tool', tool: 'Read', input: file.name, output: `${file.value.split('\n').length} líneas`, wait: 700 },
    { kind: 'message', text: file.explain }
  ] : [
    { kind: 'thinking', text: `Leyendo ${file.name}…`, wait: 400 },
    { kind: 'message', text: `Este fichero (${file.name}) es nuevo y no tiene análisis preparado. K-Bot solo puede explicar los ficheros curados del portfolio.` }
  ],

  refactor: (file) => file.refactor ? [
    { kind: 'thinking', text: `Analizando ${file.name}…`, wait: 600 },
    { kind: 'tool', tool: 'Grep', input: 'TODO|FIXME', output: 'sin matches', wait: 500 },
    { kind: 'tool', tool: 'Analyze', input: file.name, output: 'patrón mejorable encontrado', wait: 800 },
    { kind: 'message', text: 'Te propongo este cambio. Mejora testabilidad y elimina acoplamiento con `DriverManager` (en el caso Java) o con el patrón monolítico (en el resto):' },
    { kind: 'diff', before: file.refactor.before, after: file.refactor.after, lang: file.language },
    { kind: 'message', text: 'En modo real, escribiría el `Edit` y haría `npm test` / `mvn test` para verificar. En este demo solo es preview.' }
  ] : [
    { kind: 'thinking', text: `Analizando ${file.name}…`, wait: 400 },
    { kind: 'message', text: `No tengo una propuesta de refactor preparada para ${file.name}. Solo los ficheros curados del portfolio tienen análisis.` }
  ],

  bug: (file) => file.bug ? [
    { kind: 'thinking', text: `Buscando issues en ${file.name}…`, wait: 700 },
    { kind: 'tool', tool: 'Analyze', input: file.name, output: '1 issue encontrado', wait: 900 },
    { kind: 'message', text: `🐛 **Hallazgo:** ${file.bug}` }
  ] : [
    { kind: 'thinking', text: `Buscando issues en ${file.name}…`, wait: 400 },
    { kind: 'tool', tool: 'Analyze', input: file.name, output: 'sin análisis', wait: 500 },
    { kind: 'message', text: `K-Bot solo busca bugs en los ficheros curados. ${file.name} es un fichero nuevo sin análisis preparado.` }
  ],

  tests: (file) => file.tests ? [
    { kind: 'thinking', text: 'Generando suite de tests…', wait: 600 },
    { kind: 'tool', tool: 'Write', input: file.name.replace(/\.\w+$/, '.test' + file.name.match(/\.\w+$/)[0]), wait: 700 },
    { kind: 'message', text: `Borrador de tests para ${file.name}:` },
    { kind: 'code', lang: file.language, text: file.tests }
  ] : [
    { kind: 'thinking', text: 'Generando suite de tests…', wait: 400 },
    { kind: 'message', text: `Para los ficheros nuevos no genero tests automáticos en esta demo. Pásate por los ficheros curados (NexusAPI, PromptEngine, App.jsx).` }
  ],

  about: () => [
    { kind: 'thinking', text: 'Cargando perfil…', wait: 400 },
    { kind: 'tool', tool: 'Read', input: '/cv/khaled', wait: 600 },
    { kind: 'message', text: 'Soy **K-Bot**, el asistente integrado en este portfolio.' },
    { kind: 'message', text: 'Khaled Solh El Hajji — Full-Stack Developer con foco en integración de IA. Le interesa especialmente:' },
    { kind: 'code', lang: 'yaml', text:
`focus:
  - Prompt engineering (system prompts, tool use)
  - Agentes que ejecutan tareas reales (no chatbots)
  - Pipelines CI/CD asistidos por IA
stack:
  backend:  [Java, Spring Boot, Python, Node.js]
  frontend: [React, Three.js, Spline, CSS3]
  data:     [MongoDB, SQL Server, Vector DBs]
  agents:   [Claude Code, MCP servers, custom system prompts]
languages: [ES, EN, ZH, DE]` },
    { kind: 'message', text: 'Para hablar con Khaled en otro contexto, escríbele un correo desde la app **Mail.exe** o entra a su CV.' }
  ],

  capabilities: () => [
    { kind: 'thinking', text: 'Listando capacidades…', wait: 400 },
    { kind: 'message', text: 'En esta demo offline puedo:' },
    { kind: 'code', lang: 'text', text:
`/stack       muestra el stack diario de Khaled
/workflow    explica cómo trabaja con agentes
/explica     analiza el fichero abierto
/refactor    propone una mejora del fichero abierto
/bug         busca un issue en el fichero abierto
/tests       genera tests para el fichero abierto
/sobre       qué hago y quién es Khaled
/help        esta lista

También respondo a saludos básicos:
hola · qué tal · cómo estás · quién eres · gracias · adiós` },
    { kind: 'message', text: 'Recuerda: soy un **agente local por script** (keyword matching), no un LLM. Si escribes algo que no reconozco, te lo diré honestamente.' }
  ],

  greeting: () => [
    { kind: 'thinking', text: 'Saludando…', wait: 300 },
    { kind: 'message', text: '¡Hola! 👋 Soy **K-Bot**, el agente integrado en este IDE.' },
    { kind: 'message', text: 'Puedes preguntarme por el fichero abierto (`/explica`, `/refactor`, `/bug`, `/tests`) o por Khaled (`/sobre`, `/stack`, `/workflow`). Escribe `/help` para verlo todo.' }
  ],

  howAreYou: () => [
    { kind: 'thinking', text: 'Comprobando estado…', wait: 350 },
    { kind: 'tool', tool: 'Read', input: '/proc/kbot/status', output: 'online · 0 errors · 100% scripted', wait: 500 },
    { kind: 'message', text: 'Como agente local: **operativo y sin latencia de red** 🙂. Soy determinista, así que siempre estoy igual de bien.' },
    { kind: 'message', text: '¿En qué te ayudo? Prueba `/help` para ver lo que puedo hacer.' }
  ],

  whoAreYou: () => [
    { kind: 'thinking', text: 'Auto-presentación…', wait: 300 },
    { kind: 'message', text: 'Soy **K-Bot v1.0**, un agente *simulado* creado por Khaled para este portfolio.' },
    { kind: 'code', lang: 'yaml', text:
`name:        K-Bot
type:        agente local (script en JS)
runtime:     navegador del usuario
inteligencia: keyword matching + escenarios pre-programados
NO soy:      un LLM (no llamo a ninguna API ni hago inferencia)
propósito:   demostrar el workflow de Khaled con agentes IA reales` },
    { kind: 'message', text: 'Para hablar con Khaled de verdad, usa **Mail.exe** desde el escritorio.' }
  ],

  thanks: () => [
    { kind: 'message', text: '¡De nada! 🙌 Si necesitas algo más sobre el código abierto o sobre Khaled, aquí estoy.' }
  ],

  bye: () => [
    { kind: 'message', text: '¡Hasta luego! 👋 Cierra la ventana cuando quieras — yo solo vivo en esta pestaña.' }
  ],

  default: () => [
    { kind: 'thinking', text: 'Buscando coincidencias…', wait: 500 },
    { kind: 'tool', tool: 'Grep', input: 'keyword match', output: 'sin matches', wait: 500 },
    { kind: 'message', text: 'No he reconocido tu mensaje 🤔. Y aquí va la verdad técnica:' },
    { kind: 'message', text: 'Soy un **agente local creado mediante script** usando una arquitectura de sistemas básica (pattern matching con expresiones regulares sobre escenarios pre-programados). **No funciono como una IA real** — no hay un LLM detrás, no genero respuestas dinámicas, no tengo árbol de decisión semántico.' },
    { kind: 'message', text: 'Lo que sí entiendo: `stack`, `workflow`, `explica`, `refactor`, `bug`, `tests`, `sobre`, `hola`, `qué tal`, `gracias`. Escribe `/help` para la lista completa.' }
  ]
};

const matchScenario = (input) => {
  const low = input.toLowerCase().trim();
  if (!low) return null;

  // Saludos / cierres / cortesía
  if (/^(hola|hi|hello|hey|buenas|buenos d[ií]as|buenas tardes|buenas noches|saludos|qu[eé] tal|qu[eé] pasa|qu[eé] hay)\b/.test(low)) return 'greeting';
  if (/(c[oó]mo (est[aá]s|andas|vas)|how are you|todo bien|qu[eé] tal est[aá]s)/.test(low)) return 'howAreYou';
  if (/(gracias|thanks|thx|thank you|ty\b|merci)/.test(low)) return 'thanks';
  if (/^(adi[oó]s|chao|chau|bye|hasta luego|nos vemos|hasta pronto|good ?bye)\b/.test(low)) return 'bye';
  if (/(qui[eé]n eres|qu[eé] eres|who are you|what are you|eres una ?ia|eres un ?bot|eres humano|eres real)/.test(low)) return 'whoAreYou';

  // Comandos / temas
  if (low === '/help' || /(help|ayuda|comandos|qu[eé] puedes hacer|qu[eé] sabes hacer)/.test(low)) return 'capabilities';
  if (/(stack|herramientas|tools|usas)/.test(low)) return 'stack';
  if (/(workflow|c[oó]mo trabajas|proceso)/.test(low)) return 'workflow';
  if (/(explica|explain|qu[eé] hace)/.test(low)) return 'explain';
  if (/(refactor|mejora)/.test(low)) return 'refactor';
  if (/(bug|error|fallo|problema|issue)/.test(low)) return 'bug';
  if (/(test|pruebas)/.test(low)) return 'tests';
  if (/^\/sobre\b|^\/about\b|\b(sobre|about|cu[eé]ntame (de|sobre)|h[aá]blame (de|sobre)|presenta) (ti|t[uú]|m[ií]|khaled|el (creador|developer|autor))\b|\b(qui[eé]n es khaled|who is khaled|presenta a khaled)\b/.test(low)) return 'about';

  return 'default';
};

const TOOL_ICONS = {
  Read:    '📖',
  Write:   '✏️',
  Edit:    '✂️',
  Grep:    '🔍',
  Bash:    '⌘',
  Analyze: '🧪'
};

/* ──────────────── Componente ──────────────── */

export default function IdeApp() {
  const [activeFile, setActiveFile] = useState('NexusAPI.java');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 'init-1', role: 'agent', kind: 'message', text: 'K-Bot listo. Soy un agente simulado que muestra cómo Khaled trabaja con IA en su día a día.', complete: true },
    { id: 'init-2', role: 'agent', kind: 'message', text: 'Prueba los botones de acción rápida o escríbeme. /help para la lista.', complete: true }
  ]);
  const [busy, setBusy] = useState(false);

  // Tool que espera argumento del usuario en el input del chat (Grep / Bash).
  const [pendingTool, setPendingTool] = useState(null);

  // Aviso de cuota mostrado solo una vez por sesión cuando supere el 15%.
  const [quotaWarned, setQuotaWarned] = useState(false);

  // Ficheros temporales creados por el usuario. Solo en memoria.
  const [customFiles, setCustomFiles] = useState({});
  const [creatingNew, setCreatingNew] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileError, setNewFileError] = useState('');

  const scrollRef = useRef(null);
  const msgIdRef = useRef(0);
  const newFileInputRef = useRef(null);

  const nextId = () => `m${++msgIdRef.current}`;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (creatingNew) newFileInputRef.current?.focus();
  }, [creatingNew]);

  const tabOrder = [...FILE_ORDER, ...Object.keys(customFiles)];
  const allFiles = { ...FILES, ...customFiles };
  const file = allFiles[activeFile] || FILES['NexusAPI.java'];
  const isCustomFile = activeFile in customFiles;

  const handleEditorChange = (value) => {
    if (!isCustomFile) return;
    setCustomFiles(prev => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], value: value ?? '' }
    }));
  };

  const startCreatingFile = () => {
    if (Object.keys(customFiles).length >= MAX_CUSTOM_FILES) {
      setNewFileError(`Máximo ${MAX_CUSTOM_FILES} ficheros temporales`);
      setCreatingNew(true);
      return;
    }
    setNewFileError('');
    setNewFileName('');
    setCreatingNew(true);
  };

  const confirmCreateFile = () => {
    const name = newFileName.trim();
    const err = validateFilename(name, tabOrder);
    if (err) {
      setNewFileError(err);
      return;
    }
    if (Object.keys(customFiles).length >= MAX_CUSTOM_FILES) {
      setNewFileError(`Máximo ${MAX_CUSTOM_FILES} ficheros temporales`);
      return;
    }
    const language = detectLanguage(name);
    setCustomFiles(prev => ({
      ...prev,
      [name]: { name, language, icon: ICON_FOR_LANGUAGE[language] || '📄', value: '' }
    }));
    setActiveFile(name);
    setCreatingNew(false);
    setNewFileName('');
    setNewFileError('');
  };

  const cancelCreateFile = () => {
    setCreatingNew(false);
    setNewFileName('');
    setNewFileError('');
  };

  const closeCustomFile = (name, e) => {
    e?.stopPropagation();
    setCustomFiles(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (activeFile === name) setActiveFile('NexusAPI.java');
  };

  const playScenario = async (scenarioKey, userText) => {
    if (busy) return;
    setBusy(true);

    if (userText) {
      setMessages(prev => [...prev, { id: nextId(), role: 'user', kind: 'message', text: userText, complete: true }]);
    }

    const steps = SCENARIOS[scenarioKey](file);

    for (const step of steps) {
      const id = nextId();
      if (step.kind === 'thinking') {
        setMessages(prev => [...prev, { id, role: 'agent', kind: 'thinking', text: step.text, complete: true }]);
        await sleep(step.wait || 500);
        setMessages(prev => prev.filter(m => m.id !== id));
      } else if (step.kind === 'tool') {
        setMessages(prev => [...prev, { id, role: 'agent', kind: 'tool', tool: step.tool, input: step.input, output: '…', complete: false }]);
        await sleep(step.wait || 600);
        setMessages(prev => prev.map(m => m.id === id ? { ...m, output: step.output || 'OK', complete: true } : m));
      } else if (step.kind === 'message') {
        setMessages(prev => [...prev, { id, role: 'agent', kind: 'message', text: '', complete: false }]);
        await streamText(id, step.text, 14);
      } else if (step.kind === 'code') {
        setMessages(prev => [...prev, { id, role: 'agent', kind: 'code', lang: step.lang, text: step.text, complete: true }]);
        await sleep(400);
      } else if (step.kind === 'diff') {
        setMessages(prev => [...prev, { id, role: 'agent', kind: 'diff', before: step.before, after: step.after, lang: step.lang, complete: true }]);
        await sleep(400);
      }
    }

    setBusy(false);
  };

  const streamText = async (id, text, msPerChar) => {
    for (let i = 1; i <= text.length; i++) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, text: text.slice(0, i) } : m));
      // eslint-disable-next-line no-await-in-loop
      await sleep(msPerChar);
    }
    setMessages(prev => prev.map(m => m.id === id ? { ...m, complete: true } : m));
  };

  const onSubmit = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    if (pendingTool) {
      const tool = pendingTool;
      setPendingTool(null);
      runPendingTool(tool, text);
      return;
    }
    const key = matchScenario(text);
    if (key === 'default') {
      askRemoteAgent(text);
    } else {
      playScenario(key, text);
    }
  };

  const askRemoteAgent = async (userText) => {
    if (busy) return;
    setBusy(true);

    // Pinta el mensaje del usuario y un toast "Agent" como tool en curso.
    setMessages(prev => [...prev, { id: nextId(), role: 'user', kind: 'message', text: userText, complete: true }]);
    const toolId = nextId();
    setMessages(prev => [...prev, { id: toolId, role: 'agent', kind: 'tool', tool: 'Analyze', input: 'remote-agent', output: '…', complete: false }]);

    let remoteText = null;
    let remoteQuota = null;
    try {
      const resp = await fetch(`${API_BASE}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText.slice(0, 500),
          context: `Fichero abierto: ${file.name} (${file.language})`
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (typeof data?.text === 'string' && data.text.trim().length > 0) {
          remoteText = data.text.trim();
          if (data.quota && typeof data.quota.limit === 'number') {
            remoteQuota = data.quota;
          }
        }
      }
    } catch {
      // Error de red: cae al fallback scripted abajo.
    }

    if (remoteText) {
      setMessages(prev => prev.map(m => m.id === toolId ? { ...m, output: 'OK', complete: true } : m));
      const id = nextId();
      setMessages(prev => [...prev, { id, role: 'agent', kind: 'message', text: '', complete: false }]);
      await streamText(id, remoteText, 12);

      // Aviso de cuota una sola vez por sesión cuando se haya consumido ≥ 15%.
      if (remoteQuota && !quotaWarned) {
        const usedPct = (remoteQuota.used / remoteQuota.limit) * 100;
        if (usedPct >= 15) {
          setMessages(prev => [...prev, {
            id: nextId(),
            role: 'agent',
            kind: 'message',
            text: `ℹ️ **Aviso de cuota:** has usado **${remoteQuota.used} de ${remoteQuota.limit}** consultas al agente IA disponibles esta hora. El servicio es gratuito y tiene un límite por IP. Cuando se agote, K-Bot volverá al modo *scripted* hasta que la ventana se reinicie.`,
            complete: true
          }]);
          setQuotaWarned(true);
        }
      }

      setBusy(false);
      return;
    }

    // Fallback: si la API no respondió, mostrar el mensaje canned de "no he reconocido".
    setMessages(prev => prev.map(m => m.id === toolId ? { ...m, output: 'offline', complete: true } : m));
    const steps = SCENARIOS.default();
    for (const step of steps) {
      const id = nextId();
      if (step.kind === 'thinking') {
        setMessages(prev => [...prev, { id, role: 'agent', kind: 'thinking', text: step.text, complete: true }]);
        await sleep(step.wait || 500);
        setMessages(prev => prev.filter(m => m.id !== id));
      } else if (step.kind === 'tool') {
        setMessages(prev => [...prev, { id, role: 'agent', kind: 'tool', tool: step.tool, input: step.input, output: '…', complete: false }]);
        await sleep(step.wait || 600);
        setMessages(prev => prev.map(m => m.id === id ? { ...m, output: step.output || 'OK', complete: true } : m));
      } else if (step.kind === 'message') {
        setMessages(prev => [...prev, { id, role: 'agent', kind: 'message', text: '', complete: false }]);
        await streamText(id, step.text, 12);
      }
    }
    setBusy(false);
  };

  const simulateBash = (cmd) => {
    const c = cmd.trim();
    if (c === 'ls' || c === 'ls -la') return { summary: 'OK', body: tabOrder.join('\n') };
    if (c.startsWith('cat ')) {
      const target = c.slice(4).trim();
      if (allFiles[target]) return { summary: 'OK', body: allFiles[target].value };
      return { summary: `cat: ${target}: No such file`, body: null };
    }
    if (c === 'pwd') return { summary: '/home/khaled/portfolio', body: null };
    if (c === 'whoami') return { summary: 'khaled', body: null };
    if (c === 'date') return { summary: new Date().toString(), body: null };
    if (c === 'clear') return { summary: 'usa el botón ↻ para reiniciar la conversación', body: null };
    if (c === 'help') return {
      summary: 'OK',
      body: 'Comandos disponibles:\n  ls            lista de ficheros del IDE\n  cat <file>    muestra el contenido\n  pwd           directorio actual\n  whoami        usuario\n  date          fecha actual\n  help          esta lista'
    };
    return { summary: `bash: ${c.split(' ')[0]}: command not found`, body: null };
  };

  const runPendingTool = async (tool, arg) => {
    setBusy(true);
    setMessages(prev => [...prev, { id: nextId(), role: 'user', kind: 'message', text: `${tool} "${arg}"`, complete: true }]);

    if (tool === 'grep') {
      let matches = [];
      try {
        const re = new RegExp(arg, 'i');
        matches = file.value.split('\n')
          .map((line, i) => ({ line, num: i + 1 }))
          .filter(({ line }) => re.test(line));
      } catch {
        const needle = arg.toLowerCase();
        matches = file.value.split('\n')
          .map((line, i) => ({ line, num: i + 1 }))
          .filter(({ line }) => line.toLowerCase().includes(needle));
      }
      const id = nextId();
      setMessages(prev => [...prev, { id, role: 'agent', kind: 'tool', tool: 'Grep', input: arg, output: '…', complete: false }]);
      await sleep(400);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, output: `${matches.length} match${matches.length === 1 ? '' : 'es'} en ${file.name}`, complete: true } : m));
      if (matches.length > 0) {
        const text = matches.slice(0, 30).map(m => `${String(m.num).padStart(4)}  ${m.line}`).join('\n');
        setMessages(prev => [...prev, { id: nextId(), role: 'agent', kind: 'code', lang: 'text', text, complete: true }]);
      }
    } else if (tool === 'bash') {
      const out = simulateBash(arg);
      const id = nextId();
      setMessages(prev => [...prev, { id, role: 'agent', kind: 'tool', tool: 'Bash', input: arg, output: '…', complete: false }]);
      await sleep(450);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, output: out.summary, complete: true } : m));
      if (out.body) {
        setMessages(prev => [...prev, { id: nextId(), role: 'agent', kind: 'code', lang: 'text', text: out.body, complete: true }]);
      }
    }

    setBusy(false);
  };

  const runReadTool = async () => {
    if (busy) return;
    setBusy(true);
    const id = nextId();
    setMessages(prev => [...prev, { id, role: 'agent', kind: 'tool', tool: 'Read', input: file.name, output: '…', complete: false }]);
    await sleep(400);
    const lines = file.value.split('\n').length;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, output: `${lines} líneas`, complete: true } : m));
    setMessages(prev => [...prev, { id: nextId(), role: 'agent', kind: 'code', lang: file.language, text: file.value, complete: true }]);
    setBusy(false);
  };

  const runTool = (toolName) => {
    if (busy) return;
    setPendingTool(null);
    if (toolName === 'Read') {
      runReadTool();
    } else if (toolName === 'Write') {
      startCreatingFile();
      setMessages(prev => [...prev, { id: nextId(), role: 'agent', kind: 'message', text: 'Crea el fichero arriba en la barra de tabs. Dale nombre con extensión válida (p.ej. `notas.md`) y pulsa Enter.', complete: true }]);
    } else if (toolName === 'Edit') {
      const msg = isCustomFile
        ? `${activeFile} está en modo escritura. Edítalo directamente en el editor.`
        : `${activeFile} es read-only (fichero curado del portfolio). Pulsa **+** arriba para crear un fichero editable.`;
      setMessages(prev => [...prev, { id: nextId(), role: 'agent', kind: 'message', text: msg, complete: true }]);
    } else if (toolName === 'Grep') {
      setPendingTool('grep');
    } else if (toolName === 'Bash') {
      setPendingTool('bash');
    } else if (toolName === 'Analyze') {
      playScenario('bug', '/analyze');
    }
  };

  const quick = (key, label) => () => playScenario(key, label);

  const clear = () => {
    if (busy) return;
    setMessages([{ id: nextId(), role: 'agent', kind: 'message', text: 'Conversación reiniciada.', complete: true }]);
  };

  return (
    <div className="ide-pro">

      {/* Banner de aviso para ficheros temporales */}
      <div className="ide-warning-banner" role="status">
        <span className="ide-warning-icon" aria-hidden="true">⚠️</span>
        <span>
          Los ficheros que crees aquí son <strong>temporales</strong>. Se pierden al cerrar el IDE o recargar la página. Nada se guarda en el servidor.
        </span>
      </div>

      {/* Tabs superior */}
      <div className="ide-tabs">
        {tabOrder.map(name => {
          const meta = allFiles[name];
          const isCustom = name in customFiles;
          return (
            <button
              key={name}
              className={`ide-tab ${activeFile === name ? 'active' : ''}${isCustom ? ' ide-tab--custom' : ''}`}
              onClick={() => setActiveFile(name)}
              title={isCustom ? `${name} (temporal)` : name}
            >
              <span className="ide-tab-icon">{meta.icon}</span>
              {name}
              {isCustom && (
                <span
                  className="ide-tab-close"
                  onClick={(e) => closeCustomFile(name, e)}
                  aria-label={`Cerrar ${name}`}
                  title="Cerrar"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}

        {creatingNew ? (
          <span className="ide-tab ide-tab--new-input">
            <input
              ref={newFileInputRef}
              type="text"
              value={newFileName}
              placeholder="nombre.md"
              onChange={e => { setNewFileName(e.target.value); setNewFileError(''); }}
              onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'Enter') { e.preventDefault(); confirmCreateFile(); }
                else if (e.key === 'Escape') { e.preventDefault(); cancelCreateFile(); }
              }}
              onBlur={() => { if (!newFileName.trim()) cancelCreateFile(); }}
              maxLength={48}
              aria-label="Nombre del nuevo fichero"
            />
            {newFileError && <span className="ide-tab-error" title={newFileError}>⚠</span>}
          </span>
        ) : (
          <button
            className="ide-tab ide-tab--add"
            onClick={startCreatingFile}
            title="Crear fichero temporal"
            aria-label="Crear fichero temporal"
            type="button"
          >
            +
          </button>
        )}
      </div>

      <div className="ide-main">

        {/* Editor */}
        <div className="ide-editor-wrap">
          <Editor
            height="100%"
            theme="vs-dark"
            language={file.language}
            value={file.value}
            onChange={isCustomFile ? handleEditorChange : undefined}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              readOnly: !isCustomFile,
              scrollBeyondLastLine: false,
              fontLigatures: true,
              lineNumbers: 'on'
            }}
          />
        </div>

        {/* AI Panel */}
        <aside className="ide-agent">
          <header className="ide-agent-head">
            <span className="ide-agent-dot" />
            <span className="ide-agent-title">K-BOT</span>
            <span className="ide-agent-sub">Coding Agent · v1.0</span>
            <span className="ide-agent-status">● online</span>
          </header>

          <div className="ide-agent-tools">
            <span className="ide-agent-tools-label">TOOLS</span>
            {Object.keys(TOOL_ICONS).map(t => (
              <button
                key={t}
                type="button"
                className="ide-tool-chip"
                title={`Ejecutar ${t}`}
                onClick={() => runTool(t)}
                disabled={busy}
              >
                <span className="ide-tool-chip-icon">{TOOL_ICONS[t]}</span>
                {t.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="ide-agent-chat" ref={scrollRef}>
            {messages.map(m => <Message key={m.id} m={m} />)}
            {busy && <div className="ide-typing"><span></span><span></span><span></span></div>}
          </div>

          <div className="ide-agent-quick">
            <button disabled={busy} onClick={quick('explain', '/explica')}>💡 Explica</button>
            <button disabled={busy} onClick={quick('refactor', '/refactor')}>🔧 Refactor</button>
            <button disabled={busy} onClick={quick('bug', '/bug')}>🐛 Bug</button>
            <button disabled={busy} onClick={quick('tests', '/tests')}>🧪 Tests</button>
            <button disabled={busy} onClick={quick('stack', '/stack')}>📚 Stack</button>
            <button disabled={busy} onClick={quick('workflow', '/workflow')}>⚙ Workflow</button>
            <button disabled={busy} onClick={quick('about', '/sobre Khaled')}>👤 Sobre</button>
            <button disabled={busy} onClick={clear} className="ide-clear-btn" title="Reiniciar">↻</button>
          </div>

          <form className={`ide-agent-input${pendingTool ? ' ide-agent-input--pending' : ''}`} onSubmit={onSubmit}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                busy
                  ? 'K-Bot está respondiendo…'
                  : pendingTool === 'grep'
                    ? `Patrón a buscar en ${file.name}…  (Esc para cancelar)`
                    : pendingTool === 'bash'
                      ? 'Comando bash…  (help · Esc para cancelar)'
                      : 'Pregunta a K-Bot…  (/help)'
              }
              disabled={busy}
              onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'Escape' && pendingTool) {
                  e.preventDefault();
                  setPendingTool(null);
                  setInput('');
                }
              }}
              onKeyUp={e => e.stopPropagation()}
            />
            <button type="submit" disabled={busy || !input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>
        </aside>
      </div>

      {/* Status bar */}
      <footer className="ide-status">
        <span className="ide-status-item">● {file.language.toUpperCase()}</span>
        <span className="ide-status-item">UTF-8</span>
        <span className="ide-status-item">{file.value.split('\n').length} lines</span>
        <span className="ide-status-spacer" />
        <span className="ide-status-item">K-Bot ready</span>
        <span className="ide-status-item ide-status-item--accent">khaled-os v1.0</span>
      </footer>
    </div>
  );
}

/* ──────────────── Sub-componentes ──────────────── */

function Message({ m }) {
  if (m.role === 'user') {
    return (
      <div className="ide-msg ide-msg-user">
        <div className="ide-msg-bubble">{m.text}</div>
      </div>
    );
  }
  if (m.kind === 'thinking') {
    return <div className="ide-msg ide-msg-thinking"><em>{m.text}</em></div>;
  }
  if (m.kind === 'tool') {
    return (
      <div className={`ide-msg ide-msg-tool ${m.complete ? '' : 'pending'}`}>
        <span className="ide-tool-name">{TOOL_ICONS[m.tool] || '🔧'} <strong>{m.tool}</strong></span>
        <code className="ide-tool-input">{m.input}</code>
        <span className="ide-tool-arrow">→</span>
        <span className="ide-tool-output">{m.output}</span>
      </div>
    );
  }
  if (m.kind === 'code') {
    return (
      <div className="ide-msg ide-msg-agent">
        <pre className="ide-codeblock"><code data-lang={m.lang}>{m.text}</code></pre>
      </div>
    );
  }
  if (m.kind === 'diff') {
    return (
      <div className="ide-msg ide-msg-agent">
        <div className="ide-diff">
          <div className="ide-diff-side ide-diff-before">
            <div className="ide-diff-head">− BEFORE</div>
            <pre><code>{m.before}</code></pre>
          </div>
          <div className="ide-diff-side ide-diff-after">
            <div className="ide-diff-head">+ AFTER</div>
            <pre><code>{m.after}</code></pre>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="ide-msg ide-msg-agent">
      <div className="ide-msg-bubble" dangerouslySetInnerHTML={{ __html: formatInline(m.text) }} />
    </div>
  );
}

function formatInline(text) {
  // muy ligero: bold con **x** y backticks
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
