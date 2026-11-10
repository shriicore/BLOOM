import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Droplet,
  Sparkles,
  Calendar as CalendarIcon,
  Trash2,
  Plus,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';
import { FlowSelector, SymptomSelector, MoodSelector } from '../components/SymptomChips';

export default function CalendarPage({ onPeriodLogged }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick edit state for selected day
  const [isEditing, setIsEditing] = useState(false);
  const [editFlow, setEditFlow] = useState('medium');
  const [editSymptoms, setEditSymptoms] = useState([]);
  const [editMood, setEditMood] = useState(null);
  const [saving, setSaving] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const loadCalendar = async (y, m) => {
    try {
      setLoading(true);
      const data = await api.getCalendar(y, m);
      setCalendarData(data);
      // Select today by default if in current month, otherwise first day
      const todayStr = new Date().toISOString().split('T')[0];
      const matchToday = data.days?.find((d) => d.date === todayStr);
      if (matchToday) {
        setSelectedDay(matchToday);
      } else if (data.days?.length > 0) {
        setSelectedDay(data.days[0]);
      }
    } catch (err) {
      console.error('Failed to load calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar(year, month);
  }, [year, month]);

  useEffect(() => {
    if (selectedDay) {
      const details = selectedDay.symptom_details;
      setEditFlow(selectedDay.logged_flow || details?.flow || 'medium');
      let syms = [];
      try {
        syms = Array.isArray(details?.symptoms) ? details.symptoms : JSON.parse(details?.symptoms || '[]');
      } catch (e) {
        syms = [];
      }
      setEditSymptoms(syms);
      setEditMood(details?.mood || null);
    }
  }, [selectedDay]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  const handleTogglePeriodOnSelectedDay = async () => {
    if (!selectedDay) return;
    setSaving(true);
    try {
      if (selectedDay.is_logged_period && selectedDay.period_log_id) {
        // Remove or update period
        await api.deletePeriod(selectedDay.period_log_id);
      } else {
        // Add single-day or start period
        await api.createPeriod({
          start_date: selectedDay.date,
          end_date: selectedDay.date,
          flow: editFlow || 'medium',
          notes: 'Marked from interactive calendar'
        });
      }
      await loadCalendar(year, month);
      if (onPeriodLogged) onPeriodLogged();
    } catch (err) {
      alert(err.message || 'Error updating period log');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDaySymptoms = async () => {
    if (!selectedDay) return;
    setSaving(true);
    try {
      await api.saveSymptoms({
        log_date: selectedDay.date,
        flow: editFlow,
        symptoms: editSymptoms,
        mood: editMood,
      });
      await loadCalendar(year, month);
      setIsEditing(false);
    } catch (err) {
      alert(err.message || 'Error saving symptoms');
    } finally {
      setSaving(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Pad empty days at start for proper alignment
  const firstDayWeekday = calendarData?.days?.[0]?.weekday ?? 0;
  const paddingDays = Array.from({ length: firstDayWeekday });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Calendar Header / Month Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-bloom-darkcard p-6 rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
        <div>
          <h2 className="text-3xl font-extrabold font-serif text-bloom-dark dark:text-bloom-darktext">
            {monthNames[month - 1]} {year}
          </h2>
          <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
            Confirmed periods, estimated cycle forecasts, and symptom logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToday}
            className="px-3.5 py-1.5 rounded-full border border-bloom-border dark:border-bloom-darkborder text-xs font-bold text-bloom-dark dark:text-bloom-darktext hover:bg-bloom-light/50 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-bloom-bg dark:bg-bloom-darkbg rounded-full p-1 border border-bloom-border dark:border-bloom-darkborder">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full hover:bg-white dark:hover:bg-bloom-darkcard text-bloom-dark dark:text-bloom-darktext transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-full hover:bg-white dark:hover:bg-bloom-darkcard text-bloom-dark dark:text-bloom-darktext transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Month Grid + Selected Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Monthly Grid */}
        <div className="lg:col-span-8 bg-white dark:bg-bloom-darkcard p-6 rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted">
            {dayHeaders.map((dh) => (
              <div key={dh} className="py-1">{dh}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Leading empty padding */}
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} className="h-16 sm:h-20 rounded-2xl bg-bloom-bg/20 dark:bg-bloom-darkbg/20 opacity-30" />
            ))}

            {/* Calendar Days */}
            {calendarData?.days?.map((item) => {
              const isSelected = selectedDay?.date === item.date;

              return (
                <button
                  key={item.date}
                  type="button"
                  onClick={() => setSelectedDay(item)}
                  className={`relative h-16 sm:h-20 p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                    isSelected
                      ? 'ring-2 ring-bloom-deep dark:ring-pink-400 shadow-md scale-[1.03] z-10'
                      : 'hover:border-bloom-primary/60 hover:scale-[1.01]'
                  } ${
                    item.is_logged_period
                      ? 'bg-gradient-to-br from-bloom-deep to-bloom-primary text-white border-transparent'
                      : item.is_predicted_period
                      ? 'bg-bloom-light/80 dark:bg-bloom-darkborder/70 border-dashed border-bloom-deep text-bloom-deep dark:text-pink-300'
                      : item.is_predicted_ovulation
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                      : item.is_predicted_fertile
                      ? 'bg-pink-50/70 dark:bg-pink-950/20 border-bloom-secondary/60 text-bloom-dark dark:text-bloom-darktext'
                      : 'bg-white dark:bg-bloom-darkbg/50 border-bloom-border/70 dark:border-bloom-darkborder text-bloom-dark dark:text-bloom-darktext'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-extrabold ${item.is_today ? 'w-5 h-5 rounded-full bg-bloom-dark text-white dark:bg-white dark:text-bloom-dark flex items-center justify-center font-bold' : ''}`}>
                      {item.day}
                    </span>

                    {item.is_logged_period && (
                      <Droplet className="w-3.5 h-3.5 fill-white text-white" />
                    )}
                    {item.is_predicted_ovulation && (
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    )}
                  </div>

                  {/* Badges / indicators */}
                  <div className="flex items-center gap-1">
                    {item.has_symptoms && !item.is_logged_period && (
                      <span className="w-2 h-2 rounded-full bg-bloom-primary" title="Symptoms logged" />
                    )}
                    {item.is_predicted_period && (
                      <span className="text-[9px] font-bold uppercase truncate">
                        Est. Period
                      </span>
                    )}
                    {item.is_predicted_ovulation && (
                      <span className="text-[9px] font-bold uppercase truncate">
                        Ovulation
                      </span>
                    )}
                    {item.is_predicted_fertile && (
                      <span className="text-[9px] font-medium text-bloom-deep dark:text-pink-300 uppercase truncate">
                        Fertile
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-bloom-border/60 dark:border-bloom-darkborder flex flex-wrap items-center gap-4 text-xs text-bloom-subtle dark:text-bloom-darkmuted">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-bloom-deep" />
              <span>Logged Period (Confirmed)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-bloom-light border border-dashed border-bloom-deep" />
              <span>Predicted Period</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-200 border border-amber-400" />
              <span>Estimated Ovulation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-pink-100 border border-bloom-secondary" />
              <span>Fertile Window</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Date Quick Details & Action */}
        <div className="lg:col-span-4 bg-white dark:bg-bloom-darkcard p-6 rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted">
              SELECTED DATE
            </span>
            <h3 className="text-xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext mt-1">
              {selectedDay ? selectedDay.date : 'Select a date'}
            </h3>
            {selectedDay?.is_today && (
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300">
                Today
              </span>
            )}
          </div>

          {selectedDay && (
            <div className="space-y-4">
              {/* Status summary pill */}
              <div className="p-4 rounded-2xl bg-bloom-bg/80 dark:bg-bloom-darkbg border border-bloom-border/50 dark:border-bloom-darkborder/50 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-bloom-subtle dark:text-bloom-darkmuted">Period Status:</span>
                  <span className="font-bold text-bloom-dark dark:text-bloom-darktext">
                    {selectedDay.is_logged_period
                      ? 'Confirmed Logged Period'
                      : selectedDay.is_predicted_period
                      ? 'Forecasted Period Day'
                      : 'Non-Bleeding Day'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-bloom-subtle dark:text-bloom-darkmuted">Fertility Status:</span>
                  <span className="font-bold text-bloom-dark dark:text-bloom-darktext">
                    {selectedDay.is_predicted_ovulation
                      ? 'Peak Ovulation Day'
                      : selectedDay.is_predicted_fertile
                      ? 'Estimated Fertile Window'
                      : 'Low Chance'}
                  </span>
                </div>
              </div>

              {/* Period Quick Toggle Button */}
              <button
                onClick={handleTogglePeriodOnSelectedDay}
                disabled={saving}
                className={`w-full py-2.5 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                  selectedDay.is_logged_period
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
                    : 'bg-bloom-primary hover:bg-bloom-deep text-white shadow-md'
                }`}
              >
                {selectedDay.is_logged_period ? (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Period Log for This Day</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-3.5 h-3.5" />
                    <span>Mark as Confirmed Period Day</span>
                  </>
                )}
              </button>

              {/* Logged symptoms & Mood preview */}
              <div className="border-t border-bloom-border/50 dark:border-bloom-darkborder/50 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-bloom-dark dark:text-bloom-darktext">
                    Symptoms & Mood
                  </h4>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs font-bold text-bloom-deep dark:text-pink-300 hover:underline"
                  >
                    {isEditing ? 'Cancel' : 'Edit Symptoms'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-bloom-dark dark:text-bloom-darktext mb-1">
                        Bleeding Flow
                      </label>
                      <FlowSelector selectedFlow={editFlow} onSelect={setEditFlow} />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-bloom-dark dark:text-bloom-darktext mb-1">
                        Select Symptoms
                      </label>
                      <SymptomSelector
                        selectedSymptoms={editSymptoms}
                        onToggle={(id) => {
                          setEditSymptoms((prev) =>
                            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                          );
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSaveDaySymptoms}
                      disabled={saving}
                      className="w-full py-2.5 rounded-2xl bg-bloom-deep hover:bg-bloom-primary text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save for This Date'}</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    {editSymptoms.length > 0 || editMood ? (
                      <div className="space-y-2">
                        {editMood && (
                          <div className="text-xs">
                            <span className="text-bloom-subtle dark:text-bloom-darkmuted font-medium">Mood: </span>
                            <span className="font-semibold text-bloom-dark dark:text-bloom-darktext capitalize">{editMood}</span>
                          </div>
                        )}
                        {editSymptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {editSymptoms.map((s, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-xl bg-bloom-light/80 dark:bg-bloom-darkborder text-[11px] font-semibold text-bloom-deep dark:text-pink-300 capitalize">
                                {s.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted">
                        No symptoms logged for this date. Click "Edit Symptoms" to record.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

