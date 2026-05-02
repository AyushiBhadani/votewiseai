"use client";

import React, { useState, useCallback } from 'react';
import Modal from '@/components/Modal';
import { useAppStore } from '@/store/useAppStore';
import { RefreshCw, Laugh, BookOpen, Vote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── MEMES ────────────────────────────────────────────────
const MEMES = [
  { emoji: "🗳️😤", text: "When you finally reach the front of the voting line but forgot your ID at home.", label: "Every. Single. Time." },
  { emoji: "😴🗓️", text: "Me setting 5 alarms for Election Day and still sleeping through all of them.", label: "Civic duty loading..." },
  { emoji: "🤔📜", text: "Reading the ballot: *sees 47 questions about local water board seats*", label: "I did not study for this." },
  { emoji: "🥳📬", text: "When your mail-in ballot arrives and you feel like you actually did something productive.", label: "Democracy delivered!" },
  { emoji: "😂🖊️", text: "The voting booth pen running out of ink right when you're about to sign.", label: "Sabotage?" },
  { emoji: "🏃📺", text: "Me rushing home from work to catch election results live instead of just checking my phone.", label: "The suspense is real." },
  { emoji: "🤦🗺️", text: "When you realize your polling station moved but you only find out after walking to the old one.", label: "Check. Before. You. Go." },
  { emoji: "🎉🧻", text: "The feeling when your candidate wins and you're doing a victory lap with a toilet paper roll.", label: "Celebration mode: ON" },
  { emoji: "😬🤝", text: "When both candidates shake hands and you're just hoping one of them washes hands after.", label: "Political hygiene." },
  { emoji: "📱🗳️", text: "Telling yourself you'll vote 'after finishing this one tweet'. Three hours later…", label: "Social media: 1, Democracy: 0" },
  { emoji: "🧓📖", text: "Your grandpa explaining how he walked 10km uphill both ways just to vote.", label: "Back in my day..." },
  { emoji: "🎭🤡", text: "Election season: when everyone on your social media becomes a political expert.", label: "LinkedIn vs Reality." },
];

// ─── COUNTRY KNOWLEDGE ────────────────────────────────────
const COUNTRY_FACTS: Record<string, { title: string; body: string; constitution: string; branches: string }> = {
  India:        { title: "Parliamentary Democracy", body: "India is a constitutional parliamentary republic. The Prime Minister heads the government; the President is the ceremonial head. Lok Sabha elections are held every 5 years using First-Past-The-Post.", constitution: "https://legislative.gov.in/constitution-of-india/", branches: "https://knowindia.india.gov.in" },
  USA:          { title: "Federal Presidential Republic", body: "The US President is elected via the Electoral College — not by popular vote directly. Congress has two houses: Senate (100 seats) and House of Representatives (435 seats). Elections every 2 years.", constitution: "https://www.archives.gov/founding-docs/constitution", branches: "https://www.usa.gov/branches-of-government" },
  UK:           { title: "Constitutional Monarchy", body: "The UK is governed by a democratically elected Parliament. The Prime Minister leads the party with the most MPs. The monarch is the ceremonial head of state. Elections every 5 years.", constitution: "https://www.parliament.uk/about/how/", branches: "https://www.parliament.uk" },
  Australia:    { title: "Federal Parliamentary Democracy", body: "Australia uses preferential voting — you rank candidates instead of picking one! It has a Senate and House of Representatives. Voting is compulsory for all citizens over 18.", constitution: "https://www.aph.gov.au/constitution", branches: "https://www.aph.gov.au" },
  Canada:       { title: "Federal Parliamentary Democracy", body: "Canada uses First-Past-The-Post voting. The Prime Minister leads the party with most seats in the House of Commons. Canada also has an appointed Senate. Elections every 4 years max.", constitution: "https://laws-lois.justice.gc.ca/eng/const/", branches: "https://www.canada.ca/en/government" },
  France:       { title: "Semi-Presidential Republic", body: "France has both a President (powerful executive) and a Prime Minister. Presidential elections use a two-round system — if no one gets 50%+ in Round 1, top two face off in Round 2.", constitution: "https://www.conseil-constitutionnel.fr/en/constitution", branches: "https://www.gouvernement.fr" },
  Germany:      { title: "Federal Parliamentary Republic", body: "Germany uses a mixed electoral system (proportional + direct seats). The Chancellor is elected by the Bundestag. Parties need 5% to enter parliament (the '5% threshold').", constitution: "https://www.gesetze-im-internet.de/gg/", branches: "https://www.bundestag.de" },
  Japan:        { title: "Constitutional Monarchy", body: "Japan is a constitutional monarchy with a parliamentary government. The Emperor is ceremonial. The Prime Minister leads the Diet (Parliament). The LDP has dominated politics since 1955.", constitution: "https://japan.kantei.go.jp/constitution_and_government_of_japan/constitution_e.html", branches: "https://www.shugiin.go.jp" },
  Brazil:       { title: "Federal Presidential Republic", body: "Brazil uses a two-round presidential election system. If no candidate gets 50%+1 votes in Round 1, the top two compete in Round 2. Voting is mandatory for citizens aged 18–70.", constitution: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm", branches: "https://www.gov.br" },
  "South Africa": { title: "Parliamentary Republic", body: "South Africa uses proportional representation — you vote for a party, not a person. The party with the most seats elects the President. The ANC governed since 1994; lost majority in 2024.", constitution: "https://www.gov.za/documents/constitution", branches: "https://www.parliament.gov.za" },
  Pakistan:     { title: "Federal Parliamentary Republic", body: "Pakistan elects a National Assembly through First-Past-The-Post. The PM is elected by the Assembly. The President is largely ceremonial. Political instability has marked its history.", constitution: "https://www.na.gov.pk/en/constitution.php", branches: "https://www.na.gov.pk" },
  Bangladesh:   { title: "Unitary Parliamentary Republic", body: "Bangladesh has a unicameral parliament (Jatiya Sangsad) with 350 seats. The PM holds executive power. The President is ceremonial. Student protests toppled Sheikh Hasina in 2024.", constitution: "https://bdlaws.minlaw.gov.bd/act-367.html", branches: "https://www.parliament.gov.bd" },
  "Sri Lanka":  { title: "Presidential Republic", body: "Sri Lanka has a directly elected executive President with strong powers, plus a Prime Minister and Parliament. It uses a proportional representation system for parliamentary seats.", constitution: "https://www.parliament.lk/constitution", branches: "https://www.parliament.lk" },
};

export default function CardsRow() {
  const [activeModal, setActiveModal] = useState<'meme' | 'knowledge' | 'simulation' | null>(null);
  const [memeIndex, setMemeIndex] = useState(0);
  const [memeDirection, setMemeDirection] = useState(1);
  const [simVote, setSimVote] = useState<string | null>(null);
  const [simSubmitted, setSimSubmitted] = useState(false);
  const { country } = useAppStore();

  const closeModal = () => { setActiveModal(null); setSimVote(null); setSimSubmitted(false); };

  const nextMeme = useCallback(() => {
    setMemeDirection(1);
    setMemeIndex(i => (i + 1) % MEMES.length);
  }, []);

  const prevMeme = useCallback(() => {
    setMemeDirection(-1);
    setMemeIndex(i => (i - 1 + MEMES.length) % MEMES.length);
  }, []);

  const fact = COUNTRY_FACTS[country] || COUNTRY_FACTS['India'];
  const meme = MEMES[memeIndex];

  return (
    <>
      <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 pb-2 snap-x snap-mandatory custom-scrollbar">

        {/* ── Meme Card ── */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveModal('meme')}
          className="w-[85vw] sm:w-[280px] md:w-auto flex-shrink-0 snap-center glass-card rounded-2xl p-4 flex flex-col cursor-pointer glow-hover group"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Laugh className="w-4 h-4 text-yellow-400" />
              <h4 className="font-semibold text-sm text-foreground">Meme Zone</h4>
            </div>
            <span className="text-[10px] text-muted-foreground bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
              {memeIndex + 1}/{MEMES.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Click for election humor 😄</p>
          <div className="flex-1 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex flex-col items-center justify-center py-4 px-2 text-center">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform text-center flex justify-center w-full">
              <span className="inline-block">{Array.from(meme.emoji)[0]}</span>
            </div>
            <p className="text-[10px] text-muted-foreground line-clamp-2">{meme.label}</p>
          </div>
        </motion.div>

        {/* ── Knowledge Card ── */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveModal('knowledge')}
          className="w-[85vw] sm:w-[280px] md:w-auto flex-shrink-0 snap-center rounded-2xl p-4 border border-primary/20 flex flex-col justify-between cursor-pointer bg-gradient-to-br from-primary/20 to-violet-500/10 glow-hover"
        >
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <BookOpen className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">Knowledge Hub</h4>
            </div>
            <p className="font-bold text-xs text-primary mb-2">{fact.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{fact.body}</p>
          </div>
          <span className="text-xs font-medium text-primary underline underline-offset-2 mt-2 inline-block hover:text-primary/80">
            Explore Facts →
          </span>
        </motion.div>

        {/* ── Simulation Card ── */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setActiveModal('simulation')}
          className="w-[85vw] sm:w-[280px] md:w-auto flex-shrink-0 snap-center glass-card rounded-2xl p-4 flex flex-col cursor-pointer glow-hover group"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Vote className="w-4 h-4 text-emerald-400" />
              <h4 className="font-semibold text-sm text-foreground">Simulation</h4>
            </div>
            <span className="text-muted-foreground text-xs">›</span>
          </div>
          <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 mt-auto relative">
            <div className="text-[10px] text-center font-bold mb-2 text-foreground">Try Voting UI!</div>
            <div className="space-y-1.5">
              <div className="h-4 bg-background/50 rounded border border-border flex items-center px-2 space-x-1.5">
                <div className="w-2 h-2 rounded-full border border-muted-foreground" />
                <div className="h-1.5 w-16 bg-muted-foreground/30 rounded-full" />
              </div>
              <div className="h-4 bg-primary/10 rounded border border-primary/30 flex items-center px-2 space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="h-1.5 w-12 bg-primary/40 rounded-full" />
              </div>
            </div>
            <div className="absolute -right-1 -bottom-1 text-xl text-emerald-400 group-hover:scale-110 transition-transform">✓</div>
          </div>
        </motion.div>
      </div>

      {/* ── MEME MODAL ── */}
      <Modal isOpen={activeModal === 'meme'} onClose={closeModal} title="🎭 Election Meme Zone">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-between w-full">
            <button onClick={prevMeme} className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] transition-colors text-muted-foreground hover:text-foreground">←</button>
            <span className="text-xs text-muted-foreground">{memeIndex + 1} / {MEMES.length}</span>
            <button onClick={nextMeme} className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] transition-colors text-muted-foreground hover:text-foreground">→</button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={memeIndex}
              initial={{ opacity: 0, x: memeDirection * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: memeDirection * -40 }}
              className="w-full bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/10 rounded-2xl p-8 text-center"
            >
              <div className="text-7xl mb-4">{meme.emoji}</div>
              <p className="text-sm font-medium text-foreground leading-relaxed mb-2">"{meme.text}"</p>
              <p className="text-xs text-yellow-400 font-semibold">{meme.label}</p>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={nextMeme}
            className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-400 px-5 py-2 rounded-xl text-sm font-medium transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Next Meme</span>
          </button>
          <p className="text-xs text-muted-foreground">Voting is serious — but a good laugh helps! 😄</p>
        </div>
      </Modal>

      {/* ── KNOWLEDGE MODAL ── */}
      <Modal isOpen={activeModal === 'knowledge'} onClose={closeModal} title={`📚 ${country} Knowledge Hub`}>
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <h4 className="font-bold text-primary mb-1">{fact.title}</h4>
            <p className="text-sm text-foreground/90 leading-relaxed">{fact.body}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => window.open(fact.constitution, '_blank')}
              className="bg-white/[0.04] border border-white/[0.08] p-4 rounded-xl text-left hover:bg-white/[0.08] hover:border-primary/30 transition-all">
              <span className="block text-2xl mb-2">📜</span>
              <h5 className="font-bold text-xs mb-1 text-foreground">Constitution</h5>
              <p className="text-[10px] text-muted-foreground">Foundational laws of {country}</p>
            </button>
            <button onClick={() => window.open(fact.branches, '_blank')}
              className="bg-white/[0.04] border border-white/[0.08] p-4 rounded-xl text-left hover:bg-white/[0.08] hover:border-primary/30 transition-all">
              <span className="block text-2xl mb-2">🏛️</span>
              <h5 className="font-bold text-xs mb-1 text-foreground">Government</h5>
              <p className="text-[10px] text-muted-foreground">How {country} is governed</p>
            </button>
          </div>
        </div>
      </Modal>

      {/* ── SIMULATION MODAL ── */}
      <Modal isOpen={activeModal === 'simulation'} onClose={closeModal} title="🗳️ Ballot Simulation">
        <div className="space-y-4">
          {!simSubmitted ? (
            <>
              <p className="text-sm text-muted-foreground">Practice filling out a ballot. This is just a simulation — no real vote is recorded.</p>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5 space-y-3">
                <h4 className="font-bold text-foreground border-b border-white/[0.08] pb-2 text-sm">Select Your Candidate</h4>
                {[
                  { name: "Candidate A", party: "Progressive Alliance" },
                  { name: "Candidate B", party: "Conservative Front" },
                  { name: "Candidate C", party: "Independent" },
                ].map(c => (
                  <label key={c.name} className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all border ${simVote === c.name ? 'bg-primary/10 border-primary/30' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/20'}`}>
                    <input type="radio" name="candidate" value={c.name} checked={simVote === c.name}
                      onChange={() => setSimVote(c.name)} className="w-4 h-4 accent-primary" />
                    <div>
                      <span className="font-medium text-sm text-foreground block">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.party}</span>
                    </div>
                  </label>
                ))}
              </div>
              <button
                onClick={() => simVote && setSimSubmitted(true)}
                disabled={!simVote}
                className="w-full bg-gradient-to-r from-primary to-violet-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Cast Mock Vote 🗳️
              </button>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-4 py-6">
              <div className="text-6xl">✅</div>
              <h3 className="text-xl font-bold text-foreground">Vote Cast!</h3>
              <p className="text-sm text-muted-foreground">You selected <strong className="text-foreground">{simVote}</strong>. In a real election, your ballot would now be securely counted.</p>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-left w-full">
                <p className="font-semibold text-primary mb-1">What happens next in {country}?</p>
                <p className="text-muted-foreground text-xs leading-relaxed">Votes are counted by election officials, results are announced, and the winner takes office after a formal ceremony. The whole process is monitored by independent observers.</p>
              </div>
              <button onClick={closeModal} className="btn-primary-glow px-6 py-2 rounded-xl text-white text-sm font-semibold">Done</button>
            </motion.div>
          )}
        </div>
      </Modal>
    </>
  );
}
