import React from 'react';
import { Sparkles, BookMarked, Zap, Compass, BookOpen, Volume2, VolumeX, Plus } from 'lucide-react';
import { Message } from '@/lib/firestore';

interface ChatHeaderProps {
  mode: 'chat' | 'story';
  setMode: (mode: 'chat' | 'story') => void;
  geminiModel: string;
  language: string;
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
  mode, setMode, geminiModel, language, isAudioEnabled, toggleAudio,
  isSpeaking, stopSpeaking, handleNewChat, setIsGuideOpen, handleExplainSimply, hasMessages
}) => {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] flex-shrink-0">
      <div className="flex items-center space-x-3">
        <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all ${
          mode === 'story'
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
            : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/30'
        }`}>
          {mode === 'story' ? <BookMarked className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-background" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-sm leading-none">
            {mode === 'story' ? 'Story Mode 📖' : 'VoteWise AI'}
          </h2>
          <div className="flex items-center space-x-1 mt-0.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">
              {mode === 'story' ? 'Stories for everyone · ' : `${geminiModel} · `}
              {language}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
          <button
            onClick={() => setMode('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'chat'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>AI Chat</span>
          </button>
          <button
            onClick={() => setMode('story')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'story'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookMarked className="w-3 h-3" />
            <span>Story Mode</span>
          </button>
        </div>

        <button
          onClick={() => setIsGuideOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 transition-all border border-transparent"
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
          title={`Voice ${isAudioEnabled ? 'ON' : 'OFF'} · ${language}`}
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
  );
};
