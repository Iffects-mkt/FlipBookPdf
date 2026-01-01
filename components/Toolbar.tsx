
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface ToolbarProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen
}) => {
  const [isVisible, setIsVisible] = useState(true);
  // Fixed: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to resolve the "Cannot find namespace 'NodeJS'" error in the browser environment.
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const resetHideTimer = () => {
    setIsVisible(true);
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setIsVisible(false), 3000);
    setTimeoutId(id);
  };

  useEffect(() => {
    resetHideTimer();
    window.addEventListener('mousemove', resetHideTimer);
    window.addEventListener('touchstart', resetHideTimer);
    return () => {
      window.removeEventListener('mousemove', resetHideTimer);
      window.removeEventListener('touchstart', resetHideTimer);
    };
  }, []);

  return (
    <div 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform 
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
      onMouseEnter={() => { if(timeoutId) clearTimeout(timeoutId); setIsVisible(true); }}
    >
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl">
        
        {/* Navigation */}
        <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
          <button 
            onClick={onPrev}
            disabled={currentPage === 0}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-sm font-medium text-slate-300 min-w-[80px] text-center">
            {currentPage + 1} / {totalPages}
          </span>

          <button 
            onClick={onNext}
            disabled={currentPage === totalPages - 1}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
          <button onClick={onZoomOut} className="p-2 hover:bg-slate-800 rounded-full text-slate-300 transition-colors">
            <ZoomOut size={18} />
          </button>
          <button onClick={onResetZoom} className="p-2 hover:bg-slate-800 rounded-full text-slate-300 transition-colors">
            <RotateCcw size={18} />
          </button>
          <button onClick={onZoomIn} className="p-2 hover:bg-slate-800 rounded-full text-slate-300 transition-colors">
            <ZoomIn size={18} />
          </button>
        </div>

        {/* Misc */}
        <div className="flex items-center gap-2">
          <button onClick={onToggleFullscreen} className="p-2 hover:bg-slate-800 rounded-full text-slate-300 transition-colors">
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
