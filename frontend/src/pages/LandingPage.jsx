import React from 'react';
import { Sparkles, Shield, Heart, Activity, ArrowRight, BrainCircuit, Calendar, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-screen bg-bloom-bg dark:bg-bloom-darkbg transition-colors">
      {/* Landing Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-bloom-deep to-bloom-primary flex items-center justify-center shadow-lg shadow-bloom-primary/20">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.5 2 2 6.5 2 12c0 4 2.5 7.5 6 9 0-3 1.5-6 4-7 2.5 1 4 4 4 7 3.5-1.5 6-5 6-9 0-5.5-4.5-10-10-10z" />
            </svg>
          </div>
          <span className="text-2xl font-black font-serif tracking-tight text-bloom-dark dark:text-bloom-darktext">
            BLOOM
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-5 py-2 text-sm font-semibold rounded-full text-bloom-dark dark:text-bloom-darktext hover:text-bloom-deep transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 text-sm font-semibold rounded-full bg-bloom-primary hover:bg-bloom-deep text-white shadow-md shadow-bloom-primary/25 transition-all hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Soft background ambient gradient shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-bloom-light/50 via-bloom-secondary/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bloom-light/80 dark:bg-bloom-darkcard text-bloom-deep dark:text-pink-300 text-xs font-semibold mb-8 border border-bloom-border dark:border-bloom-darkborder shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-bloom-primary" />
            <span>Smart Menstrual Intelligence & NLP Journal</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-serif text-bloom-dark dark:text-bloom-darktext tracking-tight leading-[1.1] mb-6">
            Your cycle. Your body. <br />
            <span className="bg-gradient-to-r from-bloom-deep via-bloom-primary to-bloom-accent bg-clip-text text-transparent">
              Your bloom.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-bloom-subtle dark:text-bloom-darkmuted font-normal leading-relaxed mb-10">
            Understand your cycle, discover your patterns and feel more connected to your body.
            A beautiful, private space to track your symptoms, phases and reflections.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-bloom-primary to-bloom-deep text-white font-semibold text-base shadow-xl shadow-bloom-primary/25 hover:shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Begin Your Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-bloom-darkcard text-bloom-dark dark:text-bloom-darktext font-semibold text-base border border-bloom-border dark:border-bloom-darkborder hover:border-bloom-primary/50 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              Learn More
            </a>
          </div>

          {/* Privacy Note */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-bloom-subtle dark:text-bloom-darkmuted">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Privacy-first design. Your health data is never sold or shared.</span>
          </div>
        </div>

        {/* Feature Preview Cards */}
        <div id="features" className="max-w-6xl mx-auto px-4 mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-white/80 dark:bg-bloom-darkcard/80 backdrop-blur-md border border-bloom-border/70 dark:border-bloom-darkborder shadow-bloom hover:shadow-bloom-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext mb-3">
              Dynamic Predictions
            </h3>
            <p className="text-sm text-bloom-subtle dark:text-bloom-darkmuted leading-relaxed">
              Transparent, mathematical cycle models that adapt to your historical logs. See your upcoming period, ovulation window, and cycle phase with complete clarity.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-white/80 dark:bg-bloom-darkcard/80 backdrop-blur-md border border-bloom-border/70 dark:border-bloom-darkborder shadow-bloom hover:shadow-bloom-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext mb-3">
              NLP-Powered Journal
            </h3>
            <p className="text-sm text-bloom-subtle dark:text-bloom-darkmuted leading-relaxed">
              Write freely about your day. Our natural language processing extracts symptom cues and mood nuances, offering one-click suggestions to enrich your daily log.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-white/80 dark:bg-bloom-darkcard/80 backdrop-blur-md border border-bloom-border/70 dark:border-bloom-darkborder shadow-bloom hover:shadow-bloom-lg transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext mb-3">
              Hormone-Aligned Care
            </h3>
            <p className="text-sm text-bloom-subtle dark:text-bloom-darkmuted leading-relaxed">
              Discover tailored self-care guidance for Menstrual, Follicular, Ovulatory, and Luteal phases. Support your energy with evidence-grounded nutrition and movement.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bloom-border/60 dark:border-bloom-darkborder py-12 text-center text-xs text-bloom-subtle dark:text-bloom-darkmuted">
        <p className="mb-2">BLOOM Health &copy; 2026. Empowering menstrual wellness with privacy and science.</p>
        <p className="max-w-md mx-auto text-[11px] opacity-75">
          Disclaimer: Bloom provides statistical cycle estimates and wellness insights. It does not replace medical advice, clinical diagnosis, or contraception.
        </p>
      </footer>
    </div>
  );
}

