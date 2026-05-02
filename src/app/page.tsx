"use client";

import React, { useEffect } from 'react';
import LeftNavStrip from '@/components/LeftNavStrip';
import TopNav from '@/components/TopNav';
import DashboardView from '@/components/views/DashboardView';
import CommunityView from '@/components/views/CommunityView';
import ChatHistoryView from '@/components/views/ChatHistoryView';
import CalendarView from '@/components/views/CalendarView';
import CloudView from '@/components/views/CloudView';
import SettingsView from '@/components/views/SettingsView';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppStore } from '@/store/useAppStore';
import { useAnonymousAuth } from '@/hooks/useAnonymousAuth';

const VIEW_LABELS: Record<string, string> = {
  home:      'AI Dashboard',
  users:     'Chat History',
  calendar:  'Election Calendar',
  community: 'Community Hub',
  cloud:     'Cloud & Resources',
  settings:  'Settings',
};

export default function Home() {
  const { activeNavTab } = useAppStore();
  useAnonymousAuth();

  // Rehydrate Zustand persist store on client — fixes Next.js SSR hydration mismatch
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  const renderActiveView = () => {
    switch (activeNavTab) {
      case 'home':      return <DashboardView />;
      case 'users':     return <ChatHistoryView />;
      case 'calendar':  return <CalendarView />;
      case 'community': return <CommunityView />;
      case 'cloud':     return <CloudView />;
      case 'settings':  return <SettingsView />;
      default:          return <DashboardView />;
    }
  };

  const currentLabel = VIEW_LABELS[activeNavTab] ?? 'VoteWise AI';

  return (
    <>
      {/* Accessibility: skip to main content for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-xl focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <main
        className="h-screen w-full overflow-hidden bg-[#050b14] flex font-sans"
        aria-label="VoteWise AI Application"
      >
        {/* Mobile Sidebar Overlay */}
        <div className="md:hidden">
          {useAppStore().isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
              onClick={() => useAppStore.getState().setIsMobileMenuOpen(false)}
            />
          )}
          <div className={`fixed inset-y-0 left-0 z-[100] transform transition-transform duration-300 ease-in-out ${useAppStore().isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <LeftNavStrip />
          </div>
        </div>

        {/* Desktop Left Icon Navigation Strip */}
        <nav aria-label="Primary navigation" className="hidden md:block">
          <LeftNavStrip />
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top Navigation Bar */}
          <header>
            <TopNav />
          </header>

          {/* Active View */}
          <ErrorBoundary>
            <main
              id="main-content"
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
              aria-label={currentLabel}
              tabIndex={-1}
            >
              {renderActiveView()}
            </main>
          </ErrorBoundary>

        </div>
      </main>
    </>
  );
}
