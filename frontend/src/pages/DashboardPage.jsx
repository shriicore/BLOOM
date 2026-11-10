import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Droplet,
  Calendar,
  ArrowRight,
  Shield,
  Sun,
  Moon,
  Clock,
  PlusCircle,
  BookOpen
} from 'lucide-react';
import CycleProgressRing from '../components/CycleProgressRing';
import { api } from '../api';

export default function DashboardPage({ user, onNavigateToTab, onOpenQuickLog }) {
  const [cycleStatus, setCycleStatus] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [recentPeriods, setRecentPeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time-based personal greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [status, symptoms, periods] = await Promise.all([
        api.getCycleStatus().catch(() => null),
        api.getSymptoms().catch(() => null),
        api.getPeriods().catch(() => [])
      ]);
      setCycleStatus(status);
      setTodayLog(symptoms);
      setRecentPeriods(periods?.slice(0, 3) || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading && !cycleStatus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-bloom-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-bloom-subtle animate-pulse">Loading your cycle rhythm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Welcome Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-bloom-light/50 via-bloom-surface to-white dark:from-bloom-darkcard dark:to-bloom-darkcard/60 p-6 sm:p-8 rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 text-xs font-semibold mb-2 shadow-sm border border-bloom-border dark:border-bloom-darkborder">
            <Sparkles className="w-3.5 h-3.5 text-bloom-primary" />
            <span>Personalized Health Space</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-bloom-dark dark:text-bloom-darktext tracking-tight">
            {getGreeting()}, <span className="bg-gradient-to-r from-bloom-deep to-bloom-primary bg-clip-text text-transparent">{user?.name || 'Beautiful'}</span>!
          </h1>
          <p className="text-sm text-bloom-subtle dark:text-bloom-darkmuted mt-1 max-w-xl">
            You are currently in your <span className="font-semibold text-bloom-dark dark:text-bloom-darktext">{cycleStatus?.phase || 'Cycle'}</span>. 
            Here is your daily snapshot and hormone-aligned wellness guide.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('tracker')}
            className="px-5 py-2.5 rounded-full bg-bloom-primary hover:bg-bloom-deep text-white text-xs font-semibold shadow-md shadow-bloom-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Track Today's Log</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Progress Ring + Phase Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Circular Progress Ring */}
        <div className="lg:col-span-5">
          <CycleProgressRing
            status={cycleStatus}
            onLogToday={() => onNavigateToTab('tracker')}
          />
        </div>

        {/* Right: Phase Details & Tailored Wellness Guidance */}
        <div className="lg:col-span-7 space-y-6">
          {/* Phase Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-widest font-bold text-bloom-subtle dark:text-bloom-darkmuted">
                CURRENT PHASE HORMONES
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300">
                {cycleStatus?.phase_hormones || 'Balanced'}
              </span>
            </div>

            <h3 className="text-2xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext mb-2">
              {cycleStatus?.phase}
            </h3>
            <p className="text-sm text-bloom-subtle dark:text-bloom-darkmuted leading-relaxed mb-5">
              {cycleStatus?.phase_description}
            </p>

            <div className="border-t border-bloom-border/50 dark:border-bloom-darkborder/50 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bloom-dark dark:text-bloom-darktext mb-3 flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-bloom-primary" />
                <span>Recommended Self-Care For Today</span>
              </h4>

              <div className="space-y-2.5">
                {(cycleStatus?.wellness_tips || [
                  "Prioritize hydration and restful sleep.",
                  "Listen to your energy cues and nourish your body."
                ]).map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-bloom-subtle dark:text-bloom-darkmuted bg-bloom-bg/60 dark:bg-bloom-darkbg p-3 rounded-2xl border border-bloom-border/40 dark:border-bloom-darkborder/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-bloom-primary mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fertile Window Status Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-bloom-surface to-white dark:from-bloom-darkcard dark:to-bloom-darkcard/80 border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-bloom-subtle dark:text-bloom-darkmuted">
                OVULATION & FERTILITY ESTIMATE
              </span>
              <h4 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext mt-1">
                Estimated Ovulation: {cycleStatus?.estimated_ovulation_date || 'Calculating...'}
              </h4>
              <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
                Fertile Window: {cycleStatus?.fertile_window?.start_date} to {cycleStatus?.fertile_window?.end_date}
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab('calendar')}
              className="px-4 py-2 rounded-full border border-bloom-border dark:border-bloom-darkborder text-xs font-bold text-bloom-deep dark:text-pink-300 hover:bg-bloom-light/50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>View Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row: Today's Log Summary & NLP Journal Prompt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Today's Log Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext flex items-center gap-2">
                <Clock className="w-4 h-4 text-bloom-primary" />
                <span>Today's Log</span>
              </h3>
              <span className="text-xs text-bloom-subtle dark:text-bloom-darkmuted font-medium">
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {todayLog?.symptoms?.length > 0 || todayLog?.mood || todayLog?.flow ? (
              <div className="space-y-3">
                {todayLog?.flow && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-bloom-dark dark:text-bloom-darktext">Flow:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 font-bold capitalize">
                      {todayLog.flow}
                    </span>
                  </div>
                )}

                {todayLog?.mood && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-bloom-dark dark:text-bloom-darktext">Mood:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold capitalize">
                      {todayLog.mood}
                    </span>
                  </div>
                )}

                {todayLog?.symptoms?.length > 0 && (
                  <div>
                    <span className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1.5">
                      Symptoms:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {todayLog.symptoms.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-xl bg-bloom-bg dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-[11px] font-medium text-bloom-deep dark:text-pink-300 capitalize">
                          {s.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-bloom-subtle dark:text-bloom-darkmuted">
                <p className="mb-2">No symptoms recorded yet today.</p>
                <p className="text-[11px]">Takes just 30 seconds to capture how your body feels.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-bloom-border/50 dark:border-bloom-darkborder/50">
            <button
              onClick={() => onNavigateToTab('tracker')}
              className="w-full py-2.5 rounded-2xl bg-bloom-light/80 dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 font-bold text-xs hover:bg-bloom-secondary/40 transition-colors"
            >
              {todayLog?.symptoms?.length > 0 ? 'Edit Today\'s Record' : 'Record Today\'s Symptoms'}
            </button>
          </div>
        </div>

        {/* NLP Journal Shortcut */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-bloom-primary" />
                <span>Reflective Journal & AI</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300">
                NLP Powered
              </span>
            </div>

            <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted leading-relaxed mb-4">
              Express your feelings in your own words. Bloom's Natural Language Processing will analyze your entry to suggest symptom tags and track mood changes automatically.
            </p>

            <div className="p-3.5 rounded-2xl bg-bloom-bg/80 dark:bg-bloom-darkbg border border-bloom-border/50 dark:border-bloom-darkborder/50 text-xs italic text-bloom-subtle dark:text-bloom-darkmuted">
              "I have been feeling tired and experiencing cramps today. My mood is also low."
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-bloom-border/50 dark:border-bloom-darkborder/50">
            <button
              onClick={() => onNavigateToTab('journal')}
              className="w-full py-2.5 rounded-2xl bg-bloom-primary hover:bg-bloom-deep text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
            >
              <span>Open NLP Journal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Cycle History Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
              Recent Cycle History
            </h3>
            <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
              Historical periods recorded in your personal database
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('analytics')}
            className="text-xs font-bold text-bloom-deep dark:text-pink-300 hover:underline flex items-center gap-1"
          >
            <span>Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentPeriods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-bloom-border dark:border-bloom-darkborder text-bloom-subtle dark:text-bloom-darkmuted uppercase font-bold tracking-wider">
                  <th className="pb-3 px-3">Start Date</th>
                  <th className="pb-3 px-3">End Date</th>
                  <th className="pb-3 px-3">Flow</th>
                  <th className="pb-3 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bloom-border/40 dark:divide-bloom-darkborder/40">
                {recentPeriods.map((p) => (
                  <tr key={p.id} className="hover:bg-bloom-bg/40 dark:hover:bg-bloom-darkbg/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-bloom-dark dark:text-bloom-darktext">{p.start_date}</td>
                    <td className="py-3 px-3 text-bloom-subtle dark:text-bloom-darkmuted">{p.end_date || 'Ongoing'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 font-semibold capitalize text-[11px]">
                        {p.flow || 'Medium'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-bloom-subtle dark:text-bloom-darkmuted max-w-xs truncate">
                      {p.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-bloom-subtle dark:text-bloom-darkmuted">
            <p className="mb-2">No historical periods logged yet.</p>
            <p className="text-[11px]">Click "Load Demo Data" in the top bar to preview with realistic records!</p>
          </div>
        )}
      </div>
    </div>
  );
}

