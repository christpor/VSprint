import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { VSprintLogo } from './VSprintLogo';

export const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [phase, setPhase] = useState(0); // 0: Initial, 1: Logo, 2: Energy, 3: Text, 4: Out

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Timing constants (ms)
  const m = isMobile ? 0.8 : 1.0;
  
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500 * m),   // Logo Reveal
      setTimeout(() => setPhase(2), 1500 * m),  // Energy Phase
      setTimeout(() => setPhase(3), 2500 * m),  // Text Reveal
      setTimeout(() => setPhase(4), 3200 * m),  // Transition Out
      setTimeout(() => onComplete(), 4200 * m)  // Complete
    ];
    return () => timers.forEach(clearTimeout);
  }, [m, onComplete]);

  const cubicBezier = [0.22, 1, 0.36, 1] as any;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: phase === 4 ? 0 : 1,
        scale: phase === 4 ? 0.95 : 1
      }}
      transition={{ duration: 0.8 * m, ease: cubicBezier }}
      className="fixed inset-0 z-[100] bg-[#020617] flex items-center justify-center overflow-hidden"
    >
      {/* Cinematic Background Layers */}
      <motion.div 
        animate={{ 
          scale: phase >= 2 ? 1.2 : 1,
          opacity: phase >= 2 ? 0.8 : 0.4,
          filter: phase === 2 ? "blur(20px)" : "blur(0px)"
        }}
        transition={{ 
          duration: 2, 
          ease: "easeInOut",
          filter: { duration: 1, repeat: phase === 2 ? Infinity : 0, repeatType: "reverse" }
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" 
      />
      
      {/* Animated Glow Pulse */}
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.2)_0%,transparent_70%)]" 
      />
      
      {/* Floating Cinematic Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: isMobile ? 10 : 25 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: phase >= 2 ? [null, "-30%"] : [null, "-10%"],
              opacity: phase >= 2 ? [0, 0.4, 0] : [0, 0.2, 0],
              x: phase >= 2 ? [null, (Math.random() - 0.5) * 50 + "px"] : null
            }}
            transition={{ 
              duration: Math.random() * 4 + 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* Skip Button */}
      <button 
        onClick={onComplete}
        className="absolute top-8 right-8 z-20 text-slate-500 hover:text-slate-300 transition-colors text-[10px] font-bold flex items-center gap-1.5 group uppercase tracking-[0.3em]"
      >
        Skip
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Logo Sequence */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
          animate={{ 
            opacity: phase >= 1 ? 1 : 0, 
            scale: phase >= 1 ? 1 : 0.8,
            rotate: phase >= 1 ? 0 : -12,
            y: phase >= 2 ? [0, -8, 0] : 0
          }}
          transition={{ 
            opacity: { duration: 1 * m, ease: cubicBezier },
            scale: { type: "spring", stiffness: 100, damping: 15, mass: 1 },
            rotate: { type: "spring", stiffness: 100, damping: 15, mass: 1 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative"
        >
          {/* Logo Glow Pulse */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full scale-150" 
          />
          <VSprintLogo className="w-24 h-24 md:w-32 md:h-32 relative z-10" />
        </motion.div>

        {/* Text Sequence */}
        <div className="flex flex-col items-center gap-2 min-h-[80px]">
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  visible: { transition: { staggerChildren: 0.2 } }
                }}
                className="flex flex-col items-center gap-2"
              >
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                    exit: { opacity: 0, y: -10, filter: "blur(5px)" }
                  }}
                  transition={{ duration: 0.6, ease: cubicBezier }}
                  className="text-xl md:text-2xl text-slate-200 font-medium tracking-tight text-center"
                >
                  Stop memorizing syntax.
                </motion.p>
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                    exit: { opacity: 0, y: -10, filter: "blur(5px)" }
                  }}
                  transition={{ duration: 0.6, ease: cubicBezier }}
                  className="text-lg md:text-xl text-slate-400 font-light tracking-wide text-center"
                >
                  Start mastering logic.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.4)_100%)]" />
    </motion.div>
  );
};
