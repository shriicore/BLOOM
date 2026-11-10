import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Send,
  Calendar,
  Search,
  Check,
  X,
  Trash2,
  AlertCircle,
  BrainCircuit,
  Heart,
  Smile,
  ShieldAlert
} from 'lucide-react';
import { api } from '../api';

export default function JournalPage({ onTagsSynced }) {
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live or preview NLP state
  const [nlpPreview, setNlpPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Active sync prompt after saving
  const [syncPrompt, setSyncPrompt] = useState(null); // { entryId, message, symptoms, mood }

  const loadEntries = async (query = '') => {
    try {
      setLoading(true);
      const data = await api.getJournal(query);
      setEntries(data || []);
    } catch (err) {
      console.error('Failed to load journals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadEntries(searchQuery);
  };

  // Debounced NLP analysis as user writes
  useEffect(() => {
    if (!content.trim() || content.trim().length < 8) {
      setNlpPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsAnalyzing(true);
        const res = await api.analyzeJournal(content);
        setNlpPreview(res);
      } catch (err) {
        console.error('NLP preview error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [content]);

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      const res = await api.saveJournal(title || 'Cycle Reflection', content, entryDate);
      const analysis = res.nlp_analysis;

      // Reset form
      setTitle('');
      setContent('');
      setNlpPreview(null);

      // Reload entries
      await loadEntries();

      // If symptoms or mood were detected, show the interactive prompt to synchronize
      if (analysis && (analysis.detected_symptoms?.length > 0 || analysis.detected_mood)) {
        setSyncPrompt({
          entryId: res.entry_id,
          message: analysis.suggestion_message,
          symptoms: analysis.detected_symptoms || [],
          mood: analysis.detected_mood || null
        });
      }
    } catch (err) {
      alert(err.message || 'Error saving journal entry');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSync = async () => {
    if (!syncPrompt) return;
    try {
      await api.confirmJournalTags(syncPrompt.entryId, syncPrompt.symptoms, syncPrompt.mood);
      alert('Suggestions added to your daily symptom log!');
      setSyncPrompt(null);
      await loadEntries();
      if (onTagsSynced) onTagsSynced();
    } catch (err) {
      alert(err.message || 'Error syncing tags');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      await api.deleteJournal(id);
      await loadEntries();
    } catch (err) {
      alert(err.message || 'Error deleting entry');
    }
  };

  const samplePrompt = "I have been feeling tired and experiencing cramps today. My mood is also low.";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="bg-white dark:bg-bloom-darkcard p-6 sm:p-8 rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 text-xs font-semibold mb-2">
          <BrainCircuit className="w-3.5 h-3.5 text-bloom-primary" />
          <span>Natural Language Processing & Reflection</span>
        </div>
        <h2 className="text-3xl font-extrabold font-serif text-bloom-dark dark:text-bloom-darktext">
          NLP-Powered Cycle Journal
        </h2>
        <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
          Write openly about physical sensations, emotional currents and daily experiences.
          Bloom's NLP automatically extracts symptom cues and mood sentiments.
        </p>

        {/* Medical disclaimer note */}
        <div className="mt-4 p-3 rounded-2xl bg-bloom-bg/80 dark:bg-bloom-darkbg border border-bloom-border/40 dark:border-bloom-darkborder/40 flex items-center gap-2 text-[11px] text-bloom-subtle dark:text-bloom-darkmuted">
          <ShieldAlert className="w-4 h-4 text-bloom-primary flex-shrink-0" />
          <span>
            Bloom's NLP insights are AI pattern suggestions to assist your personal tracking and are never a clinical diagnosis or medical advice.
          </span>
        </div>
      </div>

      {/* Synchronize Prompt Banner (If newly saved entry has detections) */}
      {syncPrompt && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-bloom-surface via-bloom-light/50 to-white dark:from-bloom-darkcard dark:to-bloom-darkborder border-2 border-bloom-deep/40 shadow-bloom animate-bloom-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-bloom-deep text-white text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>NLP Suggestion</span>
              </div>
              <h4 className="text-base font-bold text-bloom-dark dark:text-bloom-darktext">
                {syncPrompt.message}
              </h4>
              <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted">
                Confirming will seamlessly append these detected tags to your daily symptom log for that date.
              </p>
            </div>

            <button
              onClick={() => setSyncPrompt(null)}
              className="p-1 rounded-full text-bloom-subtle hover:text-bloom-dark dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleConfirmSync}
              className="px-5 py-2 rounded-full bg-bloom-deep hover:bg-bloom-primary text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Yes, Add to Today's Log</span>
            </button>
            <button
              onClick={() => setSyncPrompt(null)}
              className="px-4 py-2 rounded-full border border-bloom-border dark:border-bloom-darkborder text-xs font-semibold text-bloom-subtle hover:bg-bloom-light/40 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* New Journal Entry Form */}
      <form onSubmit={handleSubmitEntry} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
            Write New Entry
          </h3>

          <div className="flex items-center gap-2 bg-bloom-bg dark:bg-bloom-darkbg px-3 py-1.5 rounded-2xl border border-bloom-border dark:border-bloom-darkborder">
            <Calendar className="w-3.5 h-3.5 text-bloom-primary" />
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-bloom-dark dark:text-bloom-darktext focus:outline-none"
            />
          </div>
        </div>

        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry Title (optional, e.g. Mid-Cycle Reflections)"
            className="w-full px-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-sm text-bloom-dark dark:text-bloom-darktext font-semibold focus:outline-none focus:ring-2 focus:ring-bloom-primary/40"
          />
        </div>

        <div>
          <textarea
            rows={5}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write how your body feels today, emotional observations, fatigue, cramps, energy..."
            className="w-full p-4 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-sm text-bloom-dark dark:text-bloom-darktext leading-relaxed focus:outline-none focus:ring-2 focus:ring-bloom-primary/40"
          />
          <div className="flex items-center justify-between mt-1 text-[11px] text-bloom-subtle dark:text-bloom-darkmuted">
            <button
              type="button"
              onClick={() => setContent(samplePrompt)}
              className="text-bloom-deep dark:text-pink-300 hover:underline"
            >
              Insert example prompt: "{samplePrompt}"
            </button>
            <span>{content.length} characters</span>
          </div>
        </div>

        {/* Live NLP Preview Box */}
        {nlpPreview && (
          <div className="p-4 rounded-2xl bg-bloom-light/40 dark:bg-bloom-darkbg/70 border border-bloom-border/70 dark:border-bloom-darkborder space-y-2.5 text-xs animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-bloom-dark dark:text-bloom-darktext flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-bloom-primary" />
                <span>Live NLP Text Analysis</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                nlpPreview.sentiment_label === 'positive'
                  ? 'bg-emerald-100 text-emerald-700'
                  : nlpPreview.sentiment_label === 'negative'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-bloom-light text-bloom-deep'
              }`}>
                Sentiment: {nlpPreview.sentiment_label} ({nlpPreview.sentiment_score})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-bloom-subtle dark:text-bloom-darkmuted">Detected Symptoms:</span>
              {nlpPreview.detected_symptoms?.length > 0 ? (
                nlpPreview.detected_symptoms.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-white dark:bg-bloom-darkcard border border-bloom-primary/40 font-bold text-bloom-deep dark:text-pink-300 capitalize">
                    {s.replace('_', ' ')}
                  </span>
                ))
              ) : (
                <span className="text-bloom-subtle italic">None detected</span>
              )}
            </div>

            {nlpPreview.detected_mood && (
              <div className="flex items-center gap-2">
                <span className="text-bloom-subtle dark:text-bloom-darkmuted">Detected Mood:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-bloom-darkcard border border-bloom-primary/40 font-bold text-bloom-deep dark:text-pink-300 capitalize">
                  {nlpPreview.detected_mood}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-bloom-primary to-bloom-deep text-white font-bold text-xs shadow-md shadow-bloom-primary/25 hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{saving ? 'Analyzing & Saving...' : 'Save & Analyze Entry'}</span>
          </button>
        </div>
      </form>

      {/* Searchable Journal History Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
            Journal History
          </h3>

          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-bloom-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white dark:bg-bloom-darkcard border border-bloom-border dark:border-bloom-darkborder text-xs text-bloom-dark dark:text-bloom-darktext focus:outline-none"
            />
          </form>
        </div>

        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-6 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-bloom-dark dark:text-bloom-darktext font-serif">
                      {entry.title || 'Cycle Reflection'}
                    </h4>
                    <span className="text-xs text-bloom-subtle dark:text-bloom-darkmuted">
                      {entry.entry_date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {entry.detected_mood && (
                      <span className="px-2.5 py-0.5 rounded-full bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 font-bold text-[11px] capitalize">
                        {entry.detected_mood}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-1.5 rounded-lg text-bloom-subtle hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-bloom-dark dark:text-bloom-darktext leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>

                {entry.detected_symptoms?.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-bloom-border/40 dark:border-bloom-darkborder/40">
                    <span className="text-[11px] text-bloom-subtle dark:text-bloom-darkmuted font-semibold">
                      NLP Tags:
                    </span>
                    {entry.detected_symptoms.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-bloom-bg dark:bg-bloom-darkbg text-[10px] font-bold text-bloom-deep dark:text-pink-300 border border-bloom-border/60 dark:border-bloom-darkborder capitalize">
                        {s.replace('_', ' ')}
                      </span>
                    ))}
                    {entry.tags_confirmed ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 ml-auto">
                        <Check className="w-3 h-3" /> Synced to Daily Log
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-bloom-darkcard rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder text-xs text-bloom-subtle dark:text-bloom-darkmuted">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-bloom-primary opacity-60" />
            <p className="font-semibold text-bloom-dark dark:text-bloom-darktext">No journal entries found</p>
            <p className="mt-1">Write your thoughts above to start tracking your psychological & physical journey!</p>
          </div>
        )}
      </div>
    </div>
  );
}

