"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, BookMarked, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { createConversation, updateConversation, Message } from '@/lib/firestore';
import GuideMe from './GuideMe';

// Sub-components
import { ChatHeader } from './chat/ChatHeader';
import { MessageBubble } from './chat/MessageBubble';
import { ChatInput } from './chat/ChatInput';

const LANG_CODES: Record<string, string> = {
  English: 'en-US', Hindi: 'hi-IN', Tamil: 'ta-IN', Telugu: 'te-IN',
  Bengali: 'bn-IN', Kannada: 'kn-IN', Marathi: 'mr-IN', Gujarati: 'gu-IN',
  Urdu: 'ur-PK', French: 'fr-FR', Spanish: 'es-ES', Arabic: 'ar-SA',
  German: 'de-DE', Japanese: 'ja-JP', Portuguese: 'pt-BR', Chinese: 'zh-CN',
};

const SUGGESTIONS_BY_LANG: Record<string, string[]> = {
  English: ["How do I register to vote? 🗳️", "Explain the Electoral College 🇺🇸", "What is the voting age? 👶", "When is the next election? 📅"],
  Hindi: ["मतदाता पंजीकरण कैसे करें? 🗳️", "चुनाव प्रक्रिया क्या है? 📋", "मतदान की आयु क्या है? 👶", "अगला चुनाव कब है? 📅"],
  default: ["How do I register to vote? 🗳️", "What is the voting process? 📋", "What is the voting age? 👶", "When is the next election? 📅"]
};

const STORY_SUGGESTIONS = ["Tell me a story about why voting matters 📖", "Explain elections like I'm 8 years old 🧒", "Use a village story to explain democracy 🏘️"];

export default function AIChat() {
  const { country, language, isAudioEnabled, toggleAudio, activeConversationId, setActiveConversationId, loadedMessages, setLoadedMessages, geminiModel } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState<'chat' | 'story'>('chat');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ file: File; base64: string; preview: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    if (loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages);
      setLoadedMessages([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedFile({ file, base64: result.split(',')[1], preview: file.type.startsWith('image/') ? result : '' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text && !selectedFile) return;
    if (isTyping) return;

    const payload: any = { message: text || "Analyze this file.", country, language, mode, history: messages, model: geminiModel };
    if (selectedFile) { payload.mediaBase64 = selectedFile.base64; payload.mediaMimeType = selectedFile.file.type; }

    const userMsg: Message = { 
      id: Date.now().toString(), role: 'user', content: text || `[Attached: ${selectedFile?.file.name}]`,
      ...(selectedFile?.preview ? { imageUrl: selectedFile.preview } : {})
    };
    
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setSelectedFile(null);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      const responseText = data.response || `Error: ${data.error}`;

      let imageUrl: string | null = null;
      if (mode === 'story' && data.imagePrompt) {
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(data.imagePrompt)}?width=600&height=300&nologo=true&seed=${Date.now()}`;
      }

      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText, intent: data.intent, registrationUrl: data.registrationUrl, ...(imageUrl ? { imageUrl } : {}) };
      const final = [...updated, assistantMsg];
      setMessages(final);
      await saveToFirestore(final);

      if (isAudioEnabled && typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(responseText);
        utt.lang = LANG_CODES[language] || 'en-US';
        utt.onstart = () => setIsSpeaking(true);
        utt.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utt);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I could not connect. Please try again.' }]);
    } finally { setIsTyping(false); }
  };

  const handleExplainSimply = () => {
    const last = [...messages].reverse().find(m => m.role === 'user');
    if (last) handleSend(`Please explain this in the simplest way possible, like for a child: "${last.content}"`);
  };

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (isListening) { recognitionRef.current?.stop(); return; }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = LANG_CODES[language] || 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: any) => { setIsListening(false); handleSend(e.results[0][0].transcript); };
    rec.onerror = () => setIsListening(false);
    rec.start();
  };

  const suggestions = mode === 'story' ? STORY_SUGGESTIONS : (SUGGESTIONS_BY_LANG[language] || SUGGESTIONS_BY_LANG.default);

  return (
    <div className="flex flex-col h-full glass-card rounded-2xl overflow-hidden">
      <ChatHeader 
        mode={mode} setMode={setMode} geminiModel={geminiModel} language={language}
        country={country}
        isAudioEnabled={isAudioEnabled} toggleAudio={toggleAudio} isSpeaking={isSpeaking}
        stopSpeaking={stopSpeaking} handleNewChat={() => {setMessages([]); setActiveConversationId(null);}}
        setIsGuideOpen={setIsGuideOpen} handleExplainSimply={handleExplainSimply} hasMessages={messages.length > 0}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 py-10 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-2xl animate-float ${mode === 'story' ? 'bg-amber-500 shadow-amber-500/30' : 'bg-primary shadow-primary/30'}`}>
              {mode === 'story' ? <BookMarked className="w-8 h-8 text-white" /> : <Sparkles className="w-8 h-8 text-white" />}
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{mode === 'story' ? 'Let me tell you a story! 📖' : 'How can I help you today?'}</h3>
            <div className="flex items-center space-x-1.5 mb-7 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full">
              <Languages className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Currently: <strong className="text-foreground">{language}</strong></span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s, i) => <button key={i} onClick={() => handleSend(s)} className="text-left text-xs p-3 rounded-xl border bg-white/[0.04] border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-all">{s}</button>)}
            </div>
          </div>
        ) : (
          <div className="px-4 py-6 space-y-6">
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} mode={mode} />)}
            {isTyping && <div className="flex items-start space-x-3"><div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse"><Sparkles className="w-4 h-4 text-primary" /></div><span className="text-xs text-muted-foreground mt-2">Thinking...</span></div>}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput 
        input={input} setInput={setInput} handleSend={handleSend} isTyping={isTyping}
        isListening={isListening} startListening={startListening} language={language}
        country={country} mode={mode} fileInputRef={fileInputRef} inputRef={inputRef}
        selectedFile={selectedFile} setSelectedFile={setSelectedFile} handleFileChange={handleFileChange}
      />

      <GuideMe isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
