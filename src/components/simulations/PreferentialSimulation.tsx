import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CANDIDATES = ["Party Alpha", "Party Beta", "Party Gamma"];

export const PreferentialSimulation = ({ onVoteCast }: { onVoteCast: (vote: string) => void }) => {
  const [rankings, setRankings] = useState<Record<string, number>>({});

  const handleRank = (candidate: string, rank: number) => {
    const newRankings = { ...rankings };
    // Clear the rank from whoever had it before
    Object.keys(newRankings).forEach(k => {
      if (newRankings[k] === rank) delete newRankings[k];
    });
    newRankings[candidate] = rank;
    setRankings(newRankings);
  };

  const isComplete = Object.keys(rankings).length === CANDIDATES.length;

  return (
    <div className="bg-[#fef9c3] p-6 border-2 border-[#a16207] shadow-lg max-w-sm mx-auto text-slate-900">
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg border-b-2 border-[#a16207] pb-1 uppercase tracking-tight">Ballot Paper</h3>
        <p className="text-xs italic mt-1 font-semibold">Number the squares from 1 to {CANDIDATES.length} in the order of your choice.</p>
      </div>

      <div className="space-y-4">
        {CANDIDATES.map((c) => (
          <div key={c} className="flex items-center space-x-4">
            <input
              type="number"
              min="1"
              max={CANDIDATES.length}
              value={rankings[c] || ''}
              onChange={(e) => handleRank(c, parseInt(e.target.value))}
              className="w-10 h-10 border-2 border-[#a16207] text-center font-bold text-lg bg-white rounded-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="font-bold text-sm uppercase">{c}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onVoteCast(`Ranked: ${Object.entries(rankings).map(([c, r]) => `${r}-${c}`).join(', ')}`)}
        disabled={!isComplete}
        className="w-full mt-6 bg-[#a16207] text-white py-2 font-bold uppercase tracking-widest hover:bg-[#854d0e] transition-colors disabled:opacity-30"
      >
        Cast Vote 🗳️
      </button>
    </div>
  );
};
