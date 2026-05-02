"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Mic, MicOff, Sparkles, BookOpen, Volume2, VolumeX,
  Plus, User, Bot, BookMarked, Zap, Languages, Compass, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { createConversation, updateConversation, Message } from '@/lib/firestore';
import GuideMe from './GuideMe';

// Language → browser speech code
const LANG_CODES: Record<string, string> = {
  English: 'en-US', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
  Bengali: 'bn-IN', Kannada: 'kn-IN', Marathi: 'mr-IN', Gujarati: 'gu-IN',
  Urdu: 'ur-PK', French: 'fr-FR', Spanish: 'es-ES', Arabic: 'ar-SA',
  German: 'de-DE', Japanese: 'ja-JP', Portuguese: 'pt-BR', Chinese: 'zh-CN',
};

const SUGGESTIONS_BY_LANG: Record<string, string[]> = {
  English: [
    "How do I register to vote? 🗳️", "Explain the Electoral College 🇺🇸",
    "What is the voting age? 📋", "When is the next election? 📅",
    "How does vote counting work? 🔢", "What documents do I need? 📄",
  ],
  Hindi: [
    "मतदाता पंजीकरण कैसे करें? 🗳️", "चुनाव प्रक्रिया क्या है? 📋",
    "मतदान की आयु क्या है? 👶", "अगला चुनाव कब है? 📅",
    "वोट कैसे डालते हैं? 🗳️", "ईवीएम क्या होती है? 🖥️",
  ],
  Tamil: [
    "வாக்குப்பதிவு எப்படி செய்வது? 🗳️", "தேர்தல் என்றால் என்ன? 📋",
    "வாக்களிக்கும் வயது என்ன? 👶", "அடுத்த தேர்தல் எப்போது? 📅",
    "வாக்கு எப்படி போடுவது? 🗳️", "EVM என்றால் என்ன? 🖥️",
  ],
  default: [
    "How do I register to vote? 🗳️", "What is the voting process? 📋",
    "What is the voting age? 👶", "When is the next election? 📅",
    "How does vote counting work? 🔢", "What documents are needed? 📄",
  ]
};

const STORY_SUGGESTIONS = [
  "Tell me a story about why voting matters 📖",
  "Explain elections like I'm 8 years old 🧒",
  "Use a village story to explain democracy 🏘️",
  "Tell a story about a first-time voter 🌟",
  "Explain what happens if no one votes 😢",
  "Use a school election to explain how voting works 🏫",
];

