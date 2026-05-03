import React from 'react';
import { Sparkles, BookMarked, Zap, Compass, BookOpen, Volume2, VolumeX, Plus } from 'lucide-react';
import { Message } from '@/lib/firestore';

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
  const flag = COUNTRY_FLAGS[country] || '🌍';

  return (
    <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">

      {/* Left: Brand */}
      <div className="flex items-center space-x-3">
        <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all ${
          mode === 'story'
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40'
            : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/40'
        }`}>
          {mode === 'story' ? <BookMarked className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-background animate-pulse" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-sm leading-none">
            {flag} {mode === 'story' ? 'Story Mode' : 'VoteWise AI'}
          </h2>
          <div className="flex items-center space-x-1 mt-0.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">{country} · {language}</span>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-1.5">
        {/* Mode Toggle */}
        <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
          <button
            onClick={() => setMode('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'chat' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Switch to AI Chat mode"
          >
            <Zap className="w-3 h-3" />
            <span>AI Chat</span>
          </button>
          <button
            onClick={() => setMode('story')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'story' ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Switch to Story Mode"
          >
            <BookMarked className="w-3 h-3" />
            <span>Story Mode</span>
          </button>
        </div>

        <button
          onClick={() => setIsGuideOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-all"
          aria-label="Open Guide Me"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Guide Me</span>
        </button>

        <button
          onClick={handleExplainSimply}
          disabled={!hasMessages}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-primary/20"
          aria-label="Simplify last response"
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
          aria-label={`Toggle voice ${isAudioEnabled ? 'off' : 'on'}`}
        >
          {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={handleNewChat}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/10"
          aria-label="Start new chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>
    </div>
  );
};
