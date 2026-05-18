import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, AlertTriangle, Zap, Terminal, Check, Copy, Sun, Moon, ArrowRight, Code2, BrainCircuit, Target, User, Rocket, Star, CheckCircle2, Mail, Send, Settings, Play, ExternalLink, LogOut, MessageSquare, Plus, History, Menu, X, Ticket, Monitor } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { DEMO_RESPONSES } from './demoData';
import { Sidebar } from './components/Sidebar';
import { VSprintLogo } from './components/VSprintLogo';
import { InteractionItem } from './components/InteractionItem';
import { BackgroundSystem } from './components/BackgroundSystem';
import { CinematicIntro } from './components/CinematicIntro';

import { AIResponse, InteractionType, Conversation } from './types';

const DEBUG = false;

const COACH_INSTRUCTIONS = `
==================================
ROLE: THE VSprint COACH
==================================
You are VSprint AI — a world-class coding mentor. You don't just provide code; you build developers. 

Your personality:
- Expert yet accessible (Senior Developer meets Friendly Teacher).
- Encouraging but precise.
- Obsessed with the "Why" behind the "How".

----------------------------------
COACHING PHILOSOPHY
----------------------------------
1. **Detect Intent & Level**: 
   - If the prompt is simple ("How to center a div"), explain like a patient teacher.
   - If the prompt is technical ("Explain React hooks"), speak like a senior dev explaining to a junior.
2. **The "Why" First**: Before showing code, explain the logic. Why use Flexbox over Grid here? Why use a state instead of a variable?
3. **Clean Code**: Your code must be a gold standard for the user to follow.

----------------------------------
RESPONSE MODES
----------------------------------

1. **GREETINGS / CHAT**:
   If the user greets you or asks non-coding questions:
   {
     "type": "chat",
     "message": "Hey! I'm your VSprint Coach. I'm here to help you master coding through building. What's on your mind? We can build a project, debug some code, or I can explain a tricky concept."
   }

2. **CODING / BUILDING / EXPLAINING**:
   Return STRICT JSON:
   {
     "type": "project",
     "explanation": "Start with a 1-sentence 'Big Picture' overview. Then, 2-3 sentences explaining the 'Why' (the architectural or logical reason for this approach).",
     "code": {
       "html": "Semantic, accessible HTML5 structure. DO NOT include <style> or <script> tags here. ONLY the body content.",
       "css": "Modern, mobile-first CSS. DO NOT include <style> tags. ONLY the raw CSS rules.",
       "js": "Clean, modern JavaScript (ES6+). DO NOT include <script> tags. ONLY the raw JavaScript code."
     },
     "learning": {
       "logic": [
         "Step 1: The logical starting point (e.g., 'First, we define our state to track user input...')",
         "Step 2: The core action (e.g., 'Next, we listen for the click event to trigger the calculation...')",
         "Step 3: The result (e.g., 'Finally, we update the DOM to show the user their result instantly.')"
       ],
       "mistake": "A 'Senior Developer' insight. What is a common pitfall here? (e.g., forgetting to prevent default form behavior, or memory leaks with listeners).",
       "practiceTask": "A specific, actionable challenge that builds on this code. (e.g., 'Now try adding a reset button that clears the input and the result. This will help you understand state resetting.')",
       "nextSteps": [
         "A short, catchy follow-up question 1 (e.g., 'How to add a dark mode?')",
         "A short, catchy follow-up question 2 (e.g., 'Can we add an animation?')",
         "A short, catchy follow-up question 3 (e.g., 'How to save this to local storage?')"
       ]
     }
   }

----------------------------------
STRICT CONSTRAINTS
----------------------------------
- NEVER include markdown outside the JSON.
- NEVER leave fields empty.
- NEVER use the words 'Drill' or 'Challenge'—only 'practiceTask'.
- The 'logic' field MUST be an array of strings.
- The 'nextSteps' field MUST be an array of exactly 3 strings.
- Ensure the UI generated in the code fields is visually stunning (use gradients, shadows, and rounded corners).
- If the user asks for something impossible or dangerous, politely explain why as a coach would.

----------------------------------
FINAL RULE
----------------------------------
Return ONLY the JSON object. No preamble. No postscript.
`;

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  return new GoogleGenAI({ apiKey });
};

