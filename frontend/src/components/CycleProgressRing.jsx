import React from 'react';
import { Droplet, Sun, Moon, Sparkles, Heart } from 'lucide-react';

export default function CycleProgressRing({ status, onLogToday }) {
  if (!status) return null;

  const {
    current_cycle_day,
    total_cycle_length,
    phase,
    phase_key,
    days_until_next_period,
    cycle_progress_percentage,
    fertile_window,
    estimated_next_period
  } = status;

  // SVG circular calculation
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(1, cycle_progress_percentage || 1));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getPhaseIcon = () => {
    switch (phase_key) {
      case 'menstrual':
        return <Droplet className="w-5 h-5 text-bloom-deep fill-bloom-deep" />;
      case 'follicular':
        return <Sparkles className="w-5 h-5 text-bloom-primary" />;
      case 'ovulation':
        return <Sun className="w-5 h-5 text-amber-500 fill-amber-400" />;
      case 'luteal':
        return <Moon className="w-5 h-5 text-bloom-accent" />;
      default:
        return <Heart className="w-5 h-5 text-bloom-primary" />;
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white dark:bg-bloom-darkcard rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
      {/* Background glow circle */}
      <div className="absolute w-48 h-48 bg-bloom-light/40 dark:bg-bloom-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* SVG Circular Progress */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Track background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-bloom-light/80 dark:text-bloom-darkborder"
            fill="transparent"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="bloomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D96C91" />
              <stop offset="60%" stopColor="#B94D75" />
              <stop offset="100%" stopColor="#A66C83" />
            </linearGradient>
          </defs>

          {/* Animated Progress Indicator */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#bloomGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            fill="transparent"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-bloom-subtle dark:text-bloom-darkmuted mb-1">
            CYCLE DAY
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold tracking-tight text-bloom-dark dark:text-bloom-darktext font-serif">
              {current_cycle_day}
            </span>
            <span className="text-sm font-medium text-bloom-subtle dark:text-bloom-darkmuted">
              / {total_cycle_length}
            </span>
          </div>

          {/* Phase Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-xs font-semibold bg-bloom-light/70 dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 border border-bloom-border dark:border-bloom-darkborder">
            {getPhaseIcon()}
            <span>{phase}</span>
          </div>

          {/* Days until next period */}
          <p className="text-xs font-medium text-bloom-subtle dark:text-bloom-darkmuted mt-2">
            {days_until_next_period > 0 ? (
              <>Next period in <span className="font-bold text-bloom-deep dark:text-pink-400">{days_until_next_period} days</span></>
            ) : days_until_next_period === 0 ? (
              <span className="font-bold text-bloom-deep">Expected today</span>
            ) : (
              <span className="font-bold text-amber-600">{Math.abs(days_until_next_period)} days late</span>
            )}
          </p>
        </div>
      </div>

      {/* Status sub-banner */}
      <div className="w-full mt-4 pt-4 border-t border-bloom-border/50 dark:border-bloom-darkborder/50 flex items-center justify-between text-xs text-bloom-subtle dark:text-bloom-darkmuted">
        <div>
          <span className="block font-medium">Estimated Period</span>
          <span className="font-semibold text-bloom-dark dark:text-bloom-darktext">{estimated_next_period}</span>
        </div>

        {fertile_window?.is_active_today && (
          <span className="px-2.5 py-1 rounded-full bg-pink-100 dark:bg-pink-950/40 text-bloom-deep dark:text-pink-300 font-semibold text-[11px] border border-bloom-secondary">
            Fertile Window Active
          </span>
        )}

        {onLogToday && (
          <button
            onClick={onLogToday}
            className="px-3 py-1.5 rounded-full bg-bloom-primary hover:bg-bloom-deep text-white text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            Log Today
          </button>
        )}
      </div>
    </div>
  );
}

