
// URL externa fija solicitada por el cliente
const REMOTE_PDF_URL = '/pdf/brochure.pdf';

// Implementamos el uso de un proxy CORS (allorigins) para poder descargar el archivo desde el cliente
// sin ser bloqueados por la política de Same-Origin del navegador.
export const PDF_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(REMOTE_PDF_URL)}`;

export const PDF_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

export const COLORS = {
  bg: 'bg-slate-900',
  accent: 'text-emerald-400',
  accentBg: 'bg-emerald-500',
  toolbar: 'bg-slate-800/80',
};

export const BREAKPOINTS = {
  mobile: 768,
};