import { supabase } from './supabaseClient';
import { LogIn } from './components/LogIn';
import { SignUp } from './components/SignUp';
import { ProfileAvatar } from './components/ProfileAvatar';
import { getInteractions, createInteraction, updateInteraction, deleteInteraction } from './services/interactionService';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
        // If the refresh token is invalid, sign out to clear local storage
        if (error.message.includes('refresh_token')) {
          supabase.auth.signOut();
        }
        setAuthView('signin');
        return;
      }
      
      if (!session) {
        setAuthView('signin');
      } else {
        setUser(session.user);
        fetchTotalActivity(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setAuthView('signin');
        setUser(null);
        setInteractions([]);
        setTotalActivity(0);
        setCurrentConversationId(null);
        setConversations([]);
      } else if (session) {
        setAuthView('home');
        setUser(session.user);
        fetchTotalActivity(session.user.id);
      } else {
        setAuthView('signin');
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
  const [prompt, setPrompt] = useState('');
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

  const isUnlimitedUser = user?.email === 'christporr@gmail.com';
  const isLimitReached = !isUnlimitedUser && totalActivity >= (4 + bonusQuota);

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
        
        // Force a re-check of the plan limit by slightly delaying the modal close
        // and ensuring the UI knows the quota has increased.
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
  const outputRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark';
    }
    return 'dark';
  });

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const isAnyLoading = interactions.some(i => i.loading);
  const placeholders = [
    "Generate Component: A modern login form",
    "Fix Code: My React useEffect bug",
    "Explain closures in JavaScript"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const suggestions = [
    { icon: <Code2 className="w-5 h-5 text-blue-500" />, text: "Demystify React's useEffect hook..." },
    { icon: <Terminal className="w-5 h-5 text-indigo-500" />, text: "Master the art of centering a div..." },
    { icon: <BrainCircuit className="w-5 h-5 text-purple-500" />, text: "Uncover the secrets of JavaScript closures..." },
    { icon: <Target className="w-5 h-5 text-cyan-500" />, text: "Build a responsive navigation bar..." }
  ];

  useEffect(() => {
    const updateGlow = () => {
      const dx1 = mouse.current.x - current1.current.x;
      const dy1 = mouse.current.y - current1.current.y;
      
      const dx2 = current1.current.x - current2.current.x;
      const dy2 = current1.current.y - current2.current.y;
      
      // Calculate velocity based on movement
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

      current1.current.x += dx1 * 0.15; // Fast follower (head)
      current1.current.y += dy1 * 0.15;
      
      current2.current.x += dx2 * 0.08; // Slow follower (tail)
      current2.current.y += dy2 * 0.08;

      // Stretch based on velocity
      const angle = Math.atan2(velocity.current.y, velocity.current.x);
      const stretch = 1 + Math.min(velocity.current.speed * 0.02, 0.5);
      const squeeze = 1 - Math.min(velocity.current.speed * 0.01, 0.2);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current1.current.x}px, ${current1.current.y}px, 0) rotate(${angle}rad) scale(${stretch}, ${squeeze})`;
      }
      if (glowRef2.current) {
        // Tail follows the head but stretches more
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

  const attemptFetch = async (currentPrompt: string, id: string, attempt: number = 1) => {
    try {
      const ai = getAI();
      
      // Attempt with the God-Tier 3.0 model first
      let result;
      try {
        result = await ai.models.generateContent({
          model: "gemini-3.0-flash",
          contents: [{ parts: [{ text: currentPrompt }] }],
          config: {
            systemInstruction: COACH_INSTRUCTIONS,
          },
        });
      } catch (v3Error) {
        console.warn("Gemini 3.0 not available, falling back to 2.0 Flash:", v3Error);
        // Fallback to the reliable 2.0 Flash
        result = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ parts: [{ text: currentPrompt }] }],
          config: {
            systemInstruction: COACH_INSTRUCTIONS,
          },
        });
      }

      const responseText = result.response.text();
      const parsedData = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
      
      if (parsedData.type === 'chat') {
        const safeResponse: AIResponse = {
          chatMessage: parsedData.message,
        };
        console.log("Parsed AI Chat Data:", safeResponse);
        try {
          await updateInteraction(id, safeResponse);
        } catch (dbErr) {
          console.warn('Could not update chat interaction in DB:', dbErr);
        }
        
        setInteractions(prev => prev.map(interaction => 
          interaction.id === id 
            ? { ...interaction, response: safeResponse, loading: false, statusMessage: null }
            : interaction
        ));
        return;
      }

      const safeResponse: AIResponse = {
        explanation: parsedData.explanation,
        html: parsedData.code?.html,
        css: parsedData.code?.css,
        javascript: parsedData.code?.js,
        logicBreakdown: parsedData.learning?.logic?.join('\n'),
        technicalWeakPoint: parsedData.learning?.mistake,
        drill: parsedData.learning?.practiceTask,
        nextSteps: parsedData.learning?.nextSteps,
      };

      console.log("Parsed AI Data:", safeResponse);

      try {
        await updateInteraction(id, safeResponse);
      } catch (dbErr) {
        console.warn('Could not update interaction in DB:', dbErr);
      }
      
      setInteractions(prev => prev.map(interaction => 
        interaction.id === id 
          ? { ...interaction, response: safeResponse, loading: false, statusMessage: null }
          : interaction
      ));
    } catch (err: any) {
      console.error('AI Error:', err);
      
      if (attempt === 1) {
        try {
          await updateInteraction(id, { statusMessage: "AI is warming up... please wait a moment ✨" });
        } catch (dbErr) {
          console.warn('Could not update status in DB:', dbErr);
        }
        
        setInteractions(prev => prev.map(interaction => 
          interaction.id === id 
            ? { ...interaction, statusMessage: "AI is warming up... please wait a moment ✨" }
            : interaction
        ));
        setTimeout(() => {
          attemptFetch(currentPrompt, id, 2);
        }, 3000);
      } else {
        try {
          await updateInteraction(id, { statusMessage: "Still connecting... try again in a few seconds", loading: false });
        } catch (dbErr) {
          console.warn('Could not update status in DB:', dbErr);
        }
        
        setInteractions(prev => prev.map(interaction => 
          interaction.id === id 
            ? { ...interaction, statusMessage: "Still connecting... try again in a few seconds", loading: false }
            : interaction
        ));
      }
    }
  };

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

      // Group by conversation_id and take the first prompt as title
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
    setPrompt('');
    setIsSidebarOpen(false);
    scrollToTool();
  };

  const handleSubmit = async (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const currentPrompt = promptOverride || prompt;
    if (!currentPrompt.trim()) return;

    if (!user) {
      setAuthView('signin');
      return;
    }

    // 1. Generate local ID and update UI INSTANTLY
    const convId = currentConversationId || crypto.randomUUID();
    const interactionId = crypto.randomUUID();
    
    const localInteraction: InteractionType = {
      id: interactionId,
      user_id: user.id,
      conversation_id: convId,
      prompt: currentPrompt.trim(),
      response: null,
      loading: true,
      statusMessage: 'Analyzing...',
      created_at: new Date().toISOString()
    };

    setInteractions(prev => [...prev, localInteraction]);
    setPrompt('');
    
    if (!currentConversationId) {
      setCurrentConversationId(convId);
    }

    // 2. Plan Limit Check (Free tier: 100 + bonusQuota generations)
    try {
      const { count, error } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (!isUnlimitedUser && count !== null && count >= (100 + bonusQuota)) {
        setShowPlanLimit(true);
        // Remove the local interaction if limit reached
        setInteractions(prev => prev.filter(i => i.id !== interactionId));
        return;
      }
    } catch (err) {
      console.error('Error checking plan limit:', err);
      if (!isUnlimitedUser && totalActivity >= (100 + bonusQuota)) {
        setShowPlanLimit(true);
        setInteractions(prev => prev.filter(i => i.id !== interactionId));
        return;
      }
    }

    // 3. Save to DB (Async, don't block AI call)
    createInteraction(user.id, convId, currentPrompt.trim(), interactionId).catch(err => {
      console.warn('Failed to save interaction to DB:', err);
    });

    // 4. Call AI
    try {
      const lowerPrompt = currentPrompt.toLowerCase();
      const demoKey = Object.keys(DEMO_RESPONSES).find(key => lowerPrompt.includes(key));
      
      if (demoMode && demoKey) {
        setTimeout(() => {
          setInteractions(prev => prev.map(interaction => 
            interaction.id === interactionId 
              ? { ...interaction, response: DEMO_RESPONSES[demoKey], loading: false }
              : interaction
          ));
          setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
        }, 800);
      } else {
        await attemptFetch(currentPrompt.trim(), interactionId, 1);
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
      }
    } catch (err) {
      console.error('Error in interaction flow:', err);
      setInteractions(prev => prev.map(interaction => 
        interaction.id === interactionId 
          ? { ...interaction, statusMessage: "Something went wrong. Please try again.", loading: false }
          : interaction
      ));
    }
  };

  const scrollToTool = () => {
    toolRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
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
          className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-sky-950 dark:text-slate-50 font-sans transition-colors duration-500 relative overflow-hidden selection:bg-blue-500/30"
        >
          
          {/* Background Layers */}
          <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,rgba(2,6,23,1)_100%)]" />
          
          <BackgroundSystem theme={theme} />

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
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sky-800 dark:text-cyan-100 shadow-sm"
                  aria-label="Open History"
                >
                  <History className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <VSprintLogo className="w-10 h-10" />
                  <span className="font-bold text-xl tracking-tight">
                    <span className="text-sky-500 dark:text-sky-400">V</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Sprint</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    {!isPresentationMode && (
                      <button 
                        onClick={() => setShowPlanLimit(true)}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium transition-all shadow-sm"
                      >
                        <Ticket className="w-4 h-4" />
                        Redeem
                      </button>
                    )}
                    <button 
                      onClick={startNewChat}
                      className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 transition-all text-sky-800 dark:text-cyan-100 shadow-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      New Chat
                    </button>
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
                <>
                  {/* Hero Section */}
              <section className="pt-20 pb-48 px-4 sm:px-6 md:px-10 text-center max-w-5xl mx-auto relative min-h-[80vh] flex flex-col justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(14,165,233,0.15)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(14,165,233,0.1)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={staggerContainer}
                  className="relative z-10"
                >
                  <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100/50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 text-sm font-medium mb-8 backdrop-blur-sm">
                    <VSprintLogo className="w-4 h-4" />
                    <span>Your AI-Powered Senior Developer Coach</span>
                  </motion.div>
                  <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight text-sky-600 dark:text-sky-400 leading-tight">
                    Master Coding at the <br className="hidden md:block" />Speed of Thought
                  </motion.h1>
                  <motion.p variants={itemVariants} className="text-lg sm:text-xl text-sky-500 dark:text-sky-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Break through coding blocks instantly. Get crystal-clear explanations, production-ready code, and targeted drills designed for deep mastery.
                  </motion.p>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={scrollToTool}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold text-lg shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95"
                    >
                      Start Learning <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                </motion.div>
              </section>

          {/* How It Works */}
          <section className="py-32 px-4 sm:px-6 md:px-10 bg-white/30 dark:bg-white/[0.02] backdrop-blur-3xl border-y border-slate-200/50 dark:border-white/5">
            <div className="max-w-6xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="text-center mb-16"
              >
                <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-sky-950 dark:text-cyan-50">How It Works</motion.h2>
                <motion.p variants={itemVariants} className="text-sky-800 dark:text-cyan-200/80">The three-step path to technical mastery.</motion.p>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Terminal, title: "1. Define Your Challenge", desc: "Type any coding problem or concept you're struggling with." },
                  { icon: BrainCircuit, title: "2. Intelligent Analysis", desc: "Our AI breaks down the concept into beginner-friendly terms." },
                  { icon: Target, title: "3. Active Mastery", desc: "Get code examples and 30-second drills to solidify your knowledge." }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                    className="p-8 rounded-3xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-black/20 hover:-translate-y-2 transition-transform duration-300"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-6">
                      <step.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-sky-950 dark:text-cyan-50">{step.title}</h3>
                    <p className="text-sky-800 dark:text-cyan-200/80 leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-32 px-4 sm:px-6 md:px-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={staggerContainer}
                >
                  <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-6 text-sky-950 dark:text-cyan-50">Everything you need to level up.</motion.h2>
                  <div className="space-y-6">
                    {[
                      { title: "Deep Code Insights", desc: "Plain English breakdowns of complex syntax." },
                      { title: "Precision Debugging", desc: "Learn the common pitfalls before you make them." },
                      { title: "Rapid-Fire Drills", desc: "Active recall exercises to build muscle memory." }
                    ].map((feature, i) => (
                      <motion.div variants={itemVariants} key={i} className="flex gap-4">
                        <div className="mt-1 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-sky-950 dark:text-cyan-50 mb-1">{feature.title}</h4>
                          <p className="text-sky-800 dark:text-cyan-200/80">{feature.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[2.5rem] blur-2xl opacity-20"></div>
                  <div className="relative bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl overflow-x-auto">
                    <div className="flex gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <pre className="text-sm font-mono text-blue-300">
                      <code>
                        <span className="text-purple-400">const</span> <span className="text-blue-300">learn</span> = <span className="text-purple-400">async</span> () =&gt; {'{\n'}
                        {'  '}await <span className="text-green-300">VSprint</span>.explain();{'\n'}
                        {'  '}await <span className="text-green-300">VSprint</span>.practice();{'\n'}
                        {'  '}return <span className="text-yellow-300">"Mastery"</span>;{'\n'}
                        {'}'}
                      </code>
                    </pre>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* About & Vision */}
          <section className="py-32 px-4 sm:px-6 md:px-10 bg-white/30 dark:bg-white/[0.02] backdrop-blur-3xl border-y border-slate-200/50 dark:border-white/5">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                <motion.div variants={itemVariants} className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-1 mb-6">
                  <div className="w-full h-full bg-sky-50 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-500" />
                  </div>
                </motion.div>
                <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4 text-sky-950 dark:text-cyan-50">Crafted by Christpor Rin</motion.h2>
                <motion.p variants={itemVariants} className="text-xl text-sky-800 dark:text-cyan-200/80 mb-8">Founder & Lead Architect</motion.p>
                <motion.div variants={itemVariants} className="bg-white/50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-xl">
                  <Rocket className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
                  <p className="text-lg text-sky-900 dark:text-cyan-100 leading-relaxed italic">
                    "I built VSprint because I remember how frustrating it was to learn coding from dry documentation. My vision is to help beginners understand coding deeply, making learning fast, powerful, and actually enjoyable."
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="py-32 px-4 sm:px-6 md:px-10">
            <div className="max-w-6xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="text-center mb-16"
              >
                <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-sky-950 dark:text-cyan-50">Trusted by the Developer Community</motion.h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: "Sarah J.", role: "Frontend Dev", text: "This is like having a senior dev sitting next to me. The drills are a game-changer." },
                  { name: "Mike T.", role: "Student", text: "Finally, explanations that actually make sense. I learned React hooks in 10 minutes." },
                  { name: "Elena R.", role: "Backend Dev", text: "The 'Watch Out' section saves me hours of debugging. Highly recommended." }
                ].map((review, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                    className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-lg"
                  >
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-sky-900 dark:text-cyan-100 mb-6">"{review.text}"</p>
                    <div>
                      <p className="font-semibold text-sky-950 dark:text-cyan-50">{review.name}</p>
                      <p className="text-sm text-slate-500">{review.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-32 px-4 sm:px-6 md:px-10 bg-white/30 dark:bg-white/[0.02] backdrop-blur-3xl border-y border-slate-200/50 dark:border-white/5">
            <div className="max-w-5xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="text-center mb-16"
              >
                <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-sky-950 dark:text-cyan-50">Flexible Plans for Every Developer</motion.h2>
              </motion.div>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="p-8 rounded-[2rem] bg-white/60 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-xl"
                >
                  <h3 className="text-2xl font-bold text-sky-950 dark:text-cyan-50 mb-2">Essentials</h3>
                  <div className="text-4xl font-bold text-sky-950 dark:text-cyan-50 mb-6">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                  <ul className="space-y-4 mb-8">
                    {['Basic explanations', 'Standard code snippets', 'Community support'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sky-900 dark:text-cyan-100">
                        <CheckCircle2 className="w-5 h-5 text-blue-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 hover:shadow-lg hover:shadow-sky-500/10 text-sky-950 dark:text-cyan-50 font-semibold transition-all">
                    Current Plan
                  </button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative p-8 rounded-[2rem] bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-zinc-900/40 border border-blue-200 dark:border-blue-500/30 backdrop-blur-xl shadow-2xl shadow-blue-500/10"
                >
                  <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                  <h3 className="text-2xl font-bold text-sky-950 dark:text-cyan-50 mb-2">Elite</h3>
                  <div className="text-4xl font-bold text-sky-950 dark:text-cyan-50 mb-6">$19<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                  <ul className="space-y-4 mb-8">
                    {['Advanced explanations', 'Complex drills', 'Priority AI processing', 'Save history'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sky-900 dark:text-cyan-100">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95">
                    Upgrade to Elite
                  </button>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Dashboard Stats (Only for logged in users) */}
          {user && (
            <section className="pt-24 pb-12 px-4 sm:px-6 md:px-10">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div className="p-8 rounded-3xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-black/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Activity</h3>
                        <div className="text-3xl font-bold text-sky-950 dark:text-cyan-50">
                          {totalActivity}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-sky-800 dark:text-cyan-200/80">
                      High-Density Component Generator and Precision Debugger usage.
                    </p>
                  </div>
                  
                  <div className="p-8 rounded-3xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-black/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Mastery Level</h3>
                        <div className="text-3xl font-bold text-sky-950 dark:text-cyan-50">
                          Lvl 4
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-sky-800 dark:text-cyan-200/80">
                      Keep practicing to reach the next level.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-black/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                        <Rocket className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Current Streak</h3>
                        <div className="text-3xl font-bold text-sky-950 dark:text-cyan-50">
                          7 Days
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-sky-800 dark:text-cyan-200/80">
                      You're on fire! Don't break the streak.
                    </p>
                  </div>
                </motion.div>
              </div>
            </section>
          )}

          {/* AI Tool Section */}
          <section ref={toolRef} className="py-24 md:py-48 px-4 sm:px-6 md:px-10 relative">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-6 text-sky-950 dark:text-cyan-50">Experience the Future of Learning.</motion.h2>
              <motion.p variants={itemVariants} className="text-lg text-sky-800 dark:text-cyan-200/80">Input your challenge and witness instant clarity.</motion.p>
            </motion.div>

            {/* Input Section */}
            <div className="max-w-3xl mx-auto w-full mb-12">
              <form onSubmit={handleSubmit} className={`relative group transition-opacity duration-500 ${(isAnyLoading || totalActivity >= (4 + bonusQuota)) ? 'opacity-60' : 'opacity-100'}`}>
                <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-[32px] blur transition duration-500 ${prompt ? 'opacity-30' : 'opacity-20 animate-pulse group-hover:opacity-30'}`}></div>
                <div className="relative bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[32px] p-2 shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:bg-white dark:focus-within:bg-zinc-900/80">
                  <div className="relative flex items-end gap-2">
                    <textarea
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                      }}
                      disabled={totalActivity >= (4 + bonusQuota)}
                      placeholder={totalActivity >= (4 + bonusQuota) ? "Free Vibe limit reached. Upgrade to Pro for unlimited high-density logic." : placeholders[placeholderIndex]}
                      className="w-full bg-transparent text-sky-950 dark:text-cyan-50 placeholder:text-slate-400 dark:placeholder:text-zinc-500 resize-none outline-none px-6 py-4 min-h-[60px] max-h-[200px] transition-all duration-500 disabled:cursor-not-allowed"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (totalActivity < (4 + bonusQuota)) handleSubmit(e);
                          else setShowPlanLimit(true);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isAnyLoading || !prompt.trim() || totalActivity >= (4 + bonusQuota)}
                      onClick={(e) => {
                        if (totalActivity >= (4 + bonusQuota)) {
                          e.preventDefault();
                          setShowPlanLimit(true);
                        }
                      }}
                      className="mb-2 mr-2 p-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                    >
                      {isAnyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {totalActivity >= (4 + bonusQuota) && (
                  <p className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 animate-pulse">
                    Free Vibe limit reached. Upgrade to Pro for unlimited high-density logic.
                  </p>
                )}
              </form>
            </div>

            {/* Output Section */}
            <div className="max-w-3xl mx-auto space-y-8 pb-12 w-full mt-12">
              {/* Demo Mode Badge */}
              {demoMode && interactions.length > 0 && (
                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex justify-center mb-8">
                  <div className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-xs font-mono text-blue-700 dark:text-blue-300 flex items-center gap-2 shadow-sm">
                    <Zap className="w-3.5 h-3.5" />
                    DEMO MODE ACTIVE
                  </div>
                </motion.div>
              )}

              {interactions.map((interaction, index) => (
                <InteractionItem 
                  key={interaction.id}
                  interaction={interaction}
                  isLatest={index === interactions.length - 1}
                  onSubmit={handleSubmit}
                />
              ))}

              <AnimatePresence>
                {interactions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-3xl mx-auto text-center mt-12 text-slate-500 dark:text-zinc-400"
                  >
                    <div className="flex flex-col items-center gap-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-200">
                        What shall we build together today?
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            disabled={totalActivity >= (4 + bonusQuota)}
                            onClick={() => {
                              if (totalActivity >= (4 + bonusQuota)) {
                                setShowPlanLimit(true);
                                return;
                              }
                              setPrompt(suggestion.text);
                              handleSubmit(undefined, suggestion.text);
                            }}
                            className="flex items-center gap-4 px-5 py-4 text-sm text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 text-left group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                          >
                            <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg group-hover:scale-110 transition-transform">
                              {suggestion.icon}
                            </div>
                            <span className="font-medium">{suggestion.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={outputRef} />
            </div>
          </section>

          {/* Connect with Me */}
          <section className="py-32 px-4 sm:px-6 md:px-10 bg-white/30 dark:bg-white/[0.02] backdrop-blur-3xl border-y border-slate-200/50 dark:border-white/5">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="text-center mb-16"
              >
                <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-sky-950 dark:text-cyan-50">Connect with Me</motion.h2>
                <motion.p variants={itemVariants} className="text-lg text-sky-700 dark:text-sky-200/80 max-w-2xl mx-auto">
                  Interested in VSprint or want to collaborate? Feel free to reach out.
                </motion.p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="grid md:grid-cols-2 gap-8 items-center bg-white/60 dark:bg-zinc-900/40 p-8 md:p-12 rounded-[2rem] border border-slate-200/50 dark:border-white/10 backdrop-blur-xl shadow-xl"
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-6">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-sky-950 dark:text-cyan-50 mb-2">Christpor Rin</h3>
                  <p className="text-sky-800 dark:text-cyan-100/80 leading-relaxed mb-8">
                    Solo developer building VSprint to help beginners learn faster and understand deeply.
                  </p>
                </div>

                <div className="space-y-4">
                  <a 
                    href="mailto:porkh377@gmail.com"
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all group hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-500 dark:text-zinc-400">Email</div>
                      <div className="text-sky-950 dark:text-cyan-50 font-semibold truncate">porkh377@gmail.com</div>
                    </div>
                  </a>

                  <a 
                    href="https://t.me/Christpor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all group hover:shadow-lg hover:shadow-cyan-500/10"
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Send className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-500 dark:text-zinc-400">Telegram</div>
                      <div className="text-sky-950 dark:text-cyan-50 font-semibold truncate">@Christpor</div>
                    </div>
                  </a>
                </div>
              </motion.div>
            </div>
          </section>
                </>
              )}
            </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-white/5 py-12 px-4 bg-white/10 dark:bg-black/10 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <VSprintLogo className="w-6 h-6" />
              <span className="font-bold text-lg text-sky-950 dark:text-cyan-50">
                <span className="text-sky-500 dark:text-sky-400">V</span>Sprint
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-cyan-200/80">
              <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
              <a href="mailto:porkh377@gmail.com" className="hover:text-blue-500 transition-colors">Email</a>
              <a href="https://t.me/Christpor" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Telegram</a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-slate-500 dark:text-zinc-500">Demo Mode:</span>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${demoMode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-zinc-700'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-slate-400 dark:text-sky-800">
            &copy; 2026 VSprint by Christpor Rin. All rights reserved.
          </div>
        </footer>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
