import React, { useState } from 'react';
import { Search, User, Menu, X, ChevronLeft, ChevronRight, Play, Zap, BrainCircuit, Rocket } from 'lucide-react';
import { VSprintLogo } from './VSprintLogo';

interface CinematicHeroProps {
  onStartLearning: () => void;
  onSignUp: () => void;
  onLogIn: () => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({ onStartLearning, onSignUp, onLogIn }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="/vsprint_bg.webm"
          type="video/webm"
        />
        <source
          src="/vsprint_bg.mp4"
          type="video/mp4"
        />
      </video>

      {/* Bottom Blur Overlay (no dark gradient, only blur with mask) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          maskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
        }}
      />

      {/* Navbar */}
      <nav className="relative z-50 flex justify-between items-center px-4 sm:px-6 md:px-12 py-4 md:py-6">
        {/* Left: Logo */}
        <div
          className="animate-blur-fade-up flex items-center gap-2"
          style={{ animationDelay: '0ms' }}
        >
          <VSprintLogo className="w-8 h-8 md:w-10 md:h-10" />
          <span className="font-bold text-lg md:text-xl tracking-tight text-white">
            VSprint
          </span>
        </div>

        {/* Center: Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              className="animate-blur-fade-up text-sm text-gray-300 hover:text-white transition-colors"
              style={{ animationDelay: `${100 + i * 50}ms` }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-3">
          {/* Search button - hidden below sm */}
          <button
            className="animate-blur-fade-up hidden sm:flex items-center gap-2 px-4 md:px-6 py-2 rounded-full liquid-glass text-white text-sm font-medium"
            style={{ animationDelay: '350ms' }}
          >
            <Search size={18} />
            <span className="hidden md:inline">Search</span>
          </button>

          {/* User/Profile button - hidden below sm */}
          <button
            onClick={onLogIn}
            className="animate-blur-fade-up hidden sm:flex items-center justify-center w-10 h-10 rounded-full liquid-glass text-white"
            style={{ animationDelay: '400ms' }}
          >
            <User size={18} />
          </button>

          {/* Mobile hamburger - visible below lg */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="animate-blur-fade-up flex lg:hidden items-center justify-center w-10 h-10 rounded-full liquid-glass text-white"
            style={{ animationDelay: '350ms' }}
          >
            <div className="relative w-[18px] h-[18px]">
              <Menu
                size={18}
                className={`absolute inset-0 transition-all duration-500 ease-out ${
                  mobileMenuOpen ? 'rotate-180 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
                }`}
              />
              <X
                size={18}
                className={`absolute inset-0 transition-all duration-500 ease-out ${
                  mobileMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-180 opacity-0 scale-50'
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`absolute top-[72px] left-0 right-0 z-40 lg:hidden transition-all duration-500 ease-out ${
          mobileMenuOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-gray-900/95 backdrop-blur-lg border-t border-b border-gray-800 shadow-2xl">
          <div className="px-4 py-3">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                className={`block py-3 px-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300`}
                style={{
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                  opacity: mobileMenuOpen ? 1 : 0,
                  transitionDelay: `${i * 50}ms`,
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          {/* Mobile-only: Search & Profile below sm */}
          <div className="sm:hidden border-t border-gray-800 px-4 py-3 flex items-center gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full liquid-glass text-white text-sm">
              <Search size={16} />
              Search
            </button>
            <button
              onClick={() => { onLogIn(); setMobileMenuOpen(false); }}
              className="flex items-center justify-center w-10 h-10 rounded-full liquid-glass text-white"
            >
              <User size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Content (bottom of viewport) */}
      <div className="relative z-10 flex-1 flex flex-col justify-end h-[calc(100vh-80px)] px-4 sm:px-6 md:px-12 pb-8 md:pb-16">
        <div className="flex flex-col md:flex-row items-end gap-8">
          {/* Left side */}
          <div className="flex-1">
            {/* Metadata row */}
            <div
              className="animate-blur-fade-up flex flex-wrap items-center gap-3 sm:gap-6 mb-6 md:mb-8 text-xs sm:text-sm text-gray-300"
              style={{ animationDelay: '300ms' }}
            >
              <span className="flex items-center gap-1.5">
                <Zap size={16} className="text-yellow-400 sm:w-5 sm:h-5" />
                <span className="font-medium text-white">AI-Powered</span>
              </span>
              <span className="flex items-center gap-1.5">
                <BrainCircuit size={16} className="sm:w-5 sm:h-5" />
                Deep Learning
              </span>
              <span className="flex items-center gap-1.5">
                <Rocket size={16} className="sm:w-5 sm:h-5" />
                Ship Faster
              </span>
            </div>

            {/* Title */}
            <h1
              className="animate-blur-fade-up text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.04em] mb-4 md:mb-6 text-white"
              style={{ animationDelay: '400ms' }}
            >
              Master Coding at the<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                Speed of Thought.
              </span>
            </h1>

            {/* Description */}
            <p
              className="animate-blur-fade-up text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-12 max-w-2xl"
              style={{ animationDelay: '500ms' }}
            >
              Break through coding blocks instantly. Get crystal-clear explanations, production-ready code, and targeted drills designed for deep mastery.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button
                onClick={onStartLearning}
                className="animate-blur-fade-up flex items-center gap-2 bg-white text-black rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-gray-200 transition-colors"
                style={{ animationDelay: '600ms' }}
              >
                <Play size={18} fill="black" />
                Start Learning
              </button>
              <button
                onClick={onSignUp}
                className="animate-blur-fade-up flex items-center gap-2 rounded-full font-medium liquid-glass text-white px-6 sm:px-8 py-2.5 sm:py-3"
                style={{ animationDelay: '700ms' }}
              >
                Sign Up Free
              </button>
            </div>
          </div>

          {/* Right side: navigation arrows */}
          <div className="flex gap-3 md:self-end">
            <button
              className="animate-blur-fade-up flex items-center justify-center rounded-full liquid-glass text-white px-4 sm:px-6 py-2.5 sm:py-3"
              style={{ animationDelay: '800ms' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="animate-blur-fade-up flex items-center justify-center rounded-full liquid-glass text-white px-4 sm:px-6 py-2.5 sm:py-3"
              style={{ animationDelay: '900ms' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
