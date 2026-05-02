"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, MessageCircle, TrendingUp, Heart, Share2,
  BookOpen, AlertCircle, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const TIPS: { icon: string; title: string; body: string }[] = [
  { icon: '🗓️', title: 'Register Early', body: 'Most countries require voter registration weeks before the election. Check your deadline now and don\'t miss it!' },
  { icon: '🪪', title: 'Know Your ID', body: 'Find out which ID documents are accepted at the polls in your country. Requirements differ — some need photo ID, others just a voter card.' },
  { icon: '📍', title: 'Find Your Polling Station', body: 'Your assigned polling station may differ from previous elections. Always verify your location before election day.' },
  { icon: '📬', title: 'Try Mail-in Voting', body: 'Many countries now offer postal or absentee ballots. This is perfect if you\'re travelling, elderly, or have difficulty reaching a polling booth.' },
  { icon: '🤝', title: 'Help Others Vote', body: 'Assist elderly neighbors or first-time voters in your community. A democracy is stronger when everyone participates.' },
  { icon: '📱', title: 'Verify Information', body: 'Election misinformation spreads fast on social media. Always verify news from official election commission websites before sharing.' },
];

const FAQS: { q: string; a: string }[] = [
  { q: 'What is NOTA and why does it matter?', a: 'NOTA (None of the Above) is an option available in some countries like India that allows voters to reject all candidates. While NOTA votes don\'t elect anyone, they signal public dissatisfaction and can influence future candidate selections.' },
  { q: 'Can I vote if I\'ve recently moved?', a: 'Generally yes, but you may need to update your voter registration address first. In India, use Form 8A. In the USA, re-register at your new address. Deadlines vary by state/region.' },
  { q: 'What happens if I make a mistake on my ballot?', a: 'In most countries, you can request a new ballot before submitting. In India, spoiled ballots are rejected and counted separately. Never fold or mark outside the designated area.' },
  { q: 'Is voting mandatory anywhere?', a: 'Yes! Australia, Brazil, and Belgium make voting compulsory. Australian citizens who don\'t vote can be fined AU$20+. Brazil suspends civic rights for non-voters.' },
  { q: 'How is my vote kept secret?', a: 'Secret ballots protect you from pressure. In India, EVMs record your choice without linking it to your identity. No one — not even election officials — can trace your vote back to you.' },
  { q: 'Can NRIs (Non-Resident Indians) vote?', a: 'Yes! NRIs registered on Indian electoral rolls can vote in person at their registered constituency. Postal voting for NRIs was approved in 2019 as a pilot. Check ECI website for updates.' },
];

const DISCUSSIONS: { avatar: string; name: string; country: string; message: string; likes: number; time: string }[] = [
  { avatar: '👩‍💼', name: 'Priya S.', country: '🇮🇳', message: 'Just registered on the ECI portal — took less than 5 minutes! Highly recommend checking if you\'re still on the rolls.', likes: 47, time: '2h ago' },
  { avatar: '👨‍🎓', name: 'James R.', country: '🇺🇸', message: 'Story Mode helped me explain the Electoral College to my 10-year-old. She finally gets it! 😄 The illustrations are so good.', likes: 83, time: '5h ago' },
  { avatar: '👩‍🌾', name: 'Fatima A.', country: '🇧🇩', message: 'The AI assistant answered my question about voter registration in Bengali perfectly. Impressed!', likes: 31, time: '1d ago' },
  { avatar: '🧑‍💻', name: 'Carlos M.', country: '🇧🇷', message: 'Important reminder: In Brazil, voting is mandatory for 18-70 year olds. Don\'t skip it or you\'ll face penalties!', likes: 62, time: '1d ago' },
  { avatar: '👴', name: 'Tanaka H.', country: '🇯🇵', message: 'The Japan election calendar is very detailed. Thank you for including the House of Councillors data!', likes: 19, time: '2d ago' },
  { avatar: '👩‍⚕️', name: 'Sophie D.', country: '🇫🇷', message: 'French two-round system is complex but the comparison tool on VoteWise explained it clearly. Love the country comparison feature!', likes: 44, time: '3d ago' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.04] last:border-0">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
        <span className="text-sm font-medium text-foreground pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CommunityView() {
  const { country, setActiveNavTab } = useAppStore();
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const toggleLike = (i: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Community Hub 🌍</h1>
          <p className="text-sm text-muted-foreground mt-1">Voter tips, discussion, and shared knowledge from around the world</p>
        </motion.div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Community Members', value: '12,400+', icon: Users, color: 'text-primary' },
            { label: 'Countries Active', value: '13', icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Questions Answered', value: '50,000+', icon: MessageCircle, color: 'text-violet-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-4 border border-white/[0.06] text-center">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Voting Tips */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Voter Tips & Best Practices</span>
            </h2>
            <div className="space-y-3">
              {TIPS.map((tip, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-4 border border-white/[0.06] flex items-start space-x-3 hover:border-primary/20 transition-all">
                  <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Community Discussion */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>Community Voices</span>
            </h2>
            <div className="space-y-3">
              {DISCUSSIONS.map((post, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-4 border border-white/[0.06] hover:border-white/[0.12] transition-all">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">{post.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-semibold text-foreground">{post.name}</span>
                        <span>{post.country}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{post.time}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{post.message}</p>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => toggleLike(i)}
                      className={`flex items-center space-x-1 text-xs transition-colors ${likedPosts.has(i) ? 'text-rose-400' : 'text-muted-foreground hover:text-rose-400'}`}>
                      <Heart className={`w-3.5 h-3.5 ${likedPosts.has(i) ? 'fill-rose-400' : ''}`} />
                      <span>{post.likes + (likedPosts.has(i) ? 1 : 0)}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center space-x-2 mb-4">
            <AlertCircle className="w-4 h-4 text-primary" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
            {FAQS.map((faq, i) => <FAQItem key={i} {...faq} />)}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card rounded-2xl p-6 border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-foreground text-base">Have a question about voting in {country}?</h3>
            <p className="text-sm text-muted-foreground mt-1">Our AI assistant can answer it instantly in your language 🌍</p>
          </div>
          <button onClick={() => setActiveNavTab('home')}
            className="btn-primary-glow flex items-center space-x-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm whitespace-nowrap">
            <MessageCircle className="w-4 h-4" />
            <span>Ask VoteWise AI</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
