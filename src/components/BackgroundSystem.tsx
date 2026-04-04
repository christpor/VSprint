import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll } from 'motion/react';

export const BackgroundSystem = ({ theme }: { theme: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const { scrollY } = useScroll();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const jellies = Array.from(container.querySelectorAll('.bg-jelly')) as HTMLElement[];
    const particles = Array.from(container.querySelectorAll('.bg-particle')) as HTMLElement[];
    const emojis = Array.from(container.querySelectorAll('.bg-emoji')) as HTMLElement[];
    
    let animationFrameId: number;
    
    const jellyStates = jellies.map((el) => {
      const isLarge = el.classList.contains('jelly-large');
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * (isLarge ? 0.05 : 0.1),
        vy: -(Math.random() * 0.1 + (isLarge ? 0.05 : 0.1)),
        phaseX: Math.random() * Math.PI * 2,
        phaseScale: Math.random() * Math.PI * 2,
        baseScale: isLarge ? (Math.random() * 0.2 + 0.9) : (Math.random() * 0.2 + 0.8),
        speedX: Math.random() * 0.0003 + 0.0001,
        speedScale: Math.random() * 0.0005 + 0.0002,
        parallaxFactor: isLarge ? 0.03 : 0.06
      };
    });
    
    const particleStates = particles.map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.1,
      vy: -(Math.random() * 0.2 + 0.05),
      phase: Math.random() * Math.PI * 2,
      parallaxFactor: Math.random() * 0.1 + 0.02
    }));

    const emojiStates = emojis.map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.05,
      vy: -(Math.random() * 0.1 + 0.05),
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.1,
      parallaxFactor: 0.08
    }));

    const render = (time: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const currentScrollY = scrollY.get();
      
      jellies.forEach((jelly, i) => {
        const state = jellyStates[i];
        state.x += state.vx;
        state.y += state.vy;
        const waveX = Math.sin(time * state.speedX + state.phaseX) * 40;
        if (state.y < -800) state.y = h + 800;
        if (state.x < -400) state.x = w + 400;
        if (state.x > w + 400) state.x = -400;
        const scale = state.baseScale * (1 + Math.sin(time * state.speedScale + state.phaseScale) * 0.05);
        const rotation = Math.sin(time * state.speedX + state.phaseX) * 10;
        const scrollOffset = currentScrollY * state.parallaxFactor;
        jelly.style.transform = `translate3d(${state.x + waveX}px, ${state.y + scrollOffset}px, 0) scale(${scale}) rotate(${rotation}deg)`;
      });
      
      particles.forEach((particle, i) => {
        const state = particleStates[i];
        state.x += state.vx;
        state.y += state.vy;
        if (state.y < -100) state.y = h + 100;
        if (state.x < -100) state.x = w + 100;
        if (state.x > w + 100) state.x = -100;
        const waveX = Math.sin(time * 0.0005 + state.phase) * 15;
        const scrollOffset = currentScrollY * state.parallaxFactor;
        particle.style.transform = `translate3d(${state.x + waveX}px, ${state.y + scrollOffset}px, 0)`;
      });

      emojis.forEach((emoji, i) => {
        const state = emojiStates[i];
        state.x += state.vx;
        state.y += state.vy;
        state.rotation += state.rotSpeed;
        if (state.y < -100) state.y = h + 100;
        if (state.x < -100) state.x = w + 100;
        if (state.x > w + 100) state.x = -100;
        const waveX = Math.sin(time * 0.0003 + state.phase) * 20;
        const scrollOffset = currentScrollY * state.parallaxFactor;
        emoji.style.transform = `translate3d(${state.x + waveX}px, ${state.y + scrollOffset}px, 0) rotate(${state.rotation}deg)`;
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isMobile, scrollY]);

  const isDark = theme === 'dark';
  const emojiList = ['💡', '🚀', '⚡', '🧠', '💻'];

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Large Background Jellies */}
      {Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => (
        <div key={`jelly-l-${i}`} className={`bg-jelly jelly-large absolute top-0 left-0 will-change-transform ${isDark ? 'mix-blend-screen' : 'mix-blend-normal'}`} style={{ width: '600px', height: '600px', marginLeft: '-300px', marginTop: '-300px' }}>
          <div className="w-full h-full opacity-60" style={{ 
            borderRadius: '60% 40% 70% 30%',
            filter: isMobile ? 'blur(40px)' : 'blur(100px)',
            background: `linear-gradient(135deg, ${isDark ? 'rgba(6,182,212,0.4)' : 'rgba(6,182,212,0.6)'} 0%, ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(125,211,252,0.5)'} 50%, ${isDark ? 'rgba(139,92,246,0.3)' : 'rgba(196,181,253,0.5)'} 100%)` 
          }} />
        </div>
      ))}
      
      {/* Medium Mid-layer Jellies */}
      {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
        <div key={`jelly-m-${i}`} className={`bg-jelly absolute top-0 left-0 will-change-transform ${isDark ? 'mix-blend-screen' : 'mix-blend-normal'}`} style={{ width: '400px', height: '400px', marginLeft: '-200px', marginTop: '-200px' }}>
          <div className="w-full h-full opacity-70" style={{ 
            borderRadius: '40% 60% 30% 70%',
            filter: isMobile ? 'blur(30px)' : 'blur(80px)',
            background: `linear-gradient(135deg, ${isDark ? 'rgba(59,130,246,0.5)' : 'rgba(56,189,248,0.5)'} 0%, ${isDark ? 'rgba(168,85,247,0.4)' : 'rgba(167,139,250,0.4)'} 100%)` 
          }} />
        </div>
      ))}

      {/* Front layer particles */}
      {Array.from({ length: isMobile ? 10 : 20 }).map((_, i) => (
        <div key={`particle-${i}`} className={`bg-particle absolute top-0 left-0 rounded-full will-change-transform ${isDark ? 'mix-blend-screen' : 'mix-blend-normal'}`} style={{ width: `${Math.random() * 6 + 2}px`, height: `${Math.random() * 6 + 2}px`, background: isDark ? 'rgba(168,85,247,0.6)' : 'rgba(168,85,247,0.4)', filter: 'blur(1px)' }} />
      ))}

      {/* Floating Emojis */}
      {emojiList.slice(0, isMobile ? 3 : 5).map((emoji, i) => (
        <div key={`emoji-${i}`} className="bg-emoji absolute top-0 left-0 text-4xl will-change-transform opacity-10 dark:opacity-20">
          {emoji}
        </div>
      ))}
    </div>
  );
};
