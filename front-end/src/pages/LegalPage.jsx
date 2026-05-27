import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useT } from '../context/LanguageContext';
import FloatingSettingsButton from '../components/ui/FloatingSettingsButton';

/* LegalPage — documentos legales agrupados bajo /legal/:doc.
   Cumple RGPD art. 13-14, LSSI-CE arts. 9-10, EU AI Act art. 50.
   Las plantillas están en español por simplicidad (jurisdicción ES).
   El responsable del tratamiento es Khaled Solh El Hajji (autor del TFG),
   amparado por el IES Lope de Vega (Madrid) en el marco del proyecto
   académico Curso 2025/2026. */

const RESPONSIBLE = {
  authors: 'Khaled Solh El Hajji y Laura Jara Loro',
  institution: 'IES Lope de Vega (Madrid, España)',
  course: 'CFGS Desarrollo de Aplicaciones Multiplataforma (DAM), Curso 2025/2026',
  contact: 'cloudecode@dsanexus.com',
  app: 'K-ROOM & LAURA-ROOM — Portfolio 3D Interactivo',
  url: 'https://tfg-portafolio3-d.vercel.app'
};

function PrivacyPolicy() {
  return (
    <article className="legal-doc">
      <h1>Política de Privacidad</h1>
      <p className="legal-updated">Última actualización: 27 de mayo de 2026</p>

      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>
          El proyecto <strong>{RESPONSIBLE.app}</strong> es un Trabajo Fin de
          Grado desarrollado por <strong>{RESPONSIBLE.authors}</strong>,
          estudiantes del {RESPONSIBLE.course} en el {RESPONSIBLE.institution}.
        </p>
        <p>
          Contacto de protección de datos: <a href={`mailto:${RESPONSIBLE.contact}`}>{RESPONSIBLE.contact}</a>
        </p>
        <p>
          Esta aplicación tiene fines exclusivamente académicos y demostrativos.
          No se realiza tratamiento comercial de datos personales.
        </p>
      </section>

      <section>
        <h2>2. Datos que tratamos</h2>
        <ul>
          <li><strong>Datos de cuenta:</strong> nombre de usuario (id), nombre público, email, contraseña (almacenada con bcrypt).</li>
          <li><strong>Datos del CV:</strong> los que el usuario decida publicar voluntariamente (sobre mí, skills, experiencia, formación, proyectos, contacto, foto).</li>
          <li><strong>Datos de habitación temporal:</strong> los mismos, sin email/contraseña, durante 72 horas o 3 accesos.</li>
          <li><strong>Audit log de accesos al CV:</strong> email del visitante y marca temporal cada vez que alguien abre un CV ajeno (requisito de trazabilidad RGPD).</li>
          <li><strong>JWT de sesión:</strong> almacenado en <code>localStorage</code> del navegador, no se comparte con terceros.</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalidad del tratamiento</h2>
        <ul>
          <li>Permitir el alta y autenticación de cuentas.</li>
          <li>Mostrar el portfolio personal del usuario en formato 3D.</li>
          <li>Gestionar accesos controlados al CV mediante clave y consentimiento.</li>
          <li>Garantizar la seguridad de la plataforma (rate-limiting, audit logs).</li>
        </ul>
      </section>

      <section>
        <h2>4. Base legal</h2>
        <p>
          <strong>Consentimiento del interesado</strong> (RGPD art. 6.1.a).
          Marcar las casillas durante el registro implica el consentimiento
          informado para el tratamiento descrito.
        </p>
      </section>

      <section>
        <h2>5. Plazos de conservación</h2>
        <ul>
          <li><strong>Cuentas registradas:</strong> mientras la cuenta esté activa. El usuario puede solicitar su borrado en cualquier momento desde Ajustes → Mi cuenta.</li>
          <li><strong>Habitaciones temporales:</strong> 72 horas o 3 accesos.</li>
          <li><strong>Audit log de CV:</strong> <strong>90 días</strong>. Se eliminan automáticamente mediante TTL en MongoDB.</li>
          <li><strong>JWT:</strong> 8 horas (caduca automáticamente).</li>
        </ul>
      </section>

      <section>
        <h2>6. Encargados del tratamiento (procesadores)</h2>
        <ul>
          <li><strong>MongoDB Atlas</strong> (MongoDB Inc., EE.UU./UE) — base de datos. Datos cifrados en tránsito (TLS).</li>
          <li><strong>Brevo (Sendinblue SA)</strong> — envío de emails transaccionales de verificación. Servidores en la UE. <a href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noopener noreferrer">Política de Brevo</a>.</li>
          <li><strong>Hugging Face Inference (Hugging Face Inc.)</strong> — procesamiento de prompts del K-Bot. NO se almacenan los prompts del usuario.</li>
          <li><strong>Render</strong> (hosting backend) y <strong>Vercel</strong> (hosting frontend) — proveedores de infraestructura.</li>
        </ul>
      </section>

      <section>
        <h2>7. Tus derechos (RGPD)</h2>
        <ul>
          <li><strong>Acceso, rectificación y supresión:</strong> desde Ajustes → Mi cuenta.</li>
          <li><strong>Limitación, oposición y portabilidad:</strong> escríbenos a {RESPONSIBLE.contact}.</li>
          <li><strong>Reclamación ante la AEPD:</strong> <a href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">www.aepd.es</a></li>
        </ul>
      </section>

      <section>
        <h2>8. Menores</h2>
        <p>
          No se permite el registro a menores de 16 años (RGPD art. 8 y LOPDGDD art. 7).
          Durante el registro se solicita confirmación explícita.
        </p>
      </section>

      <section>
        <h2>9. Cookies y almacenamiento local</h2>
        <p>
          No usamos cookies de terceros ni de seguimiento. Usamos
          <code>localStorage</code> únicamente para guardar el JWT de sesión
          y preferencias del usuario (idioma, tema). Puedes borrarlo desde
          la configuración de tu navegador.
        </p>
      </section>

      <section>
        <h2>10. Inteligencia artificial (K-Bot)</h2>
        <p>
          El asistente <strong>K-Bot</strong> es una IA generativa basada en
          modelos open-source servidos por Hugging Face Inference. Las
          respuestas pueden ser inexactas o estar desactualizadas. No es
          consejo profesional, legal ni médico.
        </p>
      </section>
    </article>
  );
}

