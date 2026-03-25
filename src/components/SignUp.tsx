import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const SignUp = ({ onSwitch }: { onSwitch: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      sessionStorage.setItem('signup_email', email);
      sessionStorage.setItem('signup_success', 'true');
      onSwitch();
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl"
    >
      <h2 className="text-3xl font-bold mb-6 text-sky-950 dark:text-cyan-50">Sign Up</h2>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign Up <ArrowRight className="w-4 h-4" /></>}
        </button>
        <button
          type="button"
          className="w-full py-3 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 cursor-default"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
          Continue with Google
        </button>
      </form>
      <p className="mt-6 text-center text-slate-500 dark:text-slate-400">
        Already have an account? <button onClick={onSwitch} className="text-blue-500 font-semibold">Sign In</button>
      </p>
    </motion.div>
  );
};
