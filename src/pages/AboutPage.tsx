import { motion } from 'motion/react';
import { Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VSprintLogo } from '../components/VSprintLogo';

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

export function AboutPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* About & Vision */}
      <section className="py-32 px-4 sm:px-6 md:px-10 flex-1">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={itemVariants} className="mx-auto mb-6">
              <video autoPlay loop muted playsInline className="w-40 h-40 mx-auto object-contain">
                <source src="/robot_about.webm" type="video/webm" />
              </video>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-4 text-sky-950 dark:text-cyan-50">Crafted by Christpor Rin</motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-sky-800 dark:text-cyan-200/80 mb-8">Founder & Lead Architect</motion.p>
            <motion.div variants={itemVariants} className="bg-white/50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-xl mb-12">
              <Rocket className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
              <p className="text-lg text-sky-900 dark:text-cyan-100 leading-relaxed italic">
                "I built VSprint because I remember how frustrating it was to learn coding from dry documentation. My vision is to help beginners understand coding deeply, making learning fast, powerful, and actually enjoyable."
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white/50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-slate-200/50 dark:border-white/10 shadow-xl">
              <p className="text-lg text-sky-900 dark:text-cyan-100 leading-relaxed">
                VSprint was born from a simple frustration: traditional coding education is slow, dry, and disconnected from real-world building. As a self-taught developer, I wanted to create the tool I wish I had — one that explains the "why" behind the code, gives you hands-on drills, and makes learning feel like a conversation with a brilliant mentor.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-12">
              <Link 
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95"
              >
                ← Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-12 px-4 bg-white/10 dark:bg-black/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center mb-8">
            <video autoPlay loop muted playsInline className="w-24 h-24 object-contain">
              <source src="/robot_footer.webm" type="video/webm" />
            </video>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <VSprintLogo className="w-6 h-6" />
              <span className="font-bold text-lg text-sky-950 dark:text-cyan-50">
                <span className="text-sky-500 dark:text-sky-400">V</span>Sprint
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-cyan-200/80">
              <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
              <a href="mailto:porkh377@gmail.com" className="hover:text-blue-500 transition-colors">Email</a>
              <a href="https://t.me/Christpor" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Telegram</a>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-slate-400 dark:text-sky-800">
            &copy; 2026 VSprint by Christpor Rin. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
