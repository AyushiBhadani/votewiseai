"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { getUpcomingEvents } from '@/data/electionEvents';

export default function Timeline() {
  const { country, language } = useAppStore();
  const [isOpen, setIsOpen] = useState(true);

  const upcoming = getUpcomingEvents(country, 5);

  const TYPE_COLORS: Record<string, string> = {
    election: 'bg-blue-500',
    debate: 'bg-purple-500',
    deadline: 'bg-orange-500',
    judgement: 'bg-red-500',
    general: 'bg-muted-foreground',
  };

  return (
    <div className={`glass-card rounded-2xl p-5 border border-white/[0.06] flex flex-col transition-all ${isOpen ? '' : 'h-auto'}`}>
      <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground text-sm">
            {language === 'Hindi' ? 'आगामी चुनाव' : language === 'Chinese' ? '即将到来的选举' : `Upcoming in ${country}`}
          </h3>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground">No upcoming events found for {country}.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((event, i) => {
                  const daysAway = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={event.id} className="relative flex items-start space-x-3">
                      <div className="relative mt-1.5 flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full z-10 relative ${TYPE_COLORS[event.type] || 'bg-primary'}`} />
                        {i !== upcoming.length - 1 && (
                          <div className="absolute top-2.5 left-[3px] w-px h-8 bg-white/[0.06]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate leading-tight">{event.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <span className="ml-1.5 text-primary font-medium">· {daysAway}d</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