function LegalNotice() {
  return (
    <article className="legal-doc">
      <h1>Aviso Legal</h1>
      <p className="legal-updated">Última actualización: 27 de mayo de 2026</p>

      <section>
        <h2>1. Titular del sitio</h2>
        <p>
          De conformidad con la Ley 34/2002, de servicios de la sociedad de la
          información y de comercio electrónico (LSSI-CE):
        </p>
        <ul>
          <li><strong>Titulares:</strong> {RESPONSIBLE.authors}</li>
          <li><strong>Centro educativo:</strong> {RESPONSIBLE.institution}</li>
          <li><strong>Programa:</strong> {RESPONSIBLE.course}</li>
          <li><strong>Naturaleza:</strong> Trabajo Fin de Grado (TFG), defensa prevista junio 2026.</li>
          <li><strong>Contacto:</strong> <a href={`mailto:${RESPONSIBLE.contact}`}>{RESPONSIBLE.contact}</a></li>
          <li><strong>URL:</strong> <a href={RESPONSIBLE.url} target="_blank" rel="noopener noreferrer">{RESPONSIBLE.url}</a></li>
        </ul>
      </section>

      <section>
        <h2>2. Propiedad intelectual</h2>
        <p>
          El código fuente, diseño, contenidos y elementos visuales son
          propiedad de sus autores. Se prohíbe la reproducción, distribución
          o transformación sin autorización expresa. Las habitaciones 3D
          están realizadas con <a href="https://spline.design" target="_blank" rel="noopener noreferrer">Spline</a>
          (licencia incluida en la cuenta del autor). Modelos y texturas
          de terceros incluidos en la app utilizan licencias compatibles.
        </p>
      </section>

      <section>
        <h2>3. Responsabilidad</h2>
        <p>
          Esta aplicación se ofrece "tal cual" con fines académicos. Los
          autores no se responsabilizan de errores, fallos de disponibilidad,
          ni del uso indebido por parte de terceros. Las opiniones, contenidos
          y CVs publicados por los usuarios son responsabilidad exclusiva de
          quien los publica.
        </p>
      </section>

      <section>
        <h2>4. Legislación aplicable</h2>
        <p>
          Esta aplicación se rige por la legislación española y europea
          aplicable (RGPD, LOPDGDD 3/2018, LSSI-CE 34/2002, Reglamento de
          IA UE 2024).
        </p>
      </section>
    </article>
  );
}

