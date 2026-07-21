import { motion } from 'motion/react';
import { Check, Terminal, BrainCircuit, Target, Rocket, Star, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { VSprintLogo } from '../components/VSprintLogo';

interface LandingPageProps {
  mousePos: { x: number; y: number };
  scrollToTool: () => void;
  setAuthView: (view: 'home' | 'signin' | 'signup') => void;
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

export function LandingPage({ mousePos, scrollToTool, setAuthView }: LandingPageProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-20 pb-32 md:pb-48 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto relative min-h-[90vh] flex flex-col justify-center overflow-visible">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* Left Column: Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-sky-500/10 border border-sky-200/50 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 text-sm font-medium mb-8 backdrop-blur-md shadow-sm">
              <VSprintLogo className="w-4 h-4" />
              <span>The Future of High-Density Coding</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Master Coding at the <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-sky-400 dark:to-emerald-400">Speed of Thought</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
              Break through coding blocks instantly. Get crystal-clear explanations, production-ready code, and targeted drills designed for deep mastery.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={scrollToTool}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95 group"
              >
                Start Learning 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
              <button 
                onClick={() => setAuthView('signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl text-slate-600 dark:text-slate-300 font-bold text-lg hover:bg-white/80 dark:hover:bg-white/10 transition-all"
              >
                View Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Right Column: Robot Video */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative order-1 lg:order-2 w-full h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center pointer-events-none select-none"
          >
            <motion.div
              animate={{ 
                y: [0, -12, 0],
                x: mousePos.x * 8,
                rotateY: mousePos.x * 5,
                rotateX: -mousePos.y * 3,
              }}
              transition={{ 
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                x: { duration: 0.3, ease: "easeOut" },
                rotateY: { duration: 0.3, ease: "easeOut" },
                rotateX: { duration: 0.3, ease: "easeOut" },
              }}
              className="w-full h-full flex items-center justify-center"
              style={{ perspective: '1000px' }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-auto max-w-full object-contain"
              >
                <source src="/robot_hero.webm" type="video/webm" />
              </video>
            </motion.div>
          </motion.div>
        </div>
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
            <video autoPlay loop muted playsInline className="w-32 h-32 mx-auto mb-6 object-contain">
              <source src="/robot_howitworks.webm" type="video/webm" />
            </video>
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
              <video autoPlay loop muted playsInline className="w-48 h-48 mx-auto mb-6 object-contain">
                <source src="/robot_features.webm" type="video/webm" />
              </video>
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
            <motion.div variants={itemVariants} className="mx-auto mb-6">
              <video autoPlay loop muted playsInline className="w-40 h-40 mx-auto object-contain">
                <source src="/robot_about.webm" type="video/webm" />
              </video>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600 dark:text-cyan-400"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
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
              <Link to="/about" className="hover:text-blue-500 transition-colors">About</Link>
              <a href="mailto:porkh377@gmail.com" className="hover:text-blue-500 transition-colors">Email</a>
              <a href="https://t.me/Christpor" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Telegram</a>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-slate-400 dark:text-sky-800">
            &copy; 2026 VSprint by Christpor Rin. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
