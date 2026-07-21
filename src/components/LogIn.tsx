import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseClient';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const LogIn = ({ onSwitch }: { onSwitch: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('signup_email');
    const success = sessionStorage.getItem('signup_success');
    if (success === 'true') {
      setSuccessMessage('Your account has been created. You can now log in.');
      if (storedEmail) setEmail(storedEmail);
      sessionStorage.removeItem('signup_email');
      sessionStorage.removeItem('signup_success');
    }
  }, []);

  const handleLogIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/app';
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'Log in failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = '/app';
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      setError(`Google sign-in failed: ${err.message}`);
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
