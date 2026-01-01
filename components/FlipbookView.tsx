
import React, { useEffect, useRef } from 'react';

interface FlipbookViewProps {
  images: string[];
  width: number;
  height: number;
  onPageChange: (index: number) => void;
  zoom: number;
}

declare const St: any; // Namespace for PageFlip from CDN

const FlipbookView: React.FC<FlipbookViewProps> = ({ images, width, height, onPageChange, zoom }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipbookInstance = useRef<any>(null);

  useEffect(() => {
    if (containerRef.current && !flipbookInstance.current && images.length > 0) {
      // Create element structure for PageFlip
      const bookEl = document.createElement('div');
      bookEl.id = 'flipbook-element';
      containerRef.current.appendChild(bookEl);

      images.forEach((img, idx) => {
        const pageEl = document.createElement('div');
        pageEl.className = 'page-item';
        // Hard density for cover and last page
        if (idx === 0 || idx === images.length - 1) {
            pageEl.setAttribute('data-density', 'hard');
        }
        
        const imgEl = document.createElement('img');
        imgEl.src = img;
        imgEl.style.width = '100%';
        imgEl.style.height = '100%';
        imgEl.style.objectFit = 'contain';
        imgEl.style.pointerEvents = 'none';
        
        pageEl.appendChild(imgEl);
        bookEl.appendChild(pageEl);
      });

      const pageFlip = new St.PageFlip(bookEl, {
        width: width,
        height: height,
        size: "stretch",
        minWidth: 315,
        maxWidth: 1200,
        minHeight: 420,
        maxHeight: 1600,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
        flippingTime: 1000,
      });

      pageFlip.loadFromHTML(bookEl.querySelectorAll('.page-item'));

      pageFlip.on('flip', (e: any) => {
        onPageChange(e.data);
      });

      flipbookInstance.current = pageFlip;

      // Listen for custom toolbar events
      const handlePrev = () => pageFlip.flipPrev();
      const handleNext = () => pageFlip.flipNext();
      
      window.addEventListener('flipbook-prev', handlePrev);
      window.addEventListener('flipbook-next', handleNext);

      return () => {
        window.removeEventListener('flipbook-prev', handlePrev);
        window.removeEventListener('flipbook-next', handleNext);
        if (flipbookInstance.current) {
          flipbookInstance.current.destroy();
          flipbookInstance.current = null;
        }
        if (bookEl.parentNode) {
            bookEl.parentNode.removeChild(bookEl);
        }
      };
    }
  }, [images, width, height]);

  return (
    <div className="flex items-center justify-center w-full h-full p-4 md:p-8 overflow-hidden bg-slate-950">
      <div 
        className="relative transition-transform duration-500 ease-out"
        style={{ 
          transform: `scale(${zoom})`,
          width: 'min(92vw, 1400px)',
          height: 'min(82vh, 1000px)'
        }}
      >
        <div ref={containerRef} className="w-full h-full flex items-center justify-center shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
           {/* PageFlip renders here */}
        </div>
      </div>
    </div>
  );
};

export default FlipbookView;
