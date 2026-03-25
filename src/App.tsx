import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Loader2, Sparkles, AlertTriangle, Zap, Terminal, Check, Copy, Sun, Moon, ArrowRight, Code2, BrainCircuit, Target, User, Rocket, Star, CheckCircle2, Mail, Send, Settings, Play, ExternalLink, LogOut, MessageSquare, Plus, History, Menu, X, Ticket } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { DEMO_RESPONSES } from './demoData';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AIResponse {
  explanation?: string;
  html?: string;
  css?: string;
  javascript?: string;
  logicBreakdown?: string;
  technicalWeakPoint?: string;
  drill?: string;
  chatMessage?: string;
  nextSteps?: string[];
}

export interface InteractionType {
  id: string;
  user_id: string;
  conversation_id: string;
  prompt: string;
  response: AIResponse | null;
  loading: boolean;
  statusMessage: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const LivePreview = ({ html, css, js }: { html?: string, css?: string, js?: string }) => {
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 20px;
            color: #1e293b;
            line-height: 1.5;
          }
          ${css || ''}
        </style>
      </head>
      <body>
        ${html || ''}
        <script>
          try {
            ${js || ''}
          } catch (err) {
            console.error('Live Preview Error:', err);
            document.body.innerHTML += '<div style="color: red; margin-top: 20px; font-family: monospace;">Error: ' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full min-h-[400px] bg-white rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner">
      <iframe
        srcDoc={content}
        title="Live Preview"
        className="w-full h-full min-h-[400px] border-none"
        sandbox="allow-scripts"
      />
    </div>
  );
};

