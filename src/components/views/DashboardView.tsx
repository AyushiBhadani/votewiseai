"use client";

import React, { useState } from 'react';
import SidebarLeft from '@/components/SidebarLeft';
import Timeline from '@/components/Timeline';
import AIChat from '@/components/AIChat';
import SidebarRight from '@/components/SidebarRight';
import CardsRow from '@/components/CardsRow';
import { ChevronLeft, ChevronRight, LayoutPanelLeft, ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardView() {
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showCards, setShowCards] = useState(false); // Hidden by default — chat is the hero

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

      {/* MAIN: Chat (hero) + Cards toggled below */}
      <div className="flex-1 flex flex-col min-w-0 p-2 md:p-3 gap-2 overflow-hidden min-h-0">

        {/* Top Toolbar */}
        <div className="hidden md:flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setShowLeftPanel(p => !p)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground bg-white/[0.04] border border-white/[0.08] hover:border-primary/30 transition-all"
            aria-label="Toggle voting journey panel"
          >
            <LayoutPanelLeft className="w-3.5 h-3.5" />
            <span>{showLeftPanel ? 'Hide' : 'Show'} Voting Journey</span>
            {showLeftPanel ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          <button
            onClick={() => setShowCards(p => !p)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              showCards
                ? 'text-primary bg-primary/10 border border-primary/25'
                : 'text-muted-foreground hover:text-foreground bg-white/[0.04] border border-white/[0.08] hover:border-primary/30'
            }`}
            aria-label="Toggle explore cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Explore Features</span>
            {showCards ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* AI Chat — HERO — takes ALL remaining space */}
        <div className="flex-1 min-h-0">
          <AIChat />
        </div>

        {/* Bottom Cards — Collapsible, hidden by default */}
        <AnimatePresence>
          {showCards && (
            <motion.div
              key="cards"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <CardsRow />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Cards Toggle */}
        <div className="md:hidden flex-shrink-0">
          <button
            onClick={() => setShowCards(p => !p)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground bg-white/[0.04] border border-white/[0.08]"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{showCards ? 'Hide' : 'Explore'} Features</span>
            {showCards ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* RIGHT SIDEBAR — fixed width, always visible on large screens */}
      <div className="hidden xl:flex flex-col w-[280px] flex-shrink-0 p-4 gap-4 overflow-y-auto custom-scrollbar border-l border-white/[0.04]">
        <SidebarRight />
      </div>

    </div>
  );
}
