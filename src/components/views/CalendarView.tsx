"use client";

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getEventsForMonth, getUpcomingEvents, getPastEvents, ElectionEvent } from '@/data/electionEvents';
import { ChevronLeft, ChevronRight, BellRing, BellOff, CalendarClock, History, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_STYLES: Record<string, string> = {
  election: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  judgement: 'bg-red-500/20 text-red-400 border-red-500/30',
  debate: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  deadline: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  general: 'bg-muted text-muted-foreground border-border',
};

const DOT_COLORS: Record<string, string> = {
  election: 'bg-blue-500',
  judgement: 'bg-red-500',
  debate: 'bg-purple-500',
  deadline: 'bg-orange-500',
  general: 'bg-muted-foreground',
};

export default function CalendarView() {
  const { country, reminders, toggleReminder } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ElectionEvent | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'calendar' | 'upcoming' | 'past'>('calendar');

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch { /* silent fail */ }
  };

  const handleToggleReminder = (event: ElectionEvent) => {
    const wasReminded = reminders.includes(event.id);
    toggleReminder(event.id);
    if (!wasReminded) {
      playNotificationSound();
      setToastMsg(`🔔 Reminder set for "${event.title}"!`);
    } else {
      setToastMsg(`🔕 Reminder removed for "${event.title}"`);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const eventsThisMonth = useMemo(() =>
    getEventsForMonth(currentDate.getFullYear(), currentDate.getMonth(), country),
    [currentDate, country]
  );
  const upcomingEvents = useMemo(() => getUpcomingEvents(country, 10), [country]);
  const pastEvents = useMemo(() => getPastEvents(country, 15), [country]);

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`e-${i}`} className="h-24 bg-white/[0.01] rounded-xl border border-white/[0.03]"></div>
      );
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = eventsThisMonth.filter(e => e.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      const isPast = new Date(year, month, d) < new Date();

      const dominantType = dayEvents.length > 0 ? dayEvents[0].type : null;
      let borderGlow = '';
      if (!isPast && !isToday && dominantType) {
        if (dominantType === 'election') borderGlow = 'hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:bg-blue-500/5';
        else if (dominantType === 'judgement') borderGlow = 'hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:bg-red-500/5';
        else if (dominantType === 'debate') borderGlow = 'hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:bg-purple-500/5';
        else if (dominantType === 'deadline') borderGlow = 'hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:bg-orange-500/5';
      }

      days.push(
        <motion.div
          whileHover={{ scale: isPast ? 1 : 1.03, y: isPast ? 0 : -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          key={`d-${d}`}
          className={`h-28 p-2.5 rounded-2xl flex flex-col transition-all cursor-default relative overflow-hidden group ${
            isToday 
              ? 'border border-primary/50 bg-gradient-to-b from-primary/20 to-primary/5 shadow-[0_0_30px_rgba(59,130,246,0.25)] ring-1 ring-primary/30 z-20' 
              : isPast 
                ? 'border border-white/[0.03] bg-black/20 opacity-50' 
                : `border border-white/[0.08] bg-black/40 backdrop-blur-sm ${borderGlow || 'hover:border-white/[0.2] hover:bg-white/[0.04]'}`
          }`}
        >
          {isToday && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none" />}
          
          <span className={`text-sm font-extrabold self-end z-10 ${isToday ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : isPast ? 'text-white/20' : 'text-white/80 group-hover:text-white transition-colors'}`}>{d}</span>
          
          <div className="mt-1.5 space-y-1.5 overflow-hidden z-10 w-full flex-1">
            {dayEvents.slice(0, 2).map(ev => (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  key={ev.id}
                  onClick={() => { setSelectedEvent(ev); setActiveTab('calendar'); }}
                  className={`text-[10px] px-2 py-1 rounded-full cursor-pointer truncate border font-semibold flex items-center space-x-1.5 hover:brightness-150 transition-all shadow-md backdrop-blur-md ${TYPE_STYLES[ev.type]}`}
                  title={ev.title}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor] flex-shrink-0" />
                  <span className="truncate tracking-tight">{ev.title}</span>
                </motion.div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[9px] text-muted-foreground px-1.5 font-medium">+ {dayEvents.length - 2} more</div>
            )}
          </div>
        </motion.div>
      );
    }
    return days;
  };

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-4 p-4 overflow-hidden relative">

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -40, x: '-50%' }}
            className="absolute top-4 left-1/2 z-50 bg-card border border-primary/30 text-foreground px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3"
          >
            <BellRing className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: Calendar */}
      <div className="flex-[3] glass-card rounded-3xl border border-white/[0.08] flex flex-col overflow-hidden min-w-0 shadow-2xl relative">
        {/* Subtle dot pattern over the whole left panel */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-50 z-0" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='2' cy='2' r='1'/%3E%3C/g%3E%3C/svg%3E")` }} 
        />
        
        {/* Tabs */}
        <div className="flex border-b border-white/[0.08] relative z-10 bg-black/20 backdrop-blur-md">
          {[
            { key: 'calendar', label: 'Calendar', icon: CalendarClock },
            { key: 'upcoming', label: `Upcoming (${upcomingEvents.length})`, icon: BellRing },
            { key: 'past', label: `Past Events (${pastEvents.length})`, icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'calendar' | 'upcoming' | 'past')}
              className={`flex items-center space-x-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div className="flex flex-col flex-1 p-4 overflow-y-auto relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 drop-shadow-sm">
                {monthNames[currentDate.getMonth()]} <span className="text-primary/80 font-medium">{currentDate.getFullYear()}</span>
              </h2>
              <div className="flex items-center space-x-1.5 bg-black/30 p-1.5 rounded-2xl border border-white/[0.05] backdrop-blur-sm">
                <button onClick={prevMonth} className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={goToToday} className="px-4 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-white/10 hover:shadow-lg transition-all tracking-wide uppercase">Today</button>
                <button onClick={nextMonth} className="p-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-3 mb-3 relative z-10">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-[11px] font-extrabold text-white/50 uppercase tracking-widest py-2 bg-black/20 rounded-xl border border-white/[0.05] backdrop-blur-md">{d}</div>
              ))}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-7 gap-3 auto-rows-max relative z-10">
              {renderCalendarDays()}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border">
              {Object.entries(DOT_COLORS).map(([type, cls]) => (
                <div key={type} className="flex items-center space-x-1.5">
                  <div className={`w-2 h-2 rounded-full ${cls}`} />
                  <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events View */}
        {activeTab === 'upcoming' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
                <CalendarClock className="w-12 h-12 mb-3" />
                <p>No upcoming events for {country}</p>
              </div>
            ) : upcomingEvents.map(ev => (
              <EventListCard key={ev.id} event={ev} reminders={reminders} onToggleReminder={handleToggleReminder} onSelect={setSelectedEvent} />
            ))}
          </div>
        )}

        {/* Past Events View */}
        {activeTab === 'past' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {pastEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
                <History className="w-12 h-12 mb-3" />
                <p>No past events found for {country}</p>
              </div>
            ) : pastEvents.map(ev => (
              <EventListCard key={ev.id} event={ev} reminders={reminders} onToggleReminder={handleToggleReminder} onSelect={setSelectedEvent} isPast />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Detail Panel */}
      <div className="xl:w-96 glass-card rounded-3xl border border-white/[0.08] flex flex-col overflow-hidden flex-shrink-0 shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="p-5 border-b border-white/[0.08] relative z-10 bg-black/20 backdrop-blur-md">
          <h3 className="font-extrabold text-white text-base">Event Details</h3>
          <p className="text-xs text-white/50 mt-1">Showing data for {country}</p>
        </div>

        {selectedEvent ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedEvent.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 flex flex-col flex-1"
            >
              <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border ${TYPE_STYLES[selectedEvent.type]}`}>
                {selectedEvent.type}
              </span>
              <h4 className="text-lg font-bold text-foreground leading-tight">{selectedEvent.title}</h4>
              <p className="text-sm text-primary font-medium mt-1">
                {new Date(selectedEvent.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="mt-3 bg-muted rounded-xl p-3 text-sm text-muted-foreground leading-relaxed flex-1">
                {selectedEvent.description}
              </div>
              <button
                onClick={() => handleToggleReminder(selectedEvent)}
                className={`mt-4 w-full py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all text-sm ${
                  reminders.includes(selectedEvent.id)
                    ? 'bg-card border-2 border-primary text-primary'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {reminders.includes(selectedEvent.id)
                  ? <><BellOff className="w-4 h-4" /><span>Remove Reminder</span></>
                  : <><BellRing className="w-4 h-4" /><span>Set Audio Reminder</span></>
                }
              </button>
              {reminders.includes(selectedEvent.id) && (
                <p className="text-[10px] text-center text-primary/70 mt-2">✅ Reminder saved to your device</p>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground opacity-50 p-6">
            <Info className="w-12 h-12 mb-3" />
            <p className="text-sm">Click any event on the calendar, or from the Upcoming / Past Events tabs to see details here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EventListCard({ event, reminders, onToggleReminder, onSelect, isPast }: {
  event: ElectionEvent;
  reminders: string[];
  onToggleReminder: (e: ElectionEvent) => void;
  onSelect: (e: ElectionEvent) => void;
  isPast?: boolean;
}) {
  const [now] = useState(() => Date.now());
  const isReminded = reminders.includes(event.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer hover:border-primary/40 ${isPast ? 'opacity-75 bg-muted/20 border-border/40' : 'bg-card border-border'}`}
      onClick={() => onSelect(event)}
    >
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${DOT_COLORS[event.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          {!isPast && ` · ${Math.ceil((new Date(event.date).getTime() - now) / 86400000)} days away`}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleReminder(event); }}
        className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${isReminded ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
        title={isReminded ? 'Remove reminder' : 'Set reminder'}
      >
        {isReminded ? <BellRing className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      </button>
    </motion.div>
  );
}
