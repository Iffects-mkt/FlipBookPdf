
import * as pdfjsLib from 'pdfjs-dist';
import { PDF_WORKER_URL } from '../constants';

// Configurar el worker globalmente
pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

export class PdfLoader {
  private pdfDoc: any = null;

  async load(url: string) {
    try {
      if (!url) {
        throw new Error('La URL del PDF no está definida.');
      }
      
      console.log('Iniciando descarga de PDF (vía Proxy CORS)...');

      // Descarga manual del buffer para asegurar que el archivo completo está disponible
      // y evitar peticiones adicionales del worker que podrían ser bloqueadas.
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: El proxy no pudo recuperar el archivo de qr-trust.com.`);
      }

      const data = await response.arrayBuffer();
      
      // Validación básica de cabecera PDF
      const header = new Uint8Array(data.slice(0, 4));
      const headerString = String.fromCharCode(...header);
      if (headerString !== '%PDF') {
        throw new Error('El recurso descargado no es un archivo PDF válido o el proxy devolvió un error HTML.');
      }

      const loadingTask = pdfjsLib.getDocument({
        data: data,
        isEvalSupported: false,
        // Deshabilitamos streaming y auto-fetch para que trabaje exclusivamente con el buffer cargado
        disableAutoFetch: true,
        disableStream: true
      });
      
      this.pdfDoc = await loadingTask.promise;
      console.log(`PDF cargado exitosamente. Total páginas: ${this.pdfDoc.numPages}`);
      return this.pdfDoc.numPages;
    } catch (error: any) {
      console.error('Error crítico en PdfLoader:', error);
      
      // Mapeo de errores comunes para la interfaz de usuario
      if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        throw new Error('Error de Conexión: No se pudo contactar con el servidor. Verifique su conexión o intente nuevamente más tarde.');
      }
      
      throw error;
    }
  }

  async getPageImage(pageNumber: number, scale: number = 2): Promise<{ url: string; width: number; height: number }> {
    if (!this.pdfDoc) throw new Error('PDF no cargado');

    try {
      const page = await this.pdfDoc.getPage(pageNumber);
      // Usamos una escala alta para asegurar nitidez en el flipbook (zoom amigable)
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) throw new Error('No se pudo inicializar el motor de renderizado 2D');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      
      // Generamos JPEG con calidad alta para balancear performance y visualización
      const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
      
      // Gestión de memoria de PDF.js
      if (typeof page.cleanup === 'function') {
        page.cleanup();
      }
      
      return {
        url: dataUrl,
        width: viewport.width,
        height: viewport.height
      };
    } catch (error) {
      console.error(`Fallo al renderizar la página ${pageNumber}:`, error);
      throw error;
    }
  }

  get numPages() {
    return this.pdfDoc ? this.pdfDoc.numPages : 0;
  }
}

export const pdfLoader = new PdfLoader();
