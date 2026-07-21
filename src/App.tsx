import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, AlertTriangle, Zap, Terminal, Check, Copy, Sun, Moon, ArrowRight, Code2, BrainCircuit, Target, User, Rocket, Star, CheckCircle2, Mail, Send, Settings, Play, ExternalLink, LogOut, MessageSquare, Plus, History, Menu, X, Ticket, Monitor } from 'lucide-react';
import { DEMO_RESPONSES } from './demoData';
import { Sidebar } from './components/Sidebar';
import { VSprintLogo } from './components/VSprintLogo';
import { InteractionItem } from './components/InteractionItem';
import { BackgroundSystem } from './components/BackgroundSystem';
import { CinematicIntro } from './components/CinematicIntro';

import { AIResponse, InteractionType, Conversation } from './types';

import { supabase } from './supabaseClient';
import { LogIn } from './components/LogIn';
import { SignUp } from './components/SignUp';
import { ProfileAvatar } from './components/ProfileAvatar';
import { getInteractions, createInteraction, updateInteraction, deleteInteraction } from './services/interactionService';
import type { User as SupabaseUser } from '@supabase/supabase-js';

import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ChatPage } from './pages/ChatPage';

const DEBUG = false;

export default function App() {
  const [authView, setAuthView] = useState<'home' | 'signin' | 'signup'>('home');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [totalActivity, setTotalActivity] = useState<number>(0);

  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const fetchTotalActivity = useCallback(async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) throw error;
      setTotalActivity(count || 0);
    } catch (err) {
      console.error('Error fetching total activity:', err);
    }
  }, []);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error.message);
        if (error.message.includes('refresh_token')) {
          supabase.auth.signOut();
        }
        return;
      }
      
      if (session) {
        setUser(session.user);
        fetchTotalActivity(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setAuthView('home');
        setUser(null);
        setInteractions([]);
        setTotalActivity(0);
        setCurrentConversationId(null);
        setConversations([]);
      } else if (session) {
        setAuthView('home');
        setUser(session.user);
        fetchTotalActivity(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchTotalActivity]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('interactions_count')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setTotalActivity(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('vprint_intro_played');
    }
    return true;
  });
  const [interactions, setInteractions] = useState<InteractionType[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [showPlanLimit, setShowPlanLimit] = useState(false);
  const [bonusQuota, setBonusQuota] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vprint_bonus_quota');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [usedCodes, setUsedCodes] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vprint_used_codes');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [redeemCodeInput, setRedeemCodeInput] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');

  const isUnlimitedUser = user?.email === 'christporr@gmail.com' || user?.email === 'porkh377@gmail.com';
  const isLimitReached = !isUnlimitedUser && totalActivity >= (100 + bonusQuota);

  const handleRedeem = async () => {
    setRedeemError('');
    setRedeemSuccess('');
    const code = redeemCodeInput.trim().toUpperCase();
    
    if (!code) {
      setRedeemError('Please enter a code');
      return;
    }

    if (usedCodes.includes(code)) {
      setRedeemError('This code has already been used');
      return;
    }

    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      const data = await response.json();

      if (data.success) {
        const bonus = data.bonus;
        const newQuota = bonusQuota + bonus;
        setBonusQuota(newQuota);
        setUsedCodes(prev => {
          const updated = [...prev, code];
          localStorage.setItem('vprint_used_codes', JSON.stringify(updated));
          return updated;
        });
        localStorage.setItem('vprint_bonus_quota', newQuota.toString());
        setRedeemSuccess(`Successfully unlocked ${bonus} more answers!`);
        setRedeemCodeInput('');
        
        setTimeout(() => {
          setShowPlanLimit(false);
          setRedeemSuccess('');
        }, 2000);
      } else {
        setRedeemError(data.message || 'Invalid code. Please check and try again.');
      }
    } catch (err) {
      setRedeemError('Network error. Please try again later.');
    }
  };
  const toolRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for parallax robot + glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const location = useLocation();
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark';
    }
    return 'dark';
  });

  const glowRef = useRef<HTMLDivElement>(null);
  const glowRef2 = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const current1 = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const current2 = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const velocity = useRef({ x: 0, y: 0, speed: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const updateGlow = () => {
      const dx1 = mouse.current.x - current1.current.x;
      const dy1 = mouse.current.y - current1.current.y;
      
      const dx2 = current1.current.x - current2.current.x;
      const dy2 = current1.current.y - current2.current.y;
      
      const speedX = dx1 * 0.15;
      const speedY = dy1 * 0.15;
      const speed = Math.sqrt(speedX * speedX + speedY * speedY);
      
      velocity.current.x = velocity.current.x * 0.8 + speedX * 0.2;
      velocity.current.y = velocity.current.y * 0.8 + speedY * 0.2;
      velocity.current.speed = velocity.current.speed * 0.9 + speed * 0.1;
      
      if (Math.abs(dx1) < 0.1 && Math.abs(dy1) < 0.1 && Math.abs(dx2) < 0.1 && Math.abs(dy2) < 0.1 && velocity.current.speed < 0.1) {
        rafId.current = null;
        return;
      }

      current1.current.x += dx1 * 0.15;
      current1.current.y += dy1 * 0.15;
      
      current2.current.x += dx2 * 0.08;
      current2.current.y += dy2 * 0.08;

      const angle = Math.atan2(velocity.current.y, velocity.current.x);
      const stretch = 1 + Math.min(velocity.current.speed * 0.02, 0.5);
      const squeeze = 1 - Math.min(velocity.current.speed * 0.01, 0.2);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current1.current.x}px, ${current1.current.y}px, 0) rotate(${angle}rad) scale(${stretch}, ${squeeze})`;
      }
      if (glowRef2.current) {
        const tailAngle = Math.atan2(dy2, dx2);
        const tailStretch = 1 + Math.min(Math.sqrt(dx2*dx2 + dy2*dy2) * 0.02, 1);
        glowRef2.current.style.transform = `translate3d(${current2.current.x}px, ${current2.current.y}px, 0) rotate(${tailAngle}rad) scale(${tailStretch}, ${squeeze * 0.8})`;
      }
      
      rafId.current = requestAnimationFrame(updateGlow);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(updateGlow);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafId.current = requestAnimationFrame(updateGlow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setInteractions([]);
      setCurrentConversationId(null);
    }
  }, [user]);

  useEffect(() => {
    if (user && currentConversationId) {
      fetchInteractions(currentConversationId);
    } else {
      setInteractions([]);
    }
  }, [user, currentConversationId]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select('conversation_id, prompt, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;

      const uniqueConversations: Conversation[] = [];
      const seenIds = new Set();
      
      data.forEach(item => {
        if (!seenIds.has(item.conversation_id)) {
          seenIds.add(item.conversation_id);
          uniqueConversations.push({
            id: item.conversation_id,
            title: item.prompt.length > 30 ? item.prompt.substring(0, 30) + '...' : item.prompt,
            created_at: item.created_at
          });
        }
      });

      setConversations(uniqueConversations.reverse());
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchInteractions = async (convId: string) => {
    if (!user) return;
    try {
      const data = await getInteractions(user.id, convId);
      setInteractions(data.map(i => ({ ...i, loading: false, statusMessage: null })));
    } catch (err) {
      console.error('Error fetching interactions:', err);
    }
  };

  const startNewChat = () => {
    setCurrentConversationId(null);
    setInteractions([]);
    setIsSidebarOpen(false);
    scrollToTool();
  };

  const scrollToTool = () => {
    toolRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    localStorage.setItem('vprint_intro_played', 'true');
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showIntro ? (
        <CinematicIntro key="intro" onComplete={handleIntroComplete} />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen bg-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-sky-950 dark:text-slate-50 font-sans transition-colors duration-500 relative overflow-hidden selection:bg-blue-500/30"
        >
          
          {/* Background Layers */}
          <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,rgba(2,6,23,1)_100%)]" />
          
          {/* Clean gradient background */}
          <div className="fixed inset-0 z-0 bg-gradient-to-b from-white via-white to-sky-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900" />
          
          {/* Mouse-follow glow */}
          <div 
            className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-[1] opacity-30 dark:opacity-20 blur-[120px] transition-all duration-300 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, transparent 70%)',
              left: `calc(${(mousePos.x + 1) * 50}% - 250px)`,
              top: `calc(${(mousePos.y + 1) * 50}% - 250px)`,
            }}
          />

          <AnimatePresence>
            {showPlanLimit && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md"
                onClick={() => setShowPlanLimit(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
                      <Rocket className="w-10 h-10 text-white" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-sky-950 dark:text-cyan-50 mb-4 tracking-tight">
                      {isLimitReached ? "Daily Limit Achieved" : "Unlock Exclusive Access"}
                    </h2>
                    
                    <p className="text-lg text-sky-800 dark:text-cyan-200/80 mb-8 leading-relaxed">
                      {isLimitReached 
                        ? "You've reached the peak of your daily plan. Step up to Elite for unlimited power and advanced insights."
                        : "Enter your invitation code to expand your creative potential."}
                    </p>

                    <div className="mb-8 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                      <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mb-4">Have a presentation code?</p>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={redeemCodeInput}
                          onChange={(e) => setRedeemCodeInput(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button 
                          onClick={handleRedeem}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all"
                        >
                          Redeem
                        </button>
                      </div>
                      {redeemError && <p className="mt-2 text-xs text-red-500 font-medium">{redeemError}</p>}
                      {redeemSuccess && <p className="mt-2 text-xs text-green-500 font-medium">{redeemSuccess}</p>}
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowPlanLimit(false)}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95"
                      >
                        Upgrade to Pro
                      </button>
                      <button 
                        onClick={() => setShowPlanLimit(false)}
                        className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                      >
                        Maybe later
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mouse Follow Glow - Layer 1 (Fast, Inner) */}
          <div
            ref={glowRef}
            className={`pointer-events-none fixed top-0 left-0 z-0 will-change-transform ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-normal'}`}
            style={{
              width: '300px',
              height: '300px',
              marginLeft: '-150px',
              marginTop: '-150px',
              background: `radial-gradient(circle, ${
                DEBUG ? 'rgba(6, 182, 212, 0.8)' : (theme === 'dark' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(6, 182, 212, 0.6)')
              } 0%, transparent 60%)`,
              filter: DEBUG ? 'blur(10px)' : 'blur(20px)',
            }}
          />
          
          {/* Mouse Follow Glow - Layer 2 (Slow Trail, Outer) */}
          <div
            ref={glowRef2}
            className={`pointer-events-none fixed top-0 left-0 z-0 will-change-transform ${theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-normal'}`}
            style={{
              width: '700px',
              height: '700px',
              marginLeft: '-350px',
              marginTop: '-350px',
              background: `radial-gradient(circle, ${
                DEBUG ? 'rgba(168, 85, 247, 0.6)' : (theme === 'dark' ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.4)')
              } 0%, transparent 60%)`,
              filter: DEBUG ? 'blur(20px)' : 'blur(40px)',
            }}
          />

          <div className="relative z-10 flex flex-col min-h-screen">
            
            {/* Sidebar */}
            <Sidebar 
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              conversations={conversations}
              currentConversationId={currentConversationId}
              setCurrentConversationId={setCurrentConversationId}
              startNewChat={startNewChat}
              scrollToTool={scrollToTool}
              isPresentationMode={isPresentationMode}
              setIsPresentationMode={setIsPresentationMode}
              setShowPlanLimit={setShowPlanLimit}
              user={user}
            />

            {/* Header */}
            <header className="flex justify-between items-center max-w-6xl mx-auto w-full p-6 md:p-8 relative z-50">
              <div className="flex items-center gap-4">
                {location.pathname === '/app' && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sky-800 dark:text-cyan-100 shadow-sm"
                  aria-label="Open History"
                >
                  <History className="w-5 h-5" />
                </button>
                )}
                <Link to="/" className="flex items-center gap-3">
                  <VSprintLogo className="w-10 h-10" />
                  <span className="font-bold text-xl tracking-tight">
                    <span className="text-sky-500 dark:text-sky-400">V</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Sprint</span>
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/about" className="hidden md:inline text-sky-800 dark:text-cyan-100 font-medium hover:text-blue-500 transition-colors">About</Link>
                {user ? (
                  <div className="flex items-center gap-4">
                    {location.pathname !== '/app' && (
                      <Link to="/app" className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-500/25">
                        Open App
                      </Link>
                    )}
                    {location.pathname === '/app' && !isPresentationMode && (
                      <button 
                        onClick={() => setShowPlanLimit(true)}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium transition-all shadow-sm"
                      >
                        <Ticket className="w-4 h-4" />
                        Redeem
                      </button>
                    )}
                    {location.pathname === '/app' && (
                    <button 
                      onClick={startNewChat}
                      className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sky-800 dark:text-cyan-100 shadow-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      New Chat
                    </button>
                    )}
                    <ProfileAvatar user={user} />
                    <button 
                      onClick={() => supabase.auth.signOut()} 
                      className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <button onClick={() => setAuthView('signin')} className="text-sky-800 dark:text-cyan-100 font-medium hover:text-blue-500 transition-colors">Log In</button>
                    <button 
                      onClick={() => setAuthView('signup')} 
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-500/25"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2.5 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sky-800 dark:text-cyan-100 shadow-sm"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </header>

            <main className="flex-1">
              {authView === 'signin' ? (
                <div className="flex items-center justify-center min-h-[80vh]">
                  <LogIn onSwitch={() => setAuthView('signup')} />
                </div>
              ) : authView === 'signup' ? (
                <div className="flex items-center justify-center min-h-[80vh]">
                  <SignUp onSwitch={() => setAuthView('signin')} />
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={
                    <LandingPage 
                      mousePos={mousePos} 
                      scrollToTool={scrollToTool} 
                      setAuthView={setAuthView} 
                    />
                  } />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/app" element={
                    user ? (
                      <ChatPage
                        user={user}
                        totalActivity={totalActivity}
                        setTotalActivity={setTotalActivity}
                        bonusQuota={bonusQuota}
                        setBonusQuota={setBonusQuota}
                        showPlanLimit={showPlanLimit}
                        setShowPlanLimit={setShowPlanLimit}
                        conversations={conversations}
                        setConversations={setConversations}
                        currentConversationId={currentConversationId}
                        setCurrentConversationId={setCurrentConversationId}
                        interactions={interactions}
                        setInteractions={setInteractions}
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                        isPresentationMode={isPresentationMode}
                        demoMode={demoMode}
                        toolRef={toolRef}
                        scrollToTool={scrollToTool}
                      />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              )}
            </main>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
