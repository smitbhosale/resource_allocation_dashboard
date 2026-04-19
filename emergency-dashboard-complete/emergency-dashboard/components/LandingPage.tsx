import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Shield, Map, Users } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Ensure you have at least this number of frames in public/video (e.g. ezgif-frame-001.jpg, ...)
const TOTAL_FRAMES = 31; 

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // 1. Preload images
    const images: HTMLImageElement[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameNumber = i.toString().padStart(3, '0');
        img.src = `/video/ezgif-frame-${frameNumber}.jpg`;
        images.push(img);
    }
    imagesRef.current = images;

    let animationFrameId: number;
    let isRunning = true;

    // 2. Calculate target scroll percentage
    const handleScroll = () => {
      if (!containerRef.current) return;
      const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
      targetScrollRef.current = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 3. Smooth animation loop
    const updateLoop = () => {
      if (!isRunning) return;

      // Smooth interpolation using Lerp formula
      const maxDist = Math.abs(targetScrollRef.current - currentScrollRef.current);
      if (maxDist > 0.0001) {
          currentScrollRef.current += (targetScrollRef.current - currentScrollRef.current) * 0.1;
          
          const progress = currentScrollRef.current;
          setScrollProgress(progress); // Triggers UI state updates

          // Render corresponding frame on canvas
          const frameIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(progress * TOTAL_FRAMES)
          );

          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          const img = imagesRef.current[frameIndex];
          
          if (canvas && ctx && img && img.complete) {
            drawCover(ctx, img, canvas.width, canvas.height, progress);
          }
      }

      animationFrameId = requestAnimationFrame(updateLoop);
    };
    
    updateLoop();

    // 4. Handle resize & canvas sizing
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            
            // Force redraw on resize
            const frameIndex = Math.floor(currentScrollRef.current * TOTAL_FRAMES);
            const img = imagesRef.current[Math.min(TOTAL_FRAMES - 1, Math.max(0, frameIndex))];
            if (img && img.complete) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) drawCover(ctx, img, canvasRef.current.width, canvasRef.current.height, currentScrollRef.current);
            }
        }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize size

    return () => {
        isRunning = false;
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const drawCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number, progress: number) => {
    ctx.clearRect(0, 0, width, height);

    if (!img || img.naturalWidth === 0) {
        // Fallback: draw dynamic gradient if images are missing
        const grad = ctx.createLinearGradient(0, 0, width, height);
        const r = Math.floor(20 + progress * 50);
        const b = Math.floor(40 + progress * 150);
        grad.addColorStop(0, `rgb(${r}, 20, ${b})`);
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Looking for video sequence in /video/ezgif-frame-001.jpg', width/2, height - 40);
        return;
    }

    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    // Cover logic
    if (imgRatio > canvasRatio) { 
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
    } else { 
        drawHeight = width / imgRatio;
        offsetY = (height - drawHeight) / 2;
    }
    
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  return (
    <div ref={containerRef} className="relative bg-slate-950 min-h-[400vh] text-white overflow-x-hidden">
      {/* Background fixed canvas */}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-slate-950/10 z-10" />
        <canvas ref={canvasRef} className="block w-full h-full object-cover z-0" />
      </div>

      {/* Intro Header */}
      <div className={`fixed top-0 left-0 w-full h-screen flex flex-col items-center justify-center z-20 transition-all duration-1000 ${scrollProgress > 0.05 ? 'opacity-0 translate-y-[-20px] pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <img src="/logo.jpg" alt="RAD" className="w-24 h-24 object-contain rounded-2xl shadow-2xl bg-white mb-8" />
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-6">RAD</h1>
        <p className="text-xl md:text-2xl text-blue-200 font-medium tracking-wide">Emergency Response Network</p>
        <div className="absolute bottom-10 animate-bounce flex flex-col items-center gap-2 text-slate-400">
           <span className="text-xs font-bold uppercase tracking-widest">Scroll to explore</span>
           <div className="w-px h-16 bg-gradient-to-b from-slate-400 to-transparent" />
        </div>
      </div>

      {/* Section 1: Left */}
      <div className={`fixed inset-0 flex items-center justify-start px-8 md:px-24 xl:px-48 z-20 transition-all duration-700 ${scrollProgress > 0.15 && scrollProgress < 0.4 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20 pointer-events-none'}`}>
        <div className="max-w-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/50 mb-8 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Real-time disaster <br/><span className="text-blue-400">reporting by citizens</span></h2>
          <p className="text-xl text-slate-300 leading-relaxed">Empower communities to quickly alert authorities. Secure, fast, and intelligent reporting connected directly to responders.</p>
        </div>
      </div>

      {/* Section 2: Right */}
      <div className={`fixed inset-0 flex items-center justify-end px-8 md:px-24 xl:px-48 z-20 transition-all duration-700 ${scrollProgress > 0.45 && scrollProgress < 0.7 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none'}`}>
        <div className="max-w-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl text-right flex flex-col items-end">
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/50 mb-8 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]">
             <Map className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Smart resource allocation <br/><span className="text-purple-400">using map tracking</span></h2>
          <p className="text-xl text-slate-300 leading-relaxed">AI-driven predictive deployments ensure critical supplies reach affected areas dynamically without resource bottlenecks.</p>
        </div>
      </div>

      {/* Section 3: Left */}
      <div className={`fixed inset-0 flex items-center justify-start px-8 md:px-24 xl:px-48 z-20 transition-all duration-700 ${scrollProgress > 0.75 && scrollProgress < 0.95 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20 pointer-events-none'}`}>
        <div className="max-w-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/50 mb-8 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
            <Users className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Efficient coordination <br/><span className="text-emerald-400">with responders</span></h2>
          <p className="text-xl text-slate-300 leading-relaxed">Seamless integration between citizens, civil servants, and centralized authorities forming an impenetrable defense.</p>
        </div>
      </div>

      {/* Section 4: Final / CTA */}
      <div className={`fixed inset-0 flex flex-col items-center justify-center z-30 bg-slate-950/80 backdrop-blur-2xl transition-all duration-1000 ${scrollProgress >= 0.98 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <img src="/logo.jpg" alt="RAD" className="w-24 h-24 object-contain rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.3)] bg-white mb-10" />
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight text-center">Ready to <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Make an Impact?</span></h2>
        <button
          onClick={() => {
            window.scrollTo(0, 0); // reset scroll
            onGetStarted();
          }}
          className="group relative px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-black text-2xl shadow-[0_0_50px_-5px_rgba(59,130,246,0.6)] hover:shadow-[0_0_70px_-5px_rgba(59,130,246,0.8)] transition-all overflow-hidden flex items-center gap-4"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          <span className="relative z-10 text-white">Get Started</span>
          <ArrowRight className="w-8 h-8 relative z-10 text-white group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );
};
