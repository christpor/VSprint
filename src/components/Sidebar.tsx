import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, MessageSquare, Ticket, Monitor } from 'lucide-react';
import { VSprintLogo } from './VSprintLogo';
import { Conversation } from '../types';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
  startNewChat: () => void;
  scrollToTool: () => void;
  isPresentationMode: boolean;
  setIsPresentationMode: (isPresentation: boolean) => void;
  setShowPlanLimit: (show: boolean) => void;
  user: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  conversations,
  currentConversationId,
  setCurrentConversationId,
  startNewChat,
  scrollToTool,
  isPresentationMode,
  setIsPresentationMode,
  setShowPlanLimit,
  user
}) => {
  return (
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
                {!isPresentationMode && (
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
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="truncate max-w-[120px]">{user?.email}</span>
                  </div>
                  <button
                    onClick={() => setIsPresentationMode(!isPresentationMode)}
                    className={`p-2 rounded-lg transition-colors ${isPresentationMode ? 'bg-blue-500/20 text-blue-500' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    title="Presentation Mode"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
