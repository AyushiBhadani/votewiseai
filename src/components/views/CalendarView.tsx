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
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    } catch (e) { /* silent fail */ }
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
      days.push(<div key={`e-${i}`} className="h-20 bg-muted/10 rounded-xl border border-border/20"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = eventsThisMonth.filter(e => e.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
      const isPast = new Date(year, month, d) < new Date();

      days.push(
        <div
          key={`d-${d}`}
          className={`h-20 p-1.5 rounded-xl border flex flex-col transition-all cursor-default ${
            isToday ? 'border-primary bg-primary/5 shadow-sm shadow-primary/20' :
            isPast ? 'border-border/30 bg-muted/10 opacity-70' :
            'border-border/50 bg-card hover:bg-muted/30'
          }`}
        >
          <span className={`text-xs font-semibold self-start px-1 ${isToday ? 'text-primary' : isPast ? 'text-muted-foreground/60' : 'text-foreground'}`}>{d}</span>
          <div className="mt-0.5 space-y-0.5 overflow-hidden">
            {dayEvents.slice(0, 2).map(ev => (
              <div
                key={ev.id}
                onClick={() => { setSelectedEvent(ev); setActiveTab('calendar'); }}
                className={`text-[9px] px-1 py-0.5 rounded cursor-pointer truncate border font-medium ${TYPE_STYLES[ev.type]}`}
                title={ev.title}
              >
                {ev.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
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
      <div className="flex-[3] bg-card border border-border rounded-2xl flex flex-col overflow-hidden min-w-0">
        
        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { key: 'calendar', label: 'Calendar', icon: CalendarClock },
            { key: 'upcoming', label: `Upcoming (${upcomingEvents.length})`, icon: BellRing },
            { key: 'past', label: `Past Events (${pastEvents.length})`, icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
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
          <div className="flex flex-col flex-1 p-4 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground">
                {monthNames[currentDate.getMonth()]} <span className="text-muted-foreground">{currentDate.getFullYear()}</span>
              </h2>
              <div className="flex items-center space-x-1">
                <button onClick={prevMonth} className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={goToToday} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">Today</button>
                <button onClick={nextMonth} className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">{d}</div>
              ))}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-7 gap-1 auto-rows-max">
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
      <div className="xl:w-80 bg-card border border-border rounded-2xl flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-foreground text-sm">Event Details</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Showing data for {country}</p>
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
          {!isPast && ` · ${Math.ceil((new Date(event.date).getTime() - Date.now()) / 86400000)} days away`}
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
