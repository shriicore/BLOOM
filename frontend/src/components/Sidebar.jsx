import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  HeartPulse,
  BarChart3,
  BookOpen,
  GraduationCap,
  Settings,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'tracker', label: 'Track Symptoms', icon: HeartPulse },
    { id: 'analytics', label: 'Insights & Analytics', icon: BarChart3 },
    { id: 'journal', label: 'NLP Journal', icon: BookOpen, badge: 'AI' },
    { id: 'learn', label: 'Wellness Guide', icon: GraduationCap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 z-40 md:z-20 h-[calc(100vh-4rem)] w-64 bg-white/90 dark:bg-bloom-darkcard/90 backdrop-blur-lg border-r border-bloom-border/60 dark:border-bloom-darkborder p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-1.5">
          <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-bloom-subtle dark:text-bloom-darkmuted">
            Menu Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-bloom-primary to-bloom-deep text-white shadow-md shadow-bloom-primary/25 font-semibold'
                    : 'text-bloom-dark dark:text-bloom-darktext hover:bg-bloom-light/60 dark:hover:bg-bloom-darkborder/60 hover:text-bloom-deep'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-bloom-primary dark:text-pink-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-bloom-light dark:bg-bloom-darkborder text-bloom-deep dark:text-pink-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Banner Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-bloom-light/60 to-bloom-surface/80 dark:from-bloom-darkborder/40 dark:to-bloom-darkborder/20 border border-bloom-border dark:border-bloom-darkborder text-xs text-bloom-subtle dark:text-bloom-darkmuted">
          <div className="flex items-center gap-2 mb-1 text-bloom-deep dark:text-pink-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gentle Reminder</span>
          </div>
          <p className="leading-relaxed">
            Listen to your body. Every cycle is unique, and small changes are completely natural.
          </p>
        </div>
      </aside>
    </>
  );
}

