import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Save,
  CheckCircle,
  Clock,
  Sparkles,
  Droplet,
  GlassWater,
  Moon,
  StickyNote,
  HeartPulse
} from 'lucide-react';
import { api } from '../api';
import {
  FlowSelector,
  SymptomSelector,
  MoodSelector,
  ENERGY_LEVELS
} from '../components/SymptomChips';

export default function TrackerPage({ onSaved }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState('medium');
  const [sleepHours, setSleepHours] = useState(7.5);
  const [waterMl, setWaterMl] = useState(2000);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing data for selected date
  useEffect(() => {
    let isMounted = true;
    const fetchDateDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getSymptoms(selectedDate);
        if (isMounted && data) {
          setFlow(data.flow || null);
          setSymptoms(Array.isArray(data.symptoms) ? data.symptoms : []);
          setMood(data.mood || null);
          setEnergy(data.energy || 'medium');
          setSleepHours(data.sleep_hours !== null && data.sleep_hours !== undefined ? data.sleep_hours : 7.5);
          setWaterMl(data.water_intake_ml || 2000);
          setNotes(data.notes || '');
        }
      } catch (err) {
        console.error('Error fetching date symptoms:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDateDetails();
    return () => { isMounted = false; };
  }, [selectedDate]);

  const handleToggleSymptom = (symId) => {
    setSymptoms((prev) =>
      prev.includes(symId) ? prev.filter((s) => s !== symId) : [...prev, symId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      await api.saveSymptoms({
        log_date: selectedDate,
        flow,
        symptoms,
        mood,
        energy,
        sleep_hours: parseFloat(sleepHours),
        water_intake_ml: parseInt(waterMl),
        notes
      });

      // If flow is marked, ensure a period log exists for this date
      if (flow) {
        await api.createPeriod({
          start_date: selectedDate,
          end_date: selectedDate,
          flow: flow,
          notes: notes || 'Logged via Daily Tracker'
        }).catch(() => {});
      }

      setSavedSuccess(true);
      if (onSaved) onSaved();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      alert(err.message || 'Error saving daily record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-bloom-darkcard p-6 sm:p-8 rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 text-xs font-semibold mb-2">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Daily Health Logging</span>
          </div>
          <h2 className="text-3xl font-extrabold font-serif text-bloom-dark dark:text-bloom-darktext">
            Track Symptoms & Wellness
          </h2>
          <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
            Log your flow, bodily sensations, energy and mood to discover personalized patterns.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-bloom-bg dark:bg-bloom-darkbg px-4 py-2.5 rounded-2xl border border-bloom-border dark:border-bloom-darkborder">
          <Calendar className="w-4 h-4 text-bloom-primary" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs font-bold text-bloom-dark dark:text-bloom-darktext focus:outline-none"
          />
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Your daily record for {selectedDate} was saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Menstrual Flow */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext flex items-center gap-2">
                <Droplet className="w-4 h-4 text-bloom-deep" />
                <span>Menstrual Bleeding Flow</span>
              </h3>
              <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
                Select your flow intensity if experiencing bleeding today
              </p>
            </div>
            {flow && (
              <button
                type="button"
                onClick={() => setFlow(null)}
                className="text-[11px] font-bold text-rose-500 hover:underline"
              >
                Clear Flow
              </button>
            )}
          </div>

          <FlowSelector selectedFlow={flow} onSelect={setFlow} />
        </div>

        {/* Section 2: Physical & Emotional Symptoms */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-bloom-primary" />
              <span>Physical Symptoms</span>
            </h3>
            <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
              Tap any sensations you felt today (multi-select)
            </p>
          </div>

          <SymptomSelector selectedSymptoms={symptoms} onToggle={handleToggleSymptom} />
        </div>

        {/* Section 3: Mood & Emotional Space */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
              Mood & Mindset
            </h3>
            <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
              How does your heart and mind feel right now?
            </p>
          </div>

          <MoodSelector selectedMood={mood} onSelect={setMood} />
        </div>

        {/* Section 4: Energy, Water, Sleep & Notes */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-6">
          <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
            Vitality & Habits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Energy Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted mb-2">
                Energy Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ENERGY_LEVELS.map((el) => (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => setEnergy(el.id)}
                    className={`p-2.5 rounded-2xl border text-center text-xs font-bold transition-all ${
                      energy === el.id
                        ? 'bg-bloom-primary text-white border-bloom-primary shadow-sm'
                        : 'bg-bloom-bg/60 dark:bg-bloom-darkbg text-bloom-dark dark:text-bloom-darktext border-bloom-border dark:border-bloom-darkborder'
                    }`}
                  >
                    {el.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Hours */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-bloom-accent" />
                  <span>Sleep Duration</span>
                </label>
                <span className="text-xs font-extrabold text-bloom-deep dark:text-pink-300">
                  {sleepHours} hrs
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full accent-bloom-primary"
              />
              <div className="flex justify-between text-[10px] text-bloom-subtle mt-1">
                <span>0 hrs</span>
                <span>8 hrs</span>
                <span>14 hrs</span>
              </div>
            </div>

            {/* Water Intake */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted flex items-center gap-1.5">
                  <GlassWater className="w-3.5 h-3.5 text-bloom-primary" />
                  <span>Water Intake</span>
                </label>
                <span className="text-xs font-extrabold text-bloom-deep dark:text-pink-300">
                  {waterMl} ml ({Math.round(waterMl / 250)} glasses)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWaterMl(Math.max(0, waterMl - 250))}
                  className="px-3 py-1.5 rounded-xl border border-bloom-border dark:border-bloom-darkborder text-xs font-bold"
                >
                  -250ml
                </button>
                <div className="flex-1 bg-bloom-light/50 dark:bg-bloom-darkborder h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-bloom-primary h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (waterMl / 3000) * 100)}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setWaterMl(waterMl + 250)}
                  className="px-3 py-1.5 rounded-xl border border-bloom-border dark:border-bloom-darkborder text-xs font-bold"
                >
                  +250ml
                </button>
              </div>
            </div>

            {/* Daily Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted mb-2 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-bloom-primary" />
                <span>Personal Notes</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special notes or medications..."
                className="w-full px-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-xs text-bloom-dark dark:text-bloom-darktext focus:outline-none focus:ring-2 focus:ring-bloom-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-bloom-primary to-bloom-deep text-white font-bold text-sm shadow-lg shadow-bloom-primary/25 hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Record...' : `Save Log for ${selectedDate}`}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