function TermsOfService() {
  return (
    <article className="legal-doc">
      <h1>Términos y Condiciones de Uso</h1>
      <p className="legal-updated">Última actualización: 27 de mayo de 2026</p>

      <section>
        <h2>1. Aceptación</h2>
        <p>
          Al registrarte o usar la aplicación aceptas estos términos. Si no
          estás de acuerdo con alguno, no la utilices.
        </p>
      </section>

      <section>
        <h2>2. Cuentas de usuario</h2>
        <ul>
          <li>Debes tener al menos 16 años para registrarte.</li>
          <li>Debes verificar tu email para activar la cuenta.</li>
          <li>Eres responsable de la confidencialidad de tu contraseña y de la
              clave de acceso a tu CV.</li>
          <li>No puedes suplantar a otra persona ni usar datos falsos.</li>
        </ul>
      </section>

      <section>
        <h2>3. Contenido del usuario</h2>
        <p>
          El CV, publicaciones en la red social interna, y cualquier dato
          que añadas son responsabilidad tuya. Está prohibido publicar
          contenido ilegal, ofensivo, racista, sexual explícito, spam o
          que infrinja derechos de terceros.
        </p>
        <p>
          Nos reservamos el derecho de eliminar contenido que infrinja
          estos términos sin previo aviso.
        </p>
      </section>

      <section>
        <h2>4. K-Bot (IA generativa)</h2>
        <p>
          El asistente K-Bot utiliza modelos de IA. Sus respuestas pueden
          ser incorrectas. NO sustituyen consejo profesional. No envíes
          datos sensibles en tus consultas (información médica, financiera,
          credenciales, etc.).
        </p>
      </section>

      <section>
        <h2>5. Habitaciones temporales</h2>
        <p>
          Las habitaciones temporales se eliminan automáticamente a las 72
          horas o tras 3 visitas. No hay forma de recuperarlas. La clave
          del CV se muestra UNA sola vez al crearla.
        </p>
      </section>

      <section>
        <h2>6. Finalización del servicio</h2>
        <p>
          Esta aplicación se ofrece sin garantía de continuidad. Tras la
          defensa del TFG (junio 2026) el servicio podría dejar de estar
          disponible. Los usuarios serán notificados con antelación
          razonable y podrán solicitar copia de sus datos antes del cierre.
        </p>
      </section>
    </article>
  );
}

const DOCS = {
  privacy: PrivacyPolicy,
  legal: LegalNotice,
  terms: TermsOfService
};

export default function LegalPage() {
  const { doc } = useParams();
  const t = useT();

  if (!doc) return <Navigate to="/legal/privacy" replace />;
  const Doc = DOCS[doc];
  if (!Doc) return <Navigate to="/legal/privacy" replace />;

  return (
    <div className="legal-page">
      <FloatingSettingsButton />

      <header className="legal-header">
        <Link to="/" className="legal-back">← {t('common.back') || 'Volver'}</Link>
        <nav className="legal-nav">
          <Link to="/legal/privacy" className={doc === 'privacy' ? 'active' : ''}>Privacidad</Link>
          <Link to="/legal/legal" className={doc === 'legal' ? 'active' : ''}>Aviso legal</Link>
          <Link to="/legal/terms" className={doc === 'terms' ? 'active' : ''}>Términos</Link>
        </nav>
      </header>

      <main className="legal-main">
        <Doc />
      </main>

      <footer className="legal-footer">
        <p>© 2026 Khaled Solh El Hajji &amp; Laura Jara Loro · IES Lope de Vega · TFG DAM 2025/2026</p>
      </footer>
    </div>
  );
}
