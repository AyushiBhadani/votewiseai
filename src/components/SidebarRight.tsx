"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Scale, Newspaper } from 'lucide-react';
import { getPastEvents } from '@/data/electionEvents';

interface LiveNews {
  id: string;
  date: string;
  title: string;
  description: string;
  source: string;
}

const COUNTRY_SYSTEMS: Record<string, { system: string; head: string; term: string; houses: string; votingAge: number; method: string }> = {
  India:          { system: 'Parliamentary Republic',      head: 'Prime Minister',      term: '5 years',   houses: 'Lok Sabha + Rajya Sabha',          votingAge: 18, method: 'First-Past-The-Post' },
  USA:            { system: 'Presidential Republic',       head: 'President',           term: '4 years',   houses: 'Senate + House of Representatives', votingAge: 18, method: 'Electoral College' },
  UK:             { system: 'Constitutional Monarchy',     head: 'Prime Minister',      term: '5 years',   houses: 'House of Commons + Lords',          votingAge: 18, method: 'First-Past-The-Post' },
  Australia:      { system: 'Federal Parliamentary',       head: 'Prime Minister',      term: '3 years',   houses: 'Senate + House of Representatives', votingAge: 18, method: 'Preferential Voting' },
  Canada:         { system: 'Federal Parliamentary',       head: 'Prime Minister',      term: '4 years',   houses: 'Senate + House of Commons',         votingAge: 18, method: 'First-Past-The-Post' },
  France:         { system: 'Semi-Presidential Republic',  head: 'President + PM',      term: '5 years',   houses: 'Senate + National Assembly',        votingAge: 18, method: 'Two-Round System' },
  Germany:        { system: 'Federal Parliamentary',       head: 'Chancellor',          term: '4 years',   houses: 'Bundestag + Bundesrat',             votingAge: 18, method: 'Mixed Proportional' },
  Japan:          { system: 'Constitutional Monarchy',     head: 'Prime Minister',      term: '4 years',   houses: 'House of Representatives + Councillors', votingAge: 18, method: 'Mixed Proportional' },
  Brazil:         { system: 'Federal Presidential',        head: 'President',           term: '4 years',   houses: 'Senate + Chamber of Deputies',      votingAge: 16, method: 'Two-Round + Proportional' },
  'South Africa': { system: 'Parliamentary Republic',      head: 'President',           term: '5 years',   houses: 'National Assembly + NCOP',          votingAge: 18, method: 'Proportional Representation' },
  Pakistan:       { system: 'Federal Parliamentary',       head: 'Prime Minister',      term: '5 years',   houses: 'National Assembly + Senate',        votingAge: 18, method: 'First-Past-The-Post' },
  Bangladesh:     { system: 'Unitary Parliamentary',       head: 'Prime Minister',      term: '5 years',   houses: 'Jatiya Sangsad (unicameral)',        votingAge: 18, method: 'First-Past-The-Post' },
  'Sri Lanka':    { system: 'Presidential Republic',       head: 'President',           term: '5 years',   houses: 'Parliament (unicameral)',            votingAge: 18, method: 'Preferential Proportional' },
};

const ALL_COUNTRIES = Object.keys(COUNTRY_SYSTEMS);

export default function SidebarRight() {
  const { country, setCountry } = useAppStore();
  const [compareWith, setCompareWith] = useState('USA');
  const [isCompareOpen, setIsCompareOpen] = useState(true);
  const [isRecentOpen, setIsRecentOpen] = useState(true);
  const [liveNews, setLiveNews] = useState<LiveNews[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoadingNews(true);
      try {
        const res = await fetch(`/api/news?country=${encodeURIComponent(country)}`);
        if (res.ok) {
          const data = await res.json();
          setLiveNews(data);
        }
      } catch (err) {
        console.error("Failed to fetch live news", err);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, [country]);

  const current = COUNTRY_SYSTEMS[country] || COUNTRY_SYSTEMS['India'];
  const compare = COUNTRY_SYSTEMS[compareWith] || COUNTRY_SYSTEMS['USA'];

  const fields = [
    { label: 'System',     cA: current.system,       cB: compare.system },
    { label: 'Head',       cA: current.head,         cB: compare.head },
    { label: 'Term',       cA: current.term,         cB: compare.term },
    { label: 'Houses',     cA: current.houses,       cB: compare.houses },
    { label: 'Voting Age', cA: `${current.votingAge}+`,  cB: `${compare.votingAge}+` },
    { label: 'Method',     cA: current.method,       cB: compare.method },
  ];

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">

      {/* Live Recent Results (News) */}
      <div className="glass-card rounded-2xl p-4 border border-white/[0.06] flex-shrink-0">
        <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => setIsRecentOpen(p => !p)}>
          <h3 className="font-bold text-foreground text-sm flex items-center space-x-2">
            <Newspaper className="w-4 h-4 text-emerald-400" />
            <span>Live News · {country}</span>
          </h3>
          <div className="flex items-center space-x-2">
            {loadingNews && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            {isRecentOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
        <AnimatePresence>
          {isRecentOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              {loadingNews ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2 opacity-50">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] text-muted-foreground">Fetching live updates...</p>
                </div>
              ) : liveNews.length === 0 ? (
                <p className="text-xs text-muted-foreground">No live news found for {country}.</p>
              ) : (
                <div className="space-y-2">
                  {liveNews.map((news, idx) => (
                    <div key={news.id || idx} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer">
                      <h4 className="text-[11px] font-semibold text-foreground truncate hover:text-emerald-400 transition-colors">{news.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{news.description}</p>
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/[0.05]">
                        <span className="text-[8px] font-medium text-emerald-500/70 uppercase tracking-wider">{news.source || 'News'}</span>
                        <span className="text-[9px] text-muted-foreground/60">{news.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Country Comparison */}
      <div className="glass-card rounded-2xl p-4 border border-white/[0.06] flex-1 min-h-0 flex flex-col">
        <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => setIsCompareOpen(p => !p)}>
          <div className="flex items-center space-x-2">
            <Scale className="w-3.5 h-3.5 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Compare Systems</h3>
          </div>
          {isCompareOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>

        <AnimatePresence>
          {isCompareOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Selector */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Country A</p>
                  <div className="px-2 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[11px] font-semibold text-primary truncate">{country}</div>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Compare with</p>
                  <select
                    value={compareWith}
                    onChange={e => setCompareWith(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-foreground outline-none focus:border-primary/40 transition-colors"
                  >
                    {ALL_COUNTRIES.filter(c => c !== country).map(c => (
                      <option key={c} value={c} className="bg-[#060a12]">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comparison table */}
              <div className="overflow-y-auto custom-scrollbar flex-1 space-y-1.5">
                {fields.map(({ label, cA, cB }) => (
                  <div key={label} className="grid grid-cols-[50px_1fr_1fr] gap-1 text-[10px]">
                    <span className="text-muted-foreground/60 font-medium pt-1">{label}</span>
                    <span className={`px-1.5 py-1 rounded bg-primary/10 text-primary font-medium leading-tight ${cA === cB ? '' : ''}`}>{cA}</span>
                    <span className="px-1.5 py-1 rounded bg-white/[0.04] text-muted-foreground leading-tight">{cB}</span>
                  </div>
                ))}
              </div>

              {current.method !== compare.method && (
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <p className="text-[10px] text-amber-400/80">
                    ⚡ Key difference: {country} uses <strong>{current.method}</strong> while {compareWith} uses <strong>{compare.method}</strong>.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
