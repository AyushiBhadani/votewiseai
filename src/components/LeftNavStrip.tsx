"use client";

import React from 'react';
import { Home, MessageSquare, Calendar, Users, Cloud, Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'home',      icon: Home,         label: 'Dashboard' },
  { id: 'users',     icon: MessageSquare, label: 'Chat History' },
  { id: 'calendar',  icon: Calendar,     label: 'Election Calendar' },
  { id: 'community', icon: Users,        label: 'Community' },
];

const BOTTOM_ITEMS = [
  { id: 'cloud',    icon: Cloud,    label: 'Cloud & Files' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function LeftNavStrip() {
  const { activeNavTab, setActiveNavTab, reminders } = useAppStore();

  const NavButton = ({ id, icon: Icon, label, badge }: { id: string; icon: any; label: string; badge?: boolean }) => {
    const isActive = activeNavTab === id;
    return (
      <div className="relative group">
        <motion.button
          onClick={() => setActiveNavTab(id)}
          whileTap={{ scale: 0.92 }}
          className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
            isActive
              ? 'nav-active-glow text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.06]'
          }`}
          title={label}
        >
          {isActive && (
            <motion.div
              layoutId="activeNav"
              className="absolute inset-0 rounded-2xl bg-primary/10 border border-primary/25"
              style={{ boxShadow: '0 0 20px rgba(99,102,241,0.2)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Icon className="w-5 h-5 relative z-10" />
          {badge && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full animate-pulse z-10" />
          )}
        </motion.button>

        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-border" />
        </div>
      </div>
    );
  };

  return (
    <div className="w-[68px] h-full border-r border-white/[0.04] bg-black/20 backdrop-blur-xl flex flex-col items-center py-5 space-y-2 flex-shrink-0">
      {/* Logo dot */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
        <div className="w-3 h-3 bg-white rounded-sm opacity-90" />
      </div>

      <div className="w-8 h-px bg-white/[0.06] mb-2" />

      {/* Main Nav */}
      {NAV_ITEMS.map(item => (
        <NavButton key={item.id} {...item} />
      ))}

      <div className="flex-1" />

      <div className="w-8 h-px bg-white/[0.06] mb-2" />

      {/* Bottom Nav */}
      {BOTTOM_ITEMS.map(item => (
        <NavButton
          key={item.id}
          {...item}
        />
      ))}
    </div>
  );
}
