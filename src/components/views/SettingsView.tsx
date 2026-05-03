"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Volume2, Bell, Shield, Info, Check
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const COUNTRIES = [
  { value: 'India', flag: '🇮🇳' }, { value: 'USA', flag: '🇺🇸' }, { value: 'UK', flag: '🇬🇧' },
  { value: 'Australia', flag: '🇦🇺' }, { value: 'Canada', flag: '🇨🇦' }, { value: 'France', flag: '🇫🇷' },
  { value: 'Germany', flag: '🇩🇪' }, { value: 'Japan', flag: '🇯🇵' }, { value: 'Brazil', flag: '🇧🇷' },
  { value: 'South Africa', flag: '🇿🇦' }, { value: 'Pakistan', flag: '🇵🇰' },
  { value: 'Bangladesh', flag: '🇧🇩' }, { value: 'Sri Lanka', flag: '🇱🇰' },
];

const LANGUAGES = [
  { value: 'English', label: 'English' }, { value: 'Hindi', label: 'हिंदी' },
  { value: 'Tamil', label: 'தமிழ்' }, { value: 'Telugu', label: 'తెలుగు' },
  { value: 'Bengali', label: 'বাংলা' }, { value: 'Kannada', label: 'ಕನ್ನಡ' },
  { value: 'Marathi', label: 'मराठी' }, { value: 'Gujarati', label: 'ગુજરાતી' },
  { value: 'Urdu', label: 'اردو' }, { value: 'French', label: 'Français' },
  { value: 'Spanish', label: 'Español' }, { value: 'Arabic', label: 'العربية' },
  { value: 'German', label: 'Deutsch' }, { value: 'Japanese', label: '日本語' },
  { value: 'Portuguese', label: 'Português' }, { value: 'Chinese', label: '中文' },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-primary' : 'bg-white/[0.12]'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${enabled ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
      <div className="flex items-center space-x-3 px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-white/[0.04]">{children}</div>
    </motion.div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsView() {
  const { country, setCountry, language, setLanguage, isAudioEnabled, toggleAudio, reminders } = useAppStore();
  const [notifications, setNotifications] = useState(true);
  const [storyImages, setStoryImages] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Customize your VoteWise AI experience</p>
          </div>
          <button onClick={handleSave}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              saved
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                : 'btn-primary-glow text-white'
            }`}>
            {saved ? <><Check className="w-4 h-4" /><span>Saved!</span></> : <span>Save Changes</span>}
          </button>
        </div>

        {/* Region & Language */}
        <Section title="Region & Language" icon={Globe}>
          <SettingRow label="Country" desc="Affects election data, alerts, and AI responses">
            <select value={country} onChange={e => setCountry(e.target.value)}
              className="bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 transition-colors">
              {COUNTRIES.map(c => (
                <option key={c.value} value={c.value} className="bg-[#060a12]">{c.flag} {c.value}</option>
              ))}
            </select>
          </SettingRow>
          <SettingRow label="Language" desc="AI will respond in this language">
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 transition-colors">
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value} className="bg-[#060a12]">{l.label}</option>
              ))}
            </select>
          </SettingRow>
        </Section>

        {/* Voice & Audio */}
        <Section title="Voice & Audio" icon={Volume2}>
          <SettingRow label="Voice Responses" desc="AI reads answers aloud in your language">
            <Toggle enabled={isAudioEnabled} onToggle={toggleAudio} />
          </SettingRow>
          <SettingRow label="Story Illustrations" desc="Generate AI images for Story Mode responses">
            <Toggle enabled={storyImages} onToggle={() => setStoryImages(p => !p)} />
          </SettingRow>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <SettingRow label="Election Alerts" desc="Get notified about upcoming elections">
            <Toggle enabled={notifications} onToggle={() => setNotifications(p => !p)} />
          </SettingRow>
          <SettingRow label="Active Reminders" desc="Reminders set from the Calendar">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
              reminders.length > 0 ? 'bg-primary/20 text-primary' : 'bg-white/[0.06] text-muted-foreground'
            }`}>
              {reminders.length} active
            </span>
          </SettingRow>
        </Section>

        {/* Privacy */}
        <Section title="Privacy & Data" icon={Shield}>
          <SettingRow label="Anonymous Session" desc="You are signed in anonymously — no account needed">
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-medium">
              ✅ Active
            </span>
          </SettingRow>
          <SettingRow label="Data Storage" desc="Conversations and downloads saved to Firebase Cloud">
            <span className="text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full font-medium flex items-center space-x-1.5">
              <span>☁️ Cloud</span>
            </span>
          </SettingRow>
          <SettingRow label="Session Scope" desc="Your data is tied to this browser only">
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full font-medium">
              🔒 This browser
            </span>
          </SettingRow>
        </Section>

        {/* About */}
        <Section title="About VoteWise AI" icon={Info}>
          {[
            { label: 'Version', value: '2.0.0' },
            { label: 'AI Model', value: 'Gemini 2.5 Flash' },
            { label: 'Countries', value: '13 supported' },
            { label: 'Languages', value: '16 supported' },
            { label: 'Image Generation', value: 'Pollinations.ai' },
          ].map(({ label, value }) => (
            <SettingRow key={label} label={label}>
              <span className="text-sm text-muted-foreground font-mono">{value}</span>
            </SettingRow>
          ))}
          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              VoteWise AI is an educational platform. All election data is for informational purposes only.
              Always verify with your official local election commission. Built with Next.js + Firebase + Gemini AI.
            </p>
          </div>
        </Section>

      </div>
    </div>
  );
}
