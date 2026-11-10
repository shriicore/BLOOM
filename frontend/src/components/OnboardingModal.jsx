import React, { useState } from 'react';
import { Calendar, CheckCircle, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { api } from '../api';

export default function OnboardingModal({ isOpen, user, onComplete }) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [lastPeriodDate, setLastPeriodDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 10);
    return d.toISOString().split('T')[0];
  });
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [isRegular, setIsRegular] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (displayName && displayName !== user?.name) {
        await api.updateProfile(displayName);
      }
      await api.updatePreferences({
        cycle_length: cycleLength,
        period_duration: periodDuration,
        is_regular: isRegular,
        last_period_date: lastPeriodDate,
        reminder_days_before: 2,
        notifications_enabled: 1
      });
      onComplete();
    } catch (err) {
      console.error(err);
      onComplete(); // Proceed anyway
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-bloom-darkcard rounded-3xl p-8 border border-bloom-border/70 dark:border-bloom-darkborder shadow-bloom-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-bloom-primary'
                    : s < step
                    ? 'w-5 bg-bloom-deep'
                    : 'w-4 bg-bloom-light dark:bg-bloom-darkborder'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-bloom-subtle dark:text-bloom-darkmuted uppercase tracking-wider">
            Step {step} of 3
          </span>
        </div>

        {/* Step 1: Welcome & Last Period */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
                Welcome to Bloom, {displayName || 'Friend'}!
              </h3>
              <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-1">
                Let's calibrate your natural rhythm so we can personalize your dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1.5">
                  How should we address you?
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-sm text-bloom-dark dark:text-bloom-darktext focus:outline-none focus:ring-2 focus:ring-bloom-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1.5">
                  When did your last period begin?
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-bloom-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-sm text-bloom-dark dark:text-bloom-darktext focus:outline-none focus:ring-2 focus:ring-bloom-primary/40"
                  />
                </div>
                <p className="text-[11px] text-bloom-subtle dark:text-bloom-darkmuted mt-1">
                  If unsure, choose the closest approximate date. You can update anytime.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-2xl bg-bloom-primary hover:bg-bloom-deep text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Cycle & Period Length */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
                Your Average Cycle Numbers
              </h3>
              <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-1">
                Typical cycles range from 24 to 38 days.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-bloom-dark dark:text-bloom-darktext">
                    Average Cycle Length
                  </label>
                  <span className="text-sm font-bold text-bloom-deep dark:text-pink-300">
                    {cycleLength} days
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  className="w-full accent-bloom-primary"
                />
                <div className="flex justify-between text-[10px] text-bloom-subtle">
                  <span>20 days</span>
                  <span>28 days (avg)</span>
                  <span>45 days</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-bloom-dark dark:text-bloom-darktext">
                    Typical Period Duration (Bleeding)
                  </label>
                  <span className="text-sm font-bold text-bloom-deep dark:text-pink-300">
                    {periodDuration} days
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {[3, 4, 5, 6, 7, 8].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setPeriodDuration(days)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        periodDuration === days
                          ? 'bg-bloom-primary text-white border-bloom-primary shadow-sm'
                          : 'bg-bloom-bg/60 dark:bg-bloom-darkbg text-bloom-dark dark:text-bloom-darktext border-bloom-border dark:border-bloom-darkborder'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-2xl border border-bloom-border dark:border-bloom-darkborder text-bloom-subtle dark:text-bloom-darkmuted font-semibold text-xs"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-2xl bg-bloom-primary hover:bg-bloom-deep text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Regularity & Finish */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
                Cycle Regularity
              </h3>
              <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-1">
                Are your periods generally predictable, or do they vary month to month?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsRegular(true)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isRegular
                    ? 'bg-bloom-light/80 dark:bg-bloom-darkborder border-bloom-deep dark:border-pink-400 ring-2 ring-bloom-deep/20'
                    : 'bg-white dark:bg-bloom-darkcard border-bloom-border dark:border-bloom-darkborder'
                }`}
              >
                <CheckCircle className={`w-5 h-5 mb-2 ${isRegular ? 'text-bloom-deep dark:text-pink-300' : 'text-bloom-subtle'}`} />
                <p className="text-xs font-bold text-bloom-dark dark:text-bloom-darktext">Generally Regular</p>
                <p className="text-[10px] text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">Varies by 1-3 days</p>
              </button>

              <button
                type="button"
                onClick={() => setIsRegular(false)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  !isRegular
                    ? 'bg-bloom-light/80 dark:bg-bloom-darkborder border-bloom-deep dark:border-pink-400 ring-2 ring-bloom-deep/20'
                    : 'bg-white dark:bg-bloom-darkcard border-bloom-border dark:border-bloom-darkborder'
                }`}
              >
                <Sparkles className={`w-5 h-5 mb-2 ${!isRegular ? 'text-bloom-deep dark:text-pink-300' : 'text-bloom-subtle'}`} />
                <p className="text-xs font-bold text-bloom-dark dark:text-bloom-darktext">Somewhat Irregular</p>
                <p className="text-[10px] text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">Varies or skips cycles</p>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-bloom-light/40 dark:bg-bloom-darkborder/30 border border-bloom-border dark:border-bloom-darkborder text-xs text-bloom-subtle dark:text-bloom-darkmuted">
              <p>
                As you log cycles over time, Bloom will automatically recalculate your personalized weighted averages and cycle regularity.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl border border-bloom-border dark:border-bloom-darkborder text-bloom-subtle dark:text-bloom-darkmuted font-semibold text-xs"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-bloom-primary to-bloom-deep text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Finalizing...' : 'Open Dashboard'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

