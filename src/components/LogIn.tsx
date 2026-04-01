import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const LogIn = ({ onSwitch }: { onSwitch: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem('signup_email');
    const success = sessionStorage.getItem('signup_success');
    if (success === 'true') {
      setSuccessMessage('Your account has been created. Please check your email and verify your address before logging in.');
      if (email) setEmail(email);
      sessionStorage.removeItem('signup_email');
      sessionStorage.removeItem('signup_success');
    }
  }, []);

    const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else if (data.session) {
      window.location.href = '/';
    } else {
      setError('Log in failed. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleLogIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        console.error('Google LogIn Error:', error.message);
        setError(`Google LogIn Error: ${error.message}`);
      }
    } catch (err) {
      console.error('Unexpected Google LogIn Error:', err);
      setError('An unexpected error occurred during Google LogIn.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl"
    >
      <h2 className="text-3xl font-bold mb-6 text-sky-950 dark:text-cyan-50">Log In</h2>
      {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}
      <form onSubmit={handleLogIn} className="space-y-4">
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Log In <ArrowRight className="w-4 h-4" /></>}
        </button>
        <button
          type="button"
          onClick={handleGoogleLogIn}
          className="w-full py-3 rounded-xl bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-semibold flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
          Continue with Google
        </button>
      </form>
      <p className="mt-6 text-center text-slate-500 dark:text-slate-400">
        Don't have an account? <button onClick={onSwitch} className="text-blue-500 font-semibold">Sign Up</button>
      </p>
    </motion.div>
  );
};
