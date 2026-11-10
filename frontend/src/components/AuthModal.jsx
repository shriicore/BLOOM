import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        localStorage.setItem('bloom_token', res.token);
        localStorage.setItem('bloom_user', JSON.stringify(res.user));
        onSuccess(res.user, false);
      } else {
        const res = await api.register(name, email, password);
        localStorage.setItem('bloom_token', res.token);
        localStorage.setItem('bloom_user', JSON.stringify(res.user));
        // Flag for onboarding walkthrough
        onSuccess(res.user, true);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-bloom-darkcard rounded-3xl p-8 border border-bloom-border/70 dark:border-bloom-darkborder shadow-bloom-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-bloom-subtle hover:text-bloom-dark dark:text-bloom-darkmuted dark:hover:text-white hover:bg-bloom-light/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-bloom-deep to-bloom-primary flex items-center justify-center shadow-md shadow-bloom-primary/20 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-bloom-dark dark:text-bloom-darktext">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Bloom Space'}
          </h2>
          <p className="text-xs text-bloom-subtle dark:text-bloom-darkmuted mt-1">
            {mode === 'login'
              ? 'Log in to access your cycle records and wellness insights'
              : 'Start tracking your natural rhythm in total privacy'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-bloom-light/60 dark:bg-bloom-darkborder rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-bloom-darkcard text-bloom-deep dark:text-pink-300 shadow-sm'
                : 'text-bloom-subtle dark:text-bloom-darkmuted'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-bloom-darkcard text-bloom-deep dark:text-pink-300 shadow-sm'
                : 'text-bloom-subtle dark:text-bloom-darkmuted'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1">
                Your Preferred Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-bloom-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shriya"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-sm text-bloom-dark dark:text-bloom-darktext focus:outline-none focus:ring-2 focus:ring-bloom-primary/40 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-bloom-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-sm text-bloom-dark dark:text-bloom-darktext focus:outline-none focus:ring-2 focus:ring-bloom-primary/40 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-bloom-dark dark:text-bloom-darktext mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-bloom-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-bloom-bg/60 dark:bg-bloom-darkbg border border-bloom-border dark:border-bloom-darkborder text-sm text-bloom-dark dark:text-bloom-darktext focus:outline-none focus:ring-2 focus:ring-bloom-primary/40 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-bloom-primary to-bloom-deep text-white font-semibold text-sm shadow-md shadow-bloom-primary/25 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}

