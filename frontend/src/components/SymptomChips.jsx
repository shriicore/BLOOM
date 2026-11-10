import React from 'react';
import {
  Flame,
  Zap,
  Activity,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  CloudRain,
  HeartCrack,
  Moon,
  Droplet,
  Coffee,
  Sparkles
} from 'lucide-react';

export const ALL_SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', icon: Flame },
  { id: 'headache', label: 'Headache', icon: Zap },
  { id: 'bloating', label: 'Bloating', icon: Activity },
  { id: 'acne', label: 'Acne & Skin', icon: Sparkles },
  { id: 'fatigue', label: 'Fatigue', icon: Coffee },
  { id: 'back_pain', label: 'Back Pain', icon: AlertCircle },
  { id: 'breast_tenderness', label: 'Breast Tenderness', icon: Activity },
  { id: 'mood_swings', label: 'Mood Swings', icon: HeartCrack },
  { id: 'nausea', label: 'Nausea', icon: CloudRain },
  { id: 'insomnia', label: 'Insomnia', icon: Moon },
];

export const ALL_MOODS = [
  { id: 'happy', label: 'Happy & Radiant', emoji: '🌸', color: 'from-pink-400 to-rose-400' },
  { id: 'calm', label: 'Calm & Grounded', emoji: '🌿', color: 'from-emerald-400 to-teal-400' },
  { id: 'anxious', label: 'Anxious / Stressed', emoji: '💭', color: 'from-amber-400 to-orange-400' },
  { id: 'irritated', label: 'Irritated / PMS', emoji: '⚡', color: 'from-rose-500 to-red-500' },
  { id: 'sad', label: 'Sad / Low Mood', emoji: '🌧️', color: 'from-indigo-400 to-blue-400' },
  { id: 'emotional', label: 'Emotional / Weepy', emoji: '🕊️', color: 'from-purple-400 to-pink-400' },
];

export const FLOW_OPTIONS = [
  { id: 'spotting', label: 'Spotting', drops: 1, desc: 'Very light droplets' },
  { id: 'light', label: 'Light Flow', drops: 2, desc: 'Mild bleeding' },
  { id: 'medium', label: 'Medium Flow', drops: 3, desc: 'Standard pad/tampon' },
  { id: 'heavy', label: 'Heavy Flow', drops: 4, desc: 'Frequent changes needed' },
];

export const ENERGY_LEVELS = [
  { id: 'low', label: 'Low Energy', desc: 'Rest & recover mode' },
  { id: 'medium', label: 'Steady Energy', desc: 'Balanced stamina' },
  { id: 'high', label: 'High Vitality', desc: 'Peak stamina & focus' },
];

export function FlowSelector({ selectedFlow, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {FLOW_OPTIONS.map((opt) => {
        const isSelected = selectedFlow === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(isSelected ? null : opt.id)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              isSelected
                ? 'bg-bloom-light/80 dark:bg-bloom-darkborder border-bloom-deep dark:border-pink-400 ring-2 ring-bloom-deep/30 shadow-sm'
                : 'bg-white dark:bg-bloom-darkcard border-bloom-border/70 dark:border-bloom-darkborder hover:border-bloom-secondary'
            }`}
          >
            <div className="flex items-center gap-1 mb-1.5 text-bloom-deep dark:text-pink-300">
              {Array.from({ length: opt.drops }).map((_, i) => (
                <Droplet key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs font-bold text-bloom-dark dark:text-bloom-darktext">{opt.label}</p>
            <p className="text-[10px] text-bloom-subtle dark:text-bloom-darkmuted">{opt.desc}</p>
          </button>
        );
      })}
    </div>
  );
}

export function SymptomSelector({ selectedSymptoms = [], onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_SYMPTOMS.map((sym) => {
        const Icon = sym.icon;
        const isSelected = selectedSymptoms.includes(sym.id);
        return (
          <button
            key={sym.id}
            type="button"
            onClick={() => onToggle(sym.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-medium border transition-all ${
              isSelected
                ? 'bg-bloom-primary text-white border-bloom-primary shadow-sm shadow-bloom-primary/20 scale-[1.02]'
                : 'bg-white dark:bg-bloom-darkcard text-bloom-dark dark:text-bloom-darktext border-bloom-border dark:border-bloom-darkborder hover:border-bloom-primary/50'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-bloom-primary dark:text-pink-300'}`} />
            <span>{sym.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function MoodSelector({ selectedMood, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {ALL_MOODS.map((m) => {
        const isSelected = selectedMood === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(isSelected ? null : m.id)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              isSelected
                ? 'bg-bloom-light/80 dark:bg-bloom-darkborder border-bloom-deep dark:border-pink-400 ring-2 ring-bloom-deep/30 shadow-sm'
                : 'bg-white dark:bg-bloom-darkcard border-bloom-border dark:border-bloom-darkborder hover:border-bloom-secondary'
            }`}
          >
            <span className="text-2xl mb-1 block">{m.emoji}</span>
            <p className="text-xs font-bold text-bloom-dark dark:text-bloom-darktext">{m.label}</p>
          </button>
        );
      })}
    </div>
  );
}

