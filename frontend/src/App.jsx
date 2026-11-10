import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import OnboardingModal from './components/OnboardingModal';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import TrackerPage from './pages/TrackerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import JournalPage from './pages/JournalPage';
import LearnPage from './pages/LearnPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bloom_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('bloom_dark_mode') === 'true';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Global feedback / toast
  const [isSeeding, setIsSeeding] = useState(false);
  const [globalNotice, setGlobalNotice] = useState(null);

  // Sync dark mode to html tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bloom_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bloom_dark_mode', 'false');
    }
  }, [darkMode]);

  // Auth changed listener
  useEffect(() => {
    const handleAuthChanged = () => {
      const storedUser = localStorage.getItem('bloom_user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    window.addEventListener('bloom_auth_changed', handleAuthChanged);
    return () => window.removeEventListener('bloom_auth_changed', handleAuthChanged);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('bloom_token');
    localStorage.removeItem('bloom_user');
    setUser(null);
    setActiveTab('dashboard');
    showNotice('Logged out securely');
  };

  const handleAuthSuccess = (loggedUser, isNewUser) => {
    setUser(loggedUser);
    if (isNewUser) {
      setOnboardingOpen(true);
    } else {
      showNotice(`Welcome back, ${loggedUser.name}!`);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setIsSeeding(true);
      const res = await api.seedDemoData();
      showNotice(res.message || 'Demo data loaded successfully!');
      // Force refresh active page components
      setActiveTab((prev) => prev);
      window.dispatchEvent(new Event('bloom_demo_seeded'));
    } catch (err) {
      alert(err.message || 'Failed to seed demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  const showNotice = (msg) => {
    setGlobalNotice(msg);
    setTimeout(() => {
      setGlobalNotice(null);
    }, 4000);
  };

  // If user is not authenticated, show the public Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-bloom-bg dark:bg-bloom-darkbg transition-colors font-sans">
        <LandingPage
          onGetStarted={() => {
            setAuthModalMode('register');
            setAuthModalOpen(true);
          }}
          onLogin={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
        />

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bloom-bg dark:bg-bloom-darkbg transition-colors font-sans flex flex-col">
      {/* Top Navigation */}
      <Navbar
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Global Toast Notification */}
      {globalNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-bloom-dark text-white dark:bg-white dark:text-bloom-dark text-xs font-bold shadow-bloom-lg animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-bloom-primary" />
          <span>{globalNotice}</span>
        </div>
      )}

      {/* Main Layout: Sidebar + Page View */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              user={user}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarPage onPeriodLogged={() => showNotice('Period updated on calendar')} />
          )}

          {activeTab === 'tracker' && (
            <TrackerPage onSaved={() => showNotice('Daily symptoms saved!')} />
          )}

          {activeTab === 'analytics' && <AnalyticsPage />}

          {activeTab === 'journal' && (
            <JournalPage onTagsSynced={() => showNotice('Journal tags added to symptom log!')} />
          )}

          {activeTab === 'learn' && <LearnPage />}

          {activeTab === 'settings' && (
            <SettingsPage
              user={user}
              onProfileUpdated={(updated) => {
                setUser(updated);
                localStorage.setItem('bloom_user', JSON.stringify(updated));
                showNotice('Profile updated');
              }}
              onLogout={handleLogout}
              onSeedDemo={handleSeedDemo}
              isSeeding={isSeeding}
            />
          )}
        </main>
      </div>

      {/* Onboarding Dialog (Appears after first registration) */}
      <OnboardingModal
        isOpen={onboardingOpen}
        user={user}
        onComplete={() => {
          setOnboardingOpen(false);
          showNotice(`Welcome to Bloom, ${user.name}!`);
        }}
      />
    </div>
  );
}

