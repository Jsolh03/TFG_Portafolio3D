import { getTemplate, DEFAULT_TEMPLATE_ID } from './cvPdfTemplates';

const PRINT_STYLE_ID = '__cv_pdf_print_overrides';

function injectPrintStyles(css) {
  removePrintStyles();
  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

function removePrintStyles() {
  const style = document.getElementById(PRINT_STYLE_ID);
  if (style) style.remove();
}

/**
 * Devuelve una URL CORS-amigable para imagenes externas.
 * Las mismas-origen se devuelven sin tocar.
 * Las externas pasan por images.weserv.nl, que envia Access-Control-Allow-Origin: *.
 */
function proxiedImageUrl(rawSrc) {
  if (!rawSrc || rawSrc.startsWith('data:') || rawSrc.startsWith('blob:')) return rawSrc;
  let parsed;
  try {
    parsed = new URL(rawSrc, window.location.href);
  } catch {
    return rawSrc;
  }
  if (parsed.origin === window.location.origin) return parsed.href;
  const stripped = parsed.href.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(stripped)}`;
}

async function fetchAsDataUrl(url) {
  const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('FileReader failed'));
    r.readAsDataURL(blob);
  });
}

async function inlineImages(root) {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(imgs.map(async (img) => {
    const src = img.src;
    if (!src || src.startsWith('data:')) return;
    const fetchUrl = proxiedImageUrl(src);
    try {
      const dataUrl = await fetchAsDataUrl(fetchUrl);
      img.dataset.originalSrc = src;
      img.src = dataUrl;
      if (img.decode) { try { await img.decode(); } catch { /* ignore */ } }
    } catch (err) {
      console.warn('No se pudo inline-ar la imagen:', src, err.message || err);
    }
  }));
}

function restoreImages(root) {
  root.querySelectorAll('img[data-original-src]').forEach(img => {
    img.src = img.dataset.originalSrc;
    delete img.dataset.originalSrc;
  });
}

async function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }
}

/**
 * Genera y descarga el CV como PDF limpio, usando la plantilla indicada.
 * No usa window.print(): no aparece cabecera/pie del navegador (fecha, URL, etc.).
 *
 * @param {Object} opts
 * @param {string} opts.filename       Nombre del archivo de salida.
 * @param {string} opts.templateId     Id de plantilla ('classic' | 'blue' | 'cyber').
 */
export async function generateCVPdf({ filename = 'CV.pdf', templateId = DEFAULT_TEMPLATE_ID } = {}) {
  const target = document.querySelector('.cv-container');
  if (!target) throw new Error('No se encontro .cv-container en el DOM');

  const tpl = getTemplate(templateId);
  const css = tpl.css;

  injectPrintStyles(css);
  try {
    await waitForFonts();
    await inlineImages(target);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const { default: html2pdf } = await import('html2pdf.js');

    // Anchura util de A4 con margenes 14mm sides = 182mm = 688px @96dpi.
    // Fijamos canvas y window a esta anchura exacta: 1:1 sin escalado raro,
    // nada del contenido se desborda a la derecha del folio.
    const TARGET_PX_WIDTH = 688;

    await html2pdf()
      .set({
        margin: [14, 14, 18, 14], // top, left, bottom, right — 18mm abajo para colchon de paginacion
        filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: TARGET_PX_WIDTH,
          windowWidth: TARGET_PX_WIDTH,
          removeContainer: true,
          onclone: (clonedDoc) => {
            // Neutralizar tema/estilo globales en el clon para que no apliquen reglas
            // como [data-style="futuristic"] .cv-name { text-shadow: 0 0 60px ... }.
            clonedDoc.documentElement.removeAttribute('data-style');
            clonedDoc.documentElement.removeAttribute('data-theme');
            clonedDoc.documentElement.removeAttribute('data-high-contrast');
            clonedDoc.documentElement.removeAttribute('data-reduced-motion');
            const s = clonedDoc.createElement('style');
            s.textContent = css;
            clonedDoc.head.appendChild(s);
          }
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        // 'avoid-all' aplica page-break-inside: avoid a TODOS los elementos.
        // Asi html2pdf empuja al folio siguiente cualquier parrafo/lista/card
        // que se quedaria a caballo entre dos paginas (no mas "grado superi-or").
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          avoid: [
            '.cv-section', '.cv-experience-card', '.cv-header',
            '.cv-about-text', '.cv-meta', '.cv-skill-badge',
            '.cv-contact-grid', '.cv-skills-grid',
            'p', 'h2', 'h3', 'strong', 'li'
          ]
        }
      })
      .from(target)
      .save();
  } finally {
    restoreImages(target);
    removePrintStyles();
  }
}
