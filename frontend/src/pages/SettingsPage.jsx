import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Lock,
  Calendar,
  Download,
  Trash2,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Bell,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';

export default function SettingsPage({ user, onProfileUpdated, onLogout, onSeedDemo, isSeeding }) {
  const [name, setName] = useState(user?.name || '');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [isRegular, setIsRegular] = useState(true);
  const [reminderDays, setReminderDays] = useState(2);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status banners
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const prefs = await api.getPreferences();
        if (prefs) {
          setCycleLength(prefs.cycle_length || 28);
          setPeriodDuration(prefs.period_duration || 5);
          setIsRegular(prefs.is_regular !== 0);
          setReminderDays(prefs.reminder_days_before || 2);
          setNotificationsEnabled(prefs.notifications_enabled !== 0);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchPrefs();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    setSaving(true);
    try {
      await api.updateProfile(name);
      await api.updatePreferences({
        cycle_length: cycleLength,
        period_duration: periodDuration,
        is_regular: isRegular,
        reminder_days_before: reminderDays,
        notifications_enabled: notificationsEnabled ? 1 : 0
      });
      setMsg('Profile and cycle settings updated successfully!');
      if (onProfileUpdated) onProfileUpdated({ ...user, name });
    } catch (err) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Error updating password');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await api.exportUserData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `bloom_health_export_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setMsg('Personal health data exported successfully!');
    } catch (err) {
      setErrorMsg('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you absolutely sure you want to permanently delete your Bloom account? All cycle history, symptoms, and journal reflections will be erased immediately.'
      )
    ) {
      return;
    }
    try {
      await api.deleteAccount();
      localStorage.clear();
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Error deleting account');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-bloom-darkcard p-6 sm:p-8 rounded-3xl border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Account & Preferences</span>
        </div>
        <h2 className="text-3xl font-extrabold font-serif text-bloom-dark dark:text-bloom-darktext">
          Settings & Privacy
        </h2>
        <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
          Manage your personal details, cycle baseline calculations, security, and privacy data exports.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile & Cycle Calibration Form */}
      <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-6">
        <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext flex items-center gap-2">
          <User className="w-4 h-4 text-bloom-primary" />
          <span>Personal & Cycle Calibration</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-xs text-bloom-dark dark:text-bloom-darktext focus:outline-none focus:ring-2 focus:ring-bloom-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1.5">
              Registered Email (Cannot be changed)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-2xl bg-bloom-bg/30 dark:bg-bloom-darkbg/40 border border-bloom-border/60 dark:border-bloom-darkborder text-xs text-bloom-subtle dark:text-bloom-darkmuted cursor-not-allowed"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-bloom-dark dark:text-bloom-darktext">
                Baseline Cycle Length
              </label>
              <span className="text-xs font-bold text-bloom-deep dark:text-pink-300">
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
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-bloom-dark dark:text-bloom-darktext">
                Baseline Bleeding Duration
              </label>
              <span className="text-xs font-bold text-bloom-deep dark:text-pink-300">
                {periodDuration} days
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={periodDuration}
              onChange={(e) => setPeriodDuration(parseInt(e.target.value))}
              className="w-full accent-bloom-primary"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-bloom-border/50 dark:border-bloom-darkborder/50">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-bloom-dark dark:text-bloom-darktext">
            <input
              type="checkbox"
              checked={isRegular}
              onChange={(e) => setIsRegular(e.target.checked)}
              className="rounded text-bloom-primary focus:ring-bloom-primary accent-bloom-primary w-4 h-4"
            />
            <span>My cycles are usually regular</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-bloom-primary hover:bg-bloom-deep text-white text-xs font-bold shadow-md transition-all self-end sm:self-auto"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-4">
        <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext flex items-center gap-2">
          <Lock className="w-4 h-4 text-bloom-primary" />
          <span>Security & Password</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-xs text-bloom-dark dark:text-bloom-darktext focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-xs text-bloom-dark dark:text-bloom-darktext focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-xs text-bloom-dark dark:text-bloom-darktext focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full border border-bloom-border dark:border-bloom-darkborder hover:bg-bloom-light/50 text-bloom-deep dark:text-pink-300 text-xs font-bold transition-all"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* Data Export & Account Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-bloom-darkcard border border-bloom-border/60 dark:border-bloom-darkborder shadow-bloom space-y-6">
        <div>
          <h3 className="text-lg font-bold font-serif text-bloom-dark dark:text-bloom-darktext flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Privacy & Data Sovereignty</span>
          </h3>
          <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-0.5">
            Your menstrual health records belong strictly to you. Download or erase anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export */}
          <div className="p-4 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border/60 dark:border-bloom-darkborder flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-bloom-dark dark:text-bloom-darktext flex items-center gap-1.5 mb-1">
                <Download className="w-3.5 h-3.5 text-bloom-primary" />
                <span>Export Personal Health Archive</span>
              </h4>
              <p className="text-[11px] text-bloom-subtle dark:text-bloom-darkmuted">
                Download all period dates, symptom records, moods and journal entries in JSON format.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="mt-4 px-4 py-2 rounded-xl bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 font-bold text-xs hover:bg-bloom-secondary/40 transition-colors self-start"
            >
              Export JSON Archive
            </button>
          </div>

          {/* Seed Demo Data */}
          <div className="p-4 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border/60 dark:border-bloom-darkborder flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-bloom-dark dark:text-bloom-darktext flex items-center gap-1.5 mb-1">
                <RefreshCw className="w-3.5 h-3.5 text-bloom-primary" />
                <span>Load Portfolio Demo Data</span>
              </h4>
              <p className="text-[11px] text-bloom-subtle dark:text-bloom-darkmuted">
                Quickly populates 3 full realistic cycles with symptoms and NLP journal reflections.
              </p>
            </div>
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              className="mt-4 px-4 py-2 rounded-xl bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300 font-bold text-xs hover:bg-bloom-secondary/40 transition-colors self-start disabled:opacity-50"
            >
              {isSeeding ? 'Seeding...' : 'Populate Demo Data'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-rose-200/50 dark:border-rose-900/40 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">
              Delete Account & Clear All Records
            </h4>
            <p className="text-[11px] text-bloom-subtle dark:text-bloom-darkmuted">
              Permanently purges your account from Bloom.
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

