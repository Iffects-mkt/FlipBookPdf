
import React, { useState, useEffect } from 'react';
import { pdfLoader } from './services/pdfLoader';
import { PDF_URL } from './constants';
import FlipbookView from './components/FlipbookView';
import Toolbar from './components/Toolbar';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 600, height: 800 });

  const loadBrochure = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const numPages = await pdfLoader.load(PDF_URL);
      
      // Obtenemos dimensiones base de la primera página
      const firstPage = await pdfLoader.getPageImage(1);
      setDimensions({ width: firstPage.width, height: firstPage.height });

      // Carga secuencial de imágenes de página
      const pageImages: string[] = [];
      for (let i = 1; i <= numPages; i++) {
        const pg = await pdfLoader.getPageImage(i);
        pageImages.push(pg.url);
      }
      
      setPages(pageImages);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error inicializando el visor:", err);
      setError(err.message || "Error desconocido al procesar el documento.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrochure();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-lg animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Error de Acceso</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            No ha sido posible cargar el brochure desde el servidor externo. Esto puede deberse a restricciones de seguridad del navegador (CORS) o problemas de red.
          </p>
          <div className="w-full bg-black/40 p-4 rounded-xl mb-8 border border-white/5 font-mono text-[10px] text-red-400/80 break-all">
            {error}
          </div>
          <button 
            onClick={loadBrochure}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            <RefreshCw size={18} />
            Reintentar Carga
          </button>
          <p className="mt-8 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            BCK Contratistas Generales S.A.C.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 font-sans">
      {/* Branding Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 pointer-events-none">
        <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 pointer-events-auto shadow-2xl transition-all hover:bg-slate-900">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center font-black text-white text-sm border border-white/20 shadow-inner">
            BCK
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold tracking-tight text-base leading-none">BCK CONTRATISTAS</span>
            <span className="text-emerald-400 text-[10px] font-bold tracking-[0.15em] uppercase mt-1">Generales S.A.C.</span>
          </div>
        </div>
      </div>

      {/* Main Flipbook View */}
      {isLoading ? (
        <div className="h-full w-full flex flex-col items-center justify-center gap-8 bg-slate-950">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-slate-100 font-black tracking-widest text-lg uppercase animate-pulse">Cargando Brochure</h2>
            <div className="flex flex-col items-center gap-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">Procesando páginas de alta resolución</span>
              <span className="text-emerald-500/60 text-[9px] font-mono">Bypass CORS activo...</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <FlipbookView 
            images={pages}
            width={dimensions.width}
            height={dimensions.height}
            onPageChange={setCurrentPage}
            zoom={zoom}
          />

          <Toolbar 
            currentPage={currentPage}
            totalPages={pages.length}
            onPrev={() => window.dispatchEvent(new CustomEvent('flipbook-prev'))}
            onNext={() => window.dispatchEvent(new CustomEvent('flipbook-next'))}
            onZoomIn={() => setZoom(prev => Math.min(prev + 0.2, 3))}
            onZoomOut={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
            onResetZoom={() => setZoom(1)}
            onToggleFullscreen={toggleFullscreen}
          />
        </>
      )}

      {/* Atmospheric Background Layers */}
      <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]"></div>
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none -z-20"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none -z-20"></div>
    </div>
  );
};

export default App;
