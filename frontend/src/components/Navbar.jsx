import React from 'react';
import { Sun, Moon, Sparkles, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar({
  user,
  darkMode,
  setDarkMode,
  onLogout,
  onSeedDemo,
  isSeeding,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-bloom-darkcard/80 backdrop-blur-md border-b border-bloom-border/60 dark:border-bloom-darkborder transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-bloom-dark dark:text-bloom-darktext hover:bg-bloom-light/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-bloom-deep to-bloom-primary flex items-center justify-center shadow-md shadow-bloom-primary/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 4 2.5 7.5 6 9 0-3 1.5-6 4-7 2.5 1 4 4 4 7 3.5-1.5 6-5 6-9 0-5.5-4.5-10-10-10z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight font-serif text-bloom-dark dark:text-bloom-darktext">
                BLOOM
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300">
                Health & Wellness
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Data Seed Button */}
          {user && (
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              title="Populate realistic demo cycles and NLP reflections"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-bloom-light/80 dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 hover:bg-bloom-secondary/50 dark:hover:bg-bloom-accent/40 border border-bloom-secondary/60 dark:border-bloom-darkborder transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : 'text-bloom-primary'}`} />
              <span className="hidden md:inline">{isSeeding ? 'Seeding Demo...' : 'Load Demo Data'}</span>
            </button>
          )}

          {/* Privacy Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/60 dark:border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Private & Encrypted</span>
          </div>

          {/* Dark Mode Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
            className="p-2 rounded-xl text-bloom-dark dark:text-bloom-darktext hover:bg-bloom-light dark:hover:bg-bloom-darkborder transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-bloom-accent" />}
          </button>

          {/* Logged in User Pill */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-bloom-border dark:border-bloom-darkborder">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-bloom-secondary to-bloom-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-bloom-dark dark:text-bloom-darktext leading-none">{user.name}</p>
                <p className="text-[10px] text-bloom-subtle dark:text-bloom-darkmuted truncate max-w-[120px]">{user.email}</p>
              </div>

              <button
                onClick={onLogout}
                title="Log out"
                className="p-2 text-bloom-subtle hover:text-bloom-deep dark:text-bloom-darkmuted dark:hover:text-pink-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

