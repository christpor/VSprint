import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, Zap, Terminal, ArrowRight, Code2, BrainCircuit, Target, Rocket } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { DEMO_RESPONSES } from '../demoData';
import { InteractionItem } from '../components/InteractionItem';
import { AIResponse, InteractionType, Conversation } from '../types';
import { supabase } from '../supabaseClient';
import { getInteractions, createInteraction, updateInteraction } from '../services/interactionService';
import type { User as FirebaseUser } from 'firebase/auth';

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

interface ChatPageProps {
  user: FirebaseUser;
  totalActivity: number;
  setTotalActivity: React.Dispatch<React.SetStateAction<number>>;
  bonusQuota: number;
  setBonusQuota: React.Dispatch<React.SetStateAction<number>>;
  showPlanLimit: boolean;
  setShowPlanLimit: React.Dispatch<React.SetStateAction<boolean>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  currentConversationId: string | null;
  setCurrentConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  interactions: InteractionType[];
  setInteractions: React.Dispatch<React.SetStateAction<InteractionType[]>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPresentationMode: boolean;
  demoMode: boolean;
  toolRef: React.RefObject<HTMLDivElement | null>;
  scrollToTool: () => void;
}

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

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export function ChatPage({
  user,
  totalActivity,
  setTotalActivity,
  bonusQuota,
  setBonusQuota,
  showPlanLimit,
  setShowPlanLimit,
  conversations,
  setConversations,
  currentConversationId,
  setCurrentConversationId,
  interactions,
  setInteractions,
  isSidebarOpen,
  setIsSidebarOpen,
  isPresentationMode,
  demoMode,
  toolRef,
  scrollToTool,
}: ChatPageProps) {
  const [prompt, setPrompt] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const isAnyLoading = interactions.some(i => i.loading);

  const isUnlimitedUser = user?.email === 'christporr@gmail.com' || user?.email === 'porkh377@gmail.com';

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
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

  const suggestions = [
    { icon: <Code2 className="w-5 h-5 text-blue-500" />, text: "Demystify React's useEffect hook..." },
    { icon: <Terminal className="w-5 h-5 text-indigo-500" />, text: "Master the art of centering a div..." },
    { icon: <BrainCircuit className="w-5 h-5 text-purple-500" />, text: "Uncover the secrets of JavaScript closures..." },
    { icon: <Target className="w-5 h-5 text-cyan-500" />, text: "Build a responsive navigation bar..." }
  ];

  const attemptFetch = async (currentPrompt: string, id: string, attempt: number = 1) => {
    try {
      const ai = getAI();
      
      let result;
      try {
        result = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ parts: [{ text: currentPrompt }] }],
          config: {
            systemInstruction: COACH_INSTRUCTIONS,
          },
        });
      } catch (primaryError) {
        console.warn("Gemini 2.0 Flash failed (likely quota), trying 1.5 Pro:", primaryError);
        result = await ai.models.generateContent({
          model: "gemini-1.5-pro",
          contents: [{ parts: [{ text: currentPrompt }] }],
          config: {
            systemInstruction: COACH_INSTRUCTIONS,
          },
        });
      }

      const responseText = result.text || (typeof result.response?.text === 'function' ? result.response.text() : '');
      
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("AI did not return a valid JSON object");
      }
      
      const jsonString = responseText.substring(jsonStart, jsonEnd + 1);
      const parsedData = JSON.parse(jsonString);
      
      if (parsedData.type === 'chat') {
        const safeResponse: AIResponse = {
          chatMessage: parsedData.message,
        };
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

  const handleSubmit = async (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const currentPrompt = promptOverride || prompt;
    if (!currentPrompt.trim()) return;

    const convId = currentConversationId || crypto.randomUUID();
    const interactionId = crypto.randomUUID();

    const localInteraction: InteractionType = {
      id: interactionId,
      user_id: user.uid,
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

    // Plan Limit Check
    try {
      const { count, error } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.uid);
      
      if (error) throw error;
      
      if (!isUnlimitedUser && count !== null && count >= (100 + bonusQuota)) {
        setShowPlanLimit(true);
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

    // Save to DB
    createInteraction(user.uid, convId, currentPrompt.trim(), interactionId).catch(err => {
      console.warn('Failed to save interaction to DB:', err);
    });

    // Call AI
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

  return (
    <>
      {/* Dashboard Stats */}
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
    </>
  );
}
