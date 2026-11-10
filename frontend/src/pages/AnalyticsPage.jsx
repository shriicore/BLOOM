import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-bloom-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-bloom-subtle animate-pulse">Calculating cycle metrics...</p>
        </div>
      </div>
    );
  }

  const metrics = analytics?.metrics || {};
  const cycleHistory = analytics?.cycle_history || [];
  const periodDurationHistory = analytics?.period_duration_history || [];
  const symptomDist = analytics?.symptom_distribution || [];
  const moodDist = analytics?.mood_distribution || [];
  const flowDist = analytics?.flow_distribution || [];

  // Elegant Pink Palette for Charts
  const PINK_PALETTE = ['#D96C91', '#F4B8CC', '#B94D75', '#A66C83', '#FCE4EC', '#8C7282'];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="bg-white dark:bg-bloom-darkcard p-6 sm:p-8 rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Biological Rhythm Intelligence</span>
        </div>
        <h2 className="text-3xl font-extrabold font-serif text-bloom-dark dark:text-bloom-darktext">
          Cycle Insights & Analytics
        </h2>
        <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
          Real statistical indicators derived from your confirmed period logs and daily symptoms.
        </p>
      </div>

      {/* Top 4 Metric Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
          <span className="text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted">
            Average Cycle Length
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black font-serif text-bloom-dark dark:text-bloom-darktext">
              {metrics.avg_cycle_length || 28}
            </span>
            <span className="text-xs font-semibold text-bloom-subtle dark:text-bloom-darkmuted">days</span>
          </div>
          <p className="text-[11px] text-bloom-subtle dark:text-bloom-darkmuted mt-2">
            {metrics.is_dynamically_calculated
              ? 'Weighted average from logged cycles'
              : 'Initial calibrated baseline'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
          <span className="text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted">
            Average Period Duration
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black font-serif text-bloom-dark dark:text-bloom-darktext">
              {metrics.avg_period_duration || 5}
            </span>
            <span className="text-xs font-semibold text-bloom-subtle dark:text-bloom-darkmuted">days</span>
          </div>
          <p className="text-[11px] text-bloom-subtle dark:text-bloom-darkmuted mt-2">
            Average active bleeding window
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
          <span className="text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted">
            Cycle Regularity
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black font-serif text-bloom-deep dark:text-pink-300">
              {metrics.regularity_status || 'Regular'}
            </span>
          </div>
          <p className="text-[11px] text-bloom-subtle dark:text-bloom-darkmuted mt-2">
            Variation: ±{metrics.std_dev ?? 0} days std dev
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
          <span className="text-xs font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted">
            Data Points Logged
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black font-serif text-bloom-dark dark:text-bloom-darktext">
              {analytics?.total_days_tracked || 0}
            </span>
            <span className="text-xs font-semibold text-bloom-subtle dark:text-bloom-darkmuted">days</span>
          </div>
          <p className="text-[11px] text-bloom-subtle dark:text-bloom-darkmuted mt-2">
            Across {analytics?.total_periods_logged || 0} historical cycle periods
          </p>
        </div>
      </div>

      {/* Row 1: Cycle Length History & Period Duration History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cycle Length History Bar Chart */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
          <div className="mb-6">
            <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
              Cycle Length Trends
            </h3>
            <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
              Interval in days between consecutive period start dates
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FCE4EC" opacity={0.6} />
                <XAxis dataKey="cycle_index" tick={{ fontSize: 11, fill: '#8C7282' }} />
                <YAxis domain={[15, 45]} tick={{ fontSize: 11, fill: '#8C7282' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #F9D8E4',
                    boxShadow: '0 8px 24px rgba(217, 108, 145, 0.15)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="cycle_length" fill="#D96C91" radius={[8, 8, 0, 0]} name="Cycle Length (Days)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Period Duration Chart */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
          <div className="mb-6">
            <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
              Period Duration History
            </h3>
            <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
              Number of bleeding days per cycle
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodDurationHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FCE4EC" opacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8C7282' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#8C7282' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #F9D8E4',
                    boxShadow: '0 8px 24px rgba(217, 108, 145, 0.15)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="duration_days" fill="#B94D75" radius={[8, 8, 0, 0]} name="Duration (Days)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Symptom Frequency & Mood / Flow Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Symptom Frequency (8 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
          <div className="mb-6">
            <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
              Symptom Frequency Distribution
            </h3>
            <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
              Most frequently experienced physical sensations
            </p>
          </div>

          {symptomDist.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={symptomDist}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#FCE4EC" opacity={0.6} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#8C7282' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#8C7282' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #F9D8E4',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="#D96C91" radius={[0, 8, 8, 0]} name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-bloom-subtle dark:text-bloom-darkmuted">
              No symptoms tracked yet. Log symptoms daily to generate distribution charts!
            </div>
          )}
        </div>

        {/* Mood Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
              Mood Breakdown
            </h3>
            <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
              Emotional states captured over time
            </p>
          </div>

          {moodDist.length > 0 ? (
            <div className="h-56 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodDist}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {moodDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PINK_PALETTE[index % PINK_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #F9D8E4',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-bloom-subtle dark:text-bloom-darkmuted">
              Record daily moods to visualize emotional patterns.
            </div>
          )}

          <div className="pt-4 border-t border-bloom-border/50 dark:border-bloom-darkborder/50 text-[11px] text-bloom-subtle dark:text-bloom-darkmuted text-center">
            Tracking mood fluctuations helps identify hormone shifts during luteal and ovulation phases.
          </div>
        </div>
      </div>
    </div>
  );
}

