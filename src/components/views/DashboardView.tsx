"use client";

import React, { useState } from 'react';
import SidebarLeft from '@/components/SidebarLeft';
import Timeline from '@/components/Timeline';
import AIChat from '@/components/AIChat';
import SidebarRight from '@/components/SidebarRight';
import CardsRow from '@/components/CardsRow';
import { ChevronLeft, ChevronRight, LayoutPanelLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardView() {
  const [showLeftPanel, setShowLeftPanel] = useState(false);

  return (
    <div className="flex-1 flex overflow-hidden min-h-0">

      {/* COLLAPSIBLE LEFT PANEL */}
      <AnimatePresence initial={false}>
        {showLeftPanel && (
          <motion.div
            key="left-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className="w-[300px] h-full p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
              <SidebarLeft />
              <Timeline />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN: Chat (hero) + Cards below */}
      <div className="flex-1 flex flex-col min-w-0 p-2 md:p-4 gap-3 md:gap-4 overflow-hidden min-h-0">

        {/* Toggle button - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowLeftPanel(p => !p)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground bg-white/[0.04] border border-white/[0.08] hover:border-primary/30 transition-all"
          >
            <LayoutPanelLeft className="w-3.5 h-3.5" />
            <span>{showLeftPanel ? 'Hide' : 'Show'} Voting Journey</span>
            {showLeftPanel ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>

        {/* AI Chat — HERO */}
        <div className="flex-1 min-h-0">
          <AIChat />
        </div>

        {/* Bottom Cards */}
        <div className="flex-shrink-0">
          <CardsRow />
        </div>
      </div>

      {/* RIGHT SIDEBAR — fixed width, always visible on large screens */}
      <div className="hidden xl:flex flex-col w-[280px] flex-shrink-0 p-4 gap-4 overflow-y-auto custom-scrollbar border-l border-white/[0.04]">
        <SidebarRight />
      </div>

    </div>
  );
}
