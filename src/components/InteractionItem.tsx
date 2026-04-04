import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, Check, Copy, ArrowRight, Plus, Play, CheckCircle2, ExternalLink } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InteractionType } from '../types';
import { LivePreview } from './LivePreview';

interface InteractionItemProps {
  interaction: InteractionType;
  isLatest: boolean;
  onSubmit: (e?: React.FormEvent, promptOverride?: string) => Promise<void>;
}

export const InteractionItem: React.FC<InteractionItemProps> = ({ 
  interaction, 
  isLatest, 
  onSubmit 
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
                      <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Core Concept</h2>
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
                      <h3 className="text-lg font-semibold text-sky-950 dark:text-cyan-50">Architectural Logic</h3>
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
                      <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">Senior Insight</h3>
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
                        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">Active Mastery Drill</h3>
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
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">Concept Mastered. Excellent progress.</span>
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