export default function AIChat() {
  const { country, language, isAudioEnabled, toggleAudio, activeConversationId, setActiveConversationId, loadedMessages, setLoadedMessages } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState<'chat' | 'story'>('chat');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Load a past conversation when selected from Chat History
  useEffect(() => {
    if (loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages);
      setLoadedMessages([]); // clear after loading
    }
  }, [loadedMessages]);

  const saveToFirestore = async (updatedMessages: Message[]) => {
    try {
      if (!activeConversationId) {
        const first = updatedMessages.find(m => m.role === 'user');
        if (first) {
          const id = await createConversation(first.content, country, language, updatedMessages);
          setActiveConversationId(id);
        }
      } else {
        await updateConversation(activeConversationId, updatedMessages);
      }
    } catch (e) { console.error(e); }
  };

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsTyping(true);
    inputRef.current?.focus();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, country, language, mode, history: messages }),
      });
      const data = await res.json();
      const responseText = data.response || `Error: ${data.error}`;

      // Build illustration URL for story mode via Pollinations.ai (free, no key)
      let imageUrl: string | null = null;
      if (mode === 'story' && data.imagePrompt) {
        const encoded = encodeURIComponent(
          `${data.imagePrompt}, colorful flat illustration, child friendly, no text, vibrant`
        );
        imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=600&height=300&nologo=true&seed=${Date.now()}`;
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        intent: data.intent,
        registrationUrl: data.registrationUrl,
        ...(imageUrl ? { imageUrl } : {})
      };
      const final = [...updated, assistantMsg];
      setMessages(final);
      await saveToFirestore(final);

      if (isAudioEnabled && typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(responseText);
        utt.lang = LANG_CODES[language] || 'en-US';
        utt.rate = 0.95;
        utt.onstart = () => setIsSpeaking(true);
        utt.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utt);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'assistant',
        content: 'Sorry, I could not connect. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExplainSimply = () => {
    const last = [...messages].reverse().find(m => m.role === 'user');
    if (last) handleSend(`Please explain this in the simplest way possible, like for a child: "${last.content}"`);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice input requires Google Chrome.'); return; }
    if (isListening) { recognitionRef.current?.stop(); return; }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = LANG_CODES[language] || 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => { setIsListening(false); handleSend(e.results[0][0].transcript); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    inputRef.current?.focus();
  };

  const suggestions = mode === 'story'
    ? STORY_SUGGESTIONS
    : (SUGGESTIONS_BY_LANG[language] || SUGGESTIONS_BY_LANG.default);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full glass-card rounded-2xl overflow-hidden">

      {/* Header */}
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
                {mode === 'story' ? 'Stories for everyone · ' : 'Gemini 2.5 Flash · '}
                {language}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* MODE SWITCHER */}
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
            disabled={messages.length === 0}
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

      {/* Story Mode Banner */}
      <AnimatePresence>
        {mode === 'story' && isEmpty && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center space-x-2 overflow-hidden"
          >
            <BookMarked className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-400/90">
              <strong>Story Mode</strong> — I'll explain elections using fun stories and simple analogies. 
              Perfect for children, first-time voters, and anyone who finds elections confusing! 🎉
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speaking bar */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="flex items-center justify-between px-5 py-2 bg-primary/10 border-b border-primary/15 overflow-hidden flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-0.5 items-end h-4">
                {[3,5,7,5,3].map((h,i) => (
                  <div key={i} className="w-1 bg-primary rounded-full animate-bounce"
                    style={{ height: `${h*2}px`, animationDelay: `${i*80}ms` }} />
                ))}
              </div>
              <span className="text-xs text-primary font-medium">Speaking in {language}...</span>
            </div>
            <button onClick={stopSpeaking} className="text-[11px] text-primary/70 hover:text-primary underline">Stop</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isEmpty ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-2xl animate-float ${
                mode === 'story'
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
                  : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/30'
              }`}
            >
              {mode === 'story' ? <BookMarked className="w-8 h-8 text-white" /> : <Sparkles className="w-8 h-8 text-white" />}
            </motion.div>

            <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-foreground mb-2">
              {mode === 'story' ? 'Let me tell you a story! 📖' : 'How can I help you today?'}
            </motion.h3>

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground mb-2 max-w-md">
              {mode === 'story'
                ? `I'll explain elections in ${country} using simple, fun stories. Choose a topic below or ask your own question in any language!`
                : `Ask me anything about elections and voting in ${country}. I speak ${language} and 15 other languages!`
              }
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="flex items-center space-x-1.5 mb-7 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full">
              <Languages className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Currently: <strong className="text-foreground">{language}</strong> · Change in top bar</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)}
                  className={`text-left text-xs p-3 rounded-xl border transition-all ${
                    mode === 'story'
                      ? 'bg-amber-500/5 border-amber-500/15 text-muted-foreground hover:text-foreground hover:bg-amber-500/10 hover:border-amber-500/30'
                      : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] hover:border-primary/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          /* Messages */
          <div className="px-4 py-6 space-y-6">
            {/* Mode badge */}
            <div className="flex justify-center">
              <span className={`text-[10px] px-3 py-1 rounded-full border font-medium ${
                mode === 'story'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}>
                {mode === 'story' ? '📖 Story Mode' : '⚡ AI Chat'} · {language} · {country}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10'
                      : mode === 'story'
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/25'
                      : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/25'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-white/80" />
                      : mode === 'story'
                      ? <BookMarked className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-white" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[78%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-muted-foreground mb-1 px-1 font-medium">
                      {msg.role === 'user' ? 'You' : mode === 'story' ? 'Storyteller 📖' : 'VoteWise AI'}
                    </span>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-primary/20 text-foreground border border-primary/20 rounded-tr-sm'
                        : mode === 'story'
                        ? 'bg-amber-500/10 text-foreground border border-amber-500/15 rounded-tl-sm'
                        : 'bg-white/[0.05] text-foreground border border-white/[0.08] rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {/* Action Buttons (Registration) */}
                    {msg.role === 'assistant' && msg.registrationUrl && (
                      <div className="mt-2 w-full">
                        <a href={msg.registrationUrl.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>{msg.registrationUrl.label}</span>
                        </a>
                      </div>
                    )}
                    {/* Story illustration */}
                    {msg.role === 'assistant' && msg.imageUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-2 w-full rounded-xl overflow-hidden border border-amber-500/20 shadow-lg shadow-amber-500/10"
                      >
                        <div className="relative">
                          <img
                            src={msg.imageUrl}
                            alt="Story illustration"
                            className="w-full h-auto max-h-52 object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-3 py-2">
                            <span className="text-[10px] text-white/70 font-medium">🎨 AI-generated illustration</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    mode === 'story'
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                      : 'bg-gradient-to-br from-violet-500 to-indigo-600'
                  }`}>
                    {mode === 'story' ? <BookMarked className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-muted-foreground mb-1 px-1 font-medium">
                      {mode === 'story' ? 'Writing your story...' : 'Thinking...'}
                    </span>
                    <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-sm px-5 py-4 flex items-center space-x-1.5">
                      {[0,1,2].map(i => (
                        <div key={i} className={`w-2 h-2 rounded-full animate-bounce ${mode === 'story' ? 'bg-amber-400/60' : 'bg-primary/60'}`}
                          style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-3 border-t border-white/[0.06] bg-white/[0.01] flex-shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className={`flex items-center space-x-3 bg-white/[0.04] border rounded-2xl px-4 py-3 focus-within:shadow-lg transition-all ${
            mode === 'story'
              ? 'border-amber-500/20 focus-within:border-amber-500/40 focus-within:shadow-amber-500/10'
              : 'border-white/[0.10] focus-within:border-primary/40 focus-within:shadow-primary/10'
          }`}>

          <button type="button" onClick={startListening}
            className={`flex-shrink-0 p-2 rounded-xl transition-all ${
              isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            }`}
            title={isListening ? 'Listening...' : `Speak in ${language}`}>
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input ref={inputRef} type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? `🎤 Listening in ${language}...`
                : mode === 'story'
                ? `Ask for a story about ${country} elections...`
                : `Ask about ${country} elections in ${language}...`
            }
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />

          <motion.button type="submit" disabled={!input.trim() || isTyping} whileTap={{ scale: 0.92 }}
            className={`flex-shrink-0 w-9 h-9 text-white rounded-xl flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none ${
              mode === 'story'
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30 hover:shadow-amber-500/50'
                : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/30 hover:shadow-violet-500/50'
            }`}>
            <Send className="w-4 h-4" />
          </motion.button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
          VoteWise AI speaks 16 languages · {mode === 'story' ? '📖 Story Mode active' : 'Educational purposes only'} · Verify with official sources
        </p>
      </div>

      <GuideMe isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
