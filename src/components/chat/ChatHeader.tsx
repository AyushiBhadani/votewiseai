import React from 'react';
import { Sparkles, BookMarked, Zap, Compass, BookOpen, Volume2, VolumeX, Plus } from 'lucide-react';
import { Message } from '@/lib/firestore';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Country banner mapping
const COUNTRY_BANNERS: Record<string, string> = {
  India: '/banners/india.png',
  USA: '/banners/usa.png',
  UK: '/banners/uk.png',
  Australia: '/banners/australia.png',
  France: '/banners/france.png',
  Canada: '/banners/canada.png',
};

const COUNTRY_FLAGS: Record<string, string> = {
  India: '🇮🇳', USA: '🇺🇸', UK: '🇬🇧', Australia: '🇦🇺',
  France: '🇫🇷', Canada: '🇨🇦', Germany: '🇩🇪', Japan: '🇯🇵',
  Brazil: '🇧🇷', 'South Africa': '🇿🇦', Pakistan: '🇵🇰',
  Bangladesh: '🇧🇩', 'Sri Lanka': '🇱🇰',
};

interface ChatHeaderProps {
  mode: 'chat' | 'story';
  setMode: (mode: 'chat' | 'story') => void;
  geminiModel: string;
  language: string;
  country: string;
  isAudioEnabled: boolean;
  toggleAudio: () => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
  handleNewChat: () => void;
  setIsGuideOpen: (open: boolean) => void;
  handleExplainSimply: () => void;
  hasMessages: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  mode, setMode, geminiModel, language, country, isAudioEnabled, toggleAudio,
  isSpeaking, stopSpeaking, handleNewChat, setIsGuideOpen, handleExplainSimply, hasMessages
}) => {
  const bannerSrc = COUNTRY_BANNERS[country] || '/banners/india.png';
  const flag = COUNTRY_FLAGS[country] || '🌍';

  return (
    <div className="flex-shrink-0">
      {/* ── Country Banner Hero ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={country}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-28 overflow-hidden"
        >
          <Image
            src={bannerSrc}
            alt={`${country} election background`}
            fill
            className="object-cover object-center"
            priority
          />
          {/* Dark gradient overlay so text is readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          {/* Overlay Text */}
          <div className="absolute inset-0 flex items-center px-5">
            <div className="flex items-center space-x-3">
              <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                mode === 'story'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40'
                  : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/40'
              }`}>
                {mode === 'story' ? <BookMarked className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-background animate-pulse" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg leading-none drop-shadow-lg">
                  {mode === 'story' ? 'Story Mode 📖' : `${flag} VoteWise AI`}
                </h2>
                <div className="flex items-center space-x-1.5 mt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[11px] text-emerald-300 font-semibold drop-shadow">
                    {mode === 'story' ? 'Stories for everyone · ' : `${country} · `}
                    {language}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        {/* Mode Toggle */}
        <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
          <button
            onClick={() => setMode('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'chat' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>AI Chat</span>
          </button>
          <button
            onClick={() => setMode('story')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'story' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookMarked className="w-3 h-3" />
            <span>Story Mode</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide Me</span>
          </button>

          <button
            onClick={handleExplainSimply}
            disabled={!hasMessages}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-primary/20"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simplify</span>
          </button>

          <button
            onClick={() => { toggleAudio(); if (isSpeaking) stopSpeaking(); }}
            className={`p-2 rounded-lg transition-all border ${
              isAudioEnabled
                ? 'text-primary bg-primary/10 border-primary/25'
                : 'text-muted-foreground hover:text-foreground border-transparent hover:bg-white/[0.06]'
            }`}
            title={`Voice ${isAudioEnabled ? 'ON' : 'OFF'}`}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleNewChat}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>
    </div>
  );
};