const InteractionItem = ({ 
  interaction, 
  isLatest, 
  onSubmit 
}: { 
  interaction: InteractionType, 
  isLatest: boolean,
  onSubmit: (e?: React.FormEvent, promptOverride?: string) => Promise<void>
}) => {
  const [displayedExplanation, setDisplayedExplanation] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [revealedSections, setRevealedSections] = useState({
    html: false,
    css: false,
    js: false,
    logic: false,
    weakPoint: false,
    drill: false
  });
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'preview'>('html');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const htmlRef = useRef<HTMLDivElement>(null);
  const cssRef = useRef<HTMLDivElement>(null);
  const jsRef = useRef<HTMLDivElement>(null);
  const logicRef = useRef<HTMLDivElement>(null);
  const weakPointRef = useRef<HTMLDivElement>(null);
  const drillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (interaction.response) {
      if (interaction.response.html || interaction.response.css || interaction.response.javascript) {
        setActiveTab('preview'); // Default to preview if code exists
      }

      if (interaction.loading) {
        setDisplayedExplanation("");
        setIsTyping(true);
        setRevealedSections({ 
          html: false, 
          css: false, 
          js: false, 
          logic: false, 
          weakPoint: false, 
          drill: false 
        });

        const text = interaction.response.explanation || interaction.response.chatMessage || "";
        let i = 0;
        let lastTime = performance.now();
        let animationFrameId: number;

        const typeChar = (time: number) => {
          const elapsed = time - lastTime;
          if (elapsed > 15) {
            const charsToAdd = Math.max(1, Math.floor(elapsed / 15));
            i += charsToAdd;
            setDisplayedExplanation(text.slice(0, i));
            lastTime = time - (elapsed % 15);
          }
          if (i < text.length) {
            animationFrameId = requestAnimationFrame(typeChar);
          } else {
            setIsTyping(false);
            setDisplayedExplanation(text);
          }
        };
        
        animationFrameId = requestAnimationFrame(typeChar);

        const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
          if (isLatest && ref.current) {
            const yOffset = -100;
            const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        };

        const t1 = setTimeout(() => {
          setRevealedSections(prev => ({ ...prev, html: true }));
          setTimeout(() => scrollToRef(htmlRef), 50);
        }, 400);

        const t2 = setTimeout(() => {
          setRevealedSections(prev => ({ ...prev, css: true }));
        }, 800);

        const t3 = setTimeout(() => {
          setRevealedSections(prev => ({ ...prev, js: true }));
        }, 1200);

        const t4 = setTimeout(() => {
          setRevealedSections(prev => ({ ...prev, logic: true }));
          setTimeout(() => scrollToRef(logicRef), 50);
        }, 1800);

        const t5 = setTimeout(() => {
          setRevealedSections(prev => ({ ...prev, weakPoint: true }));
        }, 2200);

        const t6 = setTimeout(() => {
          setRevealedSections(prev => ({ ...prev, drill: true }));
        }, 2600);

        return () => {
          cancelAnimationFrame(animationFrameId);
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
          clearTimeout(t4);
          clearTimeout(t5);
          clearTimeout(t6);
        };
      } else {
        // Not loading (from history), show everything immediately
        setDisplayedExplanation(interaction.response.explanation || interaction.response.chatMessage || "");
        setIsTyping(false);
        setRevealedSections({ 
          html: true, 
          css: true, 
          js: true, 
          logic: true, 
          weakPoint: true, 
          drill: true 
        });
      }
    }
  }, [interaction.response, isLatest, interaction.loading]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* User Prompt */}
      <div className="flex justify-end w-full">
        <div className="bg-blue-600 text-white px-6 py-4 rounded-3xl rounded-tr-sm max-w-[85%] shadow-md">
          <p className="text-base leading-relaxed">{interaction.prompt}</p>
        </div>
      </div>

      {/* AI Response or Loading */}
      <div className="flex justify-start w-full">
        <motion.div layout className="w-full max-w-[95%]">
          {interaction.loading && !interaction.statusMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="p-6 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-3xl rounded-tl-sm flex items-center gap-4 backdrop-blur-xl shadow-sm"
            >
              <div className="flex space-x-1.5 items-center justify-center w-8 h-8">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-lg font-medium text-sky-900 dark:text-cyan-100 flex items-center">
                <span className="animate-pulse">VSprint is thinking</span>
                <span className="inline-flex w-6 text-left ml-0.5">
                  <span className="animate-pulse" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-pulse" style={{ animationDelay: '300ms' }}>.</span>
                  <span className="animate-pulse" style={{ animationDelay: '600ms' }}>.</span>
                </span>
              </p>
            </motion.div>
          )}

          {interaction.statusMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="p-6 bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-3xl rounded-tl-sm flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-sm"
            >
              <div className="w-12 h-12 bg-blue-100/50 dark:bg-blue-500/20 rounded-full flex items-center justify-center mb-4 relative">
                {interaction.loading ? (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                  </>
                ) : (
                  <Loader2 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              <p className="text-lg font-medium text-sky-900 dark:text-cyan-100 mb-6 animate-pulse">
                {interaction.statusMessage}
              </p>
            </motion.div>
          )}

          {interaction.response && !interaction.loading && (
            <motion.div
              layout
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="space-y-6 w-full"
            >
              {interaction.response.chatMessage ? (
                <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-3xl rounded-tl-sm p-6 backdrop-blur-xl shadow-sm">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
                    {displayedExplanation}
                    {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-slate-400 animate-pulse align-middle" />}
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* 💡 Explanation */}
                  <motion.div layout variants={itemVariants} className="bg-blue-50/80 dark:bg-blue-900/10 backdrop-blur-xl border border-blue-100/50 dark:border-blue-800/20 rounded-3xl rounded-tl-sm p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🧠</span>
                      <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Explanation</h2>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                      {displayedExplanation}
                      {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-slate-400 animate-pulse align-middle" />}
                    </p>
                  </motion.div>

                  {/* 💻 Code Sections */}
                  <div className="space-y-4">
                    {(interaction.response.html || interaction.response.css || interaction.response.javascript) && (
                      <motion.div layout variants={itemVariants} className="bg-[#0f172a] border border-slate-800 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800">
                          <div className="flex gap-4">
                            {(interaction.response.html || interaction.response.css || interaction.response.javascript) && (
                              <button 
                                onClick={() => setActiveTab('preview')}
                                className={`text-xs font-mono transition-colors py-2 border-b-2 flex items-center gap-2 ${activeTab === 'preview' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                              >
                                <Play className="w-3 h-3" />
                                PREVIEW
                              </button>
                            )}
                            {interaction.response.html && (
                              <button 
                                onClick={() => setActiveTab('html')}
                                className={`text-xs font-mono transition-colors py-2 border-b-2 ${activeTab === 'html' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                              >
                                HTML
                              </button>
                            )}
                            {interaction.response.css && (
                              <button 
                                onClick={() => setActiveTab('css')}
                                className={`text-xs font-mono transition-colors py-2 border-b-2 ${activeTab === 'css' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                              >
                                CSS
                              </button>
                            )}
                            {interaction.response.javascript && (
                              <button 
                                onClick={() => setActiveTab('js')}
                                className={`text-xs font-mono transition-colors py-2 border-b-2 ${activeTab === 'js' ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                              >
                                JS
                              </button>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              if (activeTab === 'preview') return;
                              const code = activeTab === 'html' ? interaction.response!.html : activeTab === 'css' ? interaction.response!.css : interaction.response!.javascript;
                              copyToClipboard(code || '', activeTab);
                            }} 
                            className={`text-slate-400 hover:text-white transition-colors ${activeTab === 'preview' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                          >
                            {copiedIndex === activeTab ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className={`p-4 overflow-x-auto text-sm min-h-[100px] ${activeTab === 'preview' ? 'bg-white' : ''}`}>
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeTab}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="h-full"
                            >
                              {activeTab === 'preview' ? (
                                <LivePreview 
                                  html={interaction.response.html} 
                                  css={interaction.response.css} 
                                  js={interaction.response.javascript} 
                                />
                              ) : (
                                <SyntaxHighlighter 
                                  language={activeTab === 'js' ? 'javascript' : activeTab} 
                                  style={vscDarkPlus} 
                                  customStyle={{ 
                                    margin: 0, 
                                    padding: 0, 
                                    background: 'transparent',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                    minWidth: '100%'
                                  }}
                                >
                                  {(activeTab === 'html' ? interaction.response.html : activeTab === 'css' ? interaction.response.css : interaction.response.javascript) || ''}
                                </SyntaxHighlighter>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              )}

              {/* Run in CodePen Button */}
              {interaction.response && (interaction.response.html || interaction.response.css || interaction.response.javascript) && (
                <motion.div variants={itemVariants} className="flex flex-wrap justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      const { html, css, javascript } = interaction.response!;
                      const fullCode = `
<!-- HTML -->
${html || ''}

<style>
${css || ''}
</style>

<script>
${javascript || ''}
</script>
                      `.trim();
                      copyToClipboard(fullCode, 'all');
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-all w-full sm:w-auto justify-center"
                  >
                    {copiedIndex === 'all' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedIndex === 'all' ? 'Copied All' : 'Copy All Code'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const { html, css, javascript } = interaction.response!;
                      const data = JSON.stringify({
                        title: "VSprint Generated Code",
                        html: html || "",
                        css: css || "",
                        js: javascript || "",
                        editors: "111"
                      });
                      const form = document.createElement('form');
                      form.action = 'https://codepen.io/pen/define';
                      form.method = 'POST';
                      form.target = '_blank';
                      const input = document.createElement('input');
                      input.type = 'hidden';
                      input.name = 'data';
                      input.value = data;
                      form.appendChild(input);
                      document.body.appendChild(form);
                      form.submit();
                      document.body.removeChild(form);
                    }}
                    className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden w-full sm:w-auto justify-center"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run in CodePen</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </button>
                </motion.div>
              )}
              
              {/* 🧩 Teaching Sections */}
              {!interaction.response.chatMessage && (
                <motion.div layout className="space-y-6">
                  {revealedSections.logic && interaction.response.logicBreakdown && (
                  <motion.div layout ref={logicRef} variants={itemVariants} className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">🧠</span>
                      <h3 className="text-lg font-semibold text-sky-950 dark:text-cyan-50">How it actually works (step-by-step)</h3>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {interaction.response.logicBreakdown}
                    </div>
                  </motion.div>
                )}

                {revealedSections.weakPoint && interaction.response.technicalWeakPoint && (
                  <motion.div layout ref={weakPointRef} variants={itemVariants} className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">⚠️</span>
                      <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">Watch out (common beginner mistake)</h3>
                    </div>
                    <div className="text-amber-800/80 dark:text-amber-200/80 text-sm leading-relaxed whitespace-pre-wrap">
                      {interaction.response.technicalWeakPoint}
                    </div>
                  </motion.div>
                )}

                {revealedSections.drill && interaction.response.drill && (
                  <motion.div layout className="space-y-6">
                    <motion.div layout ref={drillRef} variants={itemVariants} className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">⚡</span>
                        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">Try this (30 seconds)</h3>
                      </div>
                      <div className="text-emerald-800/80 dark:text-emerald-200/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {interaction.response.drill}
                      </div>
                    </motion.div>
                    
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="flex items-center justify-center gap-2 py-4 px-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">Lesson complete! You're doing great.</span>
                    </motion.div>

                    {interaction.response.nextSteps && interaction.response.nextSteps.length > 0 && (
                      <motion.div 
                        layout
                        variants={itemVariants}
                        className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2 mb-4 text-slate-400 dark:text-slate-500">
                          <ArrowRight className="w-4 h-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Next Steps</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {interaction.response.nextSteps.map((step, idx) => (
                            <button
                              key={idx}
                              onClick={() => onSubmit(undefined, step)}
                              className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {step}
                              </span>
                              <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>

    {/* Divider */}
    {!isLatest && <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent my-8" />}
  </div>
);
};

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  return new GoogleGenAI({ apiKey });
};

const DEBUG = false;

const BackgroundSystem = ({ theme }: { theme: string }) => {
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
  }, [isMobile]);

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

const VSprintLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <filter id="vGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Energy Trail */}
    <path 
      d="M12 22L8 14L12 16L16 14L12 22Z" 
      fill="url(#vGrad)" 
      opacity="0.4"
      filter="url(#vGlow)"
    />
    {/* Main V Shape */}
    <path 
      d="M12 20L3 4H7L12 15L17 4H21L12 20Z" 
      fill="url(#vGrad)" 
      filter="url(#vGlow)"
    />
    {/* Rocket Core */}
    <path 
      d="M12 15L10 11L12 9L14 11L12 15Z" 
      fill="white" 
      opacity="0.9"
    />
  </svg>
);

const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
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
                  You don’t need to memorize code
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
                  You just need to understand it
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAuthView('signin');
      } else {
        setUser(session.user);
        fetchTotalActivity(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthView('signin');
        setUser(null);
        setInteractions([]);
        setTotalActivity(0);
      } else {
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

  const VALID_CODES: Record<string, number> = {
    'VS-PR-2026-77': 50,
    'DEMO-ACTIVE-99': 20,
    'TEACHER-GIFT-26': 100,
    'BETA-UNLOCK-55': 10,
    'VSPRINT-SECRET-X': 200
  };

  const handleRedeem = () => {
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

    if (VALID_CODES[code]) {
      const bonus = VALID_CODES[code];
      const newQuota = bonusQuota + bonus;
      setBonusQuota(newQuota);
      setUsedCodes(prev => [...prev, code]);
      localStorage.setItem('vprint_bonus_quota', newQuota.toString());
      localStorage.setItem('vprint_used_codes', JSON.stringify([...usedCodes, code]));
      setRedeemSuccess(`Successfully unlocked ${bonus} more answers!`);
      setRedeemCodeInput('');
      setTimeout(() => {
        setShowPlanLimit(false);
        setRedeemSuccess('');
      }, 2000);
    } else {
      setRedeemError('Invalid code. Please check and try again.');
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
    { icon: <Code2 className="w-5 h-5 text-blue-500" />, text: "Generate Component: Modern Login" },
    { icon: <Terminal className="w-5 h-5 text-indigo-500" />, text: "Fix Code: React useEffect bug" },
    { icon: <BrainCircuit className="w-5 h-5 text-purple-500" />, text: "Explain closures in JavaScript" },
    { icon: <Target className="w-5 h-5 text-cyan-500" />, text: "How do I center a div?" }
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
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: currentPrompt }] }],
        config: {
          systemInstruction: `
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
`,
        },
      });

      const text = result.text;
      if (!text) throw new Error("AI returned an empty response");

      const parsedData = JSON.parse(text.replace(/```json\n/g, '').replace(/```/g, ''));
      
      if (parsedData.type === 'chat') {
        const safeResponse: AIResponse = {
          chatMessage: parsedData.message,
        };
        console.log("Parsed AI Chat Data:", safeResponse);
        await updateInteraction(id, safeResponse);
        return;
      }

      const safeResponse: AIResponse = {
        explanation: parsedData.explanation,
        html: parsedData.code.html,
        css: parsedData.code.css,
        javascript: parsedData.code.js,
        logicBreakdown: parsedData.learning.logic.join('\n'),
        technicalWeakPoint: parsedData.learning.mistake,
        drill: parsedData.learning.practiceTask,
        nextSteps: parsedData.learning.nextSteps,
      };

      console.log("Parsed AI Data:", safeResponse);

      await updateInteraction(id, safeResponse);
      setInteractions(prev => prev.map(interaction => 
        interaction.id === id 
          ? { ...interaction, response: safeResponse, loading: false, statusMessage: null }
          : interaction
      ));
    } catch (err: any) {
      console.error('AI Error:', err);
      
      if (attempt === 1) {
        await updateInteraction(id, { statusMessage: "AI is warming up... please wait a moment ✨" });
        setInteractions(prev => prev.map(interaction => 
          interaction.id === id 
            ? { ...interaction, statusMessage: "AI is warming up... please wait a moment ✨" }
            : interaction
        ));
        setTimeout(() => {
          attemptFetch(currentPrompt, id, 2);
        }, 3000);
      } else {
        await updateInteraction(id, { statusMessage: "Still connecting... try again in a few seconds", loading: false });
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
    if (!currentPrompt.trim() || !user) return;

    // Plan Limit Check (Free tier: 4 + bonusQuota generations)
    try {
      const { count, error } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (count !== null && count >= (4 + bonusQuota)) {
        setShowPlanLimit(true);
        return;
      }
    } catch (err) {
      console.error('Error checking plan limit:', err);
      if (totalActivity >= (4 + bonusQuota)) {
        setShowPlanLimit(true);
        return;
      }
    }

    const convId = currentConversationId || crypto.randomUUID();
    const newInteraction = await createInteraction(user.id, convId, currentPrompt.trim());

    if (!currentConversationId) {
      setCurrentConversationId(convId);
      fetchConversations(); // Refresh sidebar
    }

    setInteractions(prev => [...prev, { ...newInteraction, loading: true, statusMessage: 'Analyzing...' }]);
    setPrompt(''); 

    const lowerPrompt = currentPrompt.toLowerCase();
    const demoKey = Object.keys(DEMO_RESPONSES).find(key => lowerPrompt.includes(key));
    
    if (demoMode && demoKey) {
      setTimeout(() => {
        setInteractions(prev => prev.map(interaction => 
          interaction.id === newInteraction.id 
            ? { ...interaction, response: DEMO_RESPONSES[demoKey], loading: false }
            : interaction
        ));
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
      }, 800);
    } else {
      await attemptFetch(currentPrompt.trim(), newInteraction.id, 1);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
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
                      {totalActivity >= (4 + bonusQuota) ? "Free Vibe limit reached." : "Redeem Bonus Quota"}
                    </h2>
                    
                    <p className="text-lg text-sky-800 dark:text-cyan-200/80 mb-8 leading-relaxed">
                      {totalActivity >= (4 + bonusQuota) 
                        ? "Unlock unlimited 30-Second Practice and Senior Coach insights."
                        : "Enter a presentation or bonus code to unlock more AI generations."}
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
            <AnimatePresence>
              {isSidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
                  />
                  <motion.aside
                    initial={{ x: -300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    className="fixed top-0 left-0 h-full w-[280px] bg-white/80 dark:bg-zinc-900/90 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 z-[70] shadow-2xl flex flex-col"
                  >
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <VSprintLogo className="w-8 h-8" />
                        <span className="font-bold text-lg tracking-tight dark:text-white">History</span>
                      </div>
                      <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-4">
                      <button
                        onClick={startNewChat}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
                      >
                        <Plus className="w-5 h-5" />
                        New Chat
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                      {conversations.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 dark:text-zinc-500 text-sm">
                          No history yet. Start a new chat!
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => {
                              setCurrentConversationId(conv.id);
                              setIsSidebarOpen(false);
                              scrollToTool();
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${
                              currentConversationId === conv.id
                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20'
                                : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 border border-transparent'
                            }`}
                          >
                            <MessageSquare className={`w-4 h-4 ${currentConversationId === conv.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'}`} />
                            <span className="truncate text-sm font-medium">{conv.title}</span>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-white/10 space-y-4">
                      <button 
                        onClick={() => {
                          setShowPlanLimit(true);
                          setIsSidebarOpen(false);
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold transition-all flex items-center justify-center gap-2 group"
                      >
                        <Ticket className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Redeem Code
                      </button>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>{user?.email}</span>
                      </div>
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

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
                    <button 
                      onClick={() => setShowPlanLimit(true)}
                      className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium transition-all shadow-sm"
                    >
                      <Ticket className="w-4 h-4" />
                      Redeem
                    </button>
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
                    <span>Your Senior Developer Coach</span>
                  </motion.div>
                  <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight text-sky-600 dark:text-sky-400 leading-tight">
                    Learn to Code at the <br className="hidden md:block" />Speed of Thought
                  </motion.h1>
                  <motion.p variants={itemVariants} className="text-lg sm:text-xl text-sky-500 dark:text-sky-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Stop getting stuck. Ask any coding question and get a simple explanation, clean code, and quick drills to lock it in your memory forever.
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
                <motion.p variants={itemVariants} className="text-sky-800 dark:text-cyan-200/80">Three simple steps to mastering any concept.</motion.p>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Terminal, title: "1. Ask a Question", desc: "Type any coding problem or concept you're struggling with." },
                  { icon: BrainCircuit, title: "2. AI Analyzes", desc: "Our AI breaks down the concept into beginner-friendly terms." },
                  { icon: Target, title: "3. Practice & Master", desc: "Get code examples and 30-second drills to solidify your knowledge." }
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
                      { title: "Code Explanation", desc: "Plain English breakdowns of complex syntax." },
                      { title: "Technical Weak Point", desc: "Learn the common pitfalls before you make them." },
                      { title: "30-Second Drill", desc: "Active recall exercises to build muscle memory." }
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
                <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4 text-sky-950 dark:text-cyan-50">Meet Christpor Rin</motion.h2>
                <motion.p variants={itemVariants} className="text-xl text-sky-800 dark:text-cyan-200/80 mb-8">Solo Developer & Creator</motion.p>
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
                <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-sky-950 dark:text-cyan-50">Loved by Developers</motion.h2>
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
                <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 text-sky-950 dark:text-cyan-50">Simple Pricing</motion.h2>
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
                  <h3 className="text-2xl font-bold text-sky-950 dark:text-cyan-50 mb-2">Starter</h3>
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
                  <h3 className="text-2xl font-bold text-sky-950 dark:text-cyan-50 mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-sky-950 dark:text-cyan-50 mb-6">$19<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                  <ul className="space-y-4 mb-8">
                    {['Advanced explanations', 'Complex drills', 'Priority AI processing', 'Save history'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sky-900 dark:text-cyan-100">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95">
                    Upgrade to Pro
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
              <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-6 text-sky-950 dark:text-cyan-50">Try it yourself.</motion.h2>
              <motion.p variants={itemVariants} className="text-lg text-sky-800 dark:text-cyan-200/80">Ask a question and experience the magic.</motion.p>
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
                        How can I help you code today?
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
