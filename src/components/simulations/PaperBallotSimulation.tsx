import React, { useState } from 'react';
import { playStampThud } from './simulationSounds';

const CANDIDATES = [
  { name: "John Doe", party: "Independent" },
  { name: "Jane Smith", party: "Reform Party" },
  { name: "Robert Brown", party: "Civic Union" },
];

export const PaperBallotSimulation = ({ 
  onVoteCast, 
  country 
}: { 
  onVoteCast: (vote: string) => void,
  country: string
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [writeIn, setWriteIn] = useState('');

  const handleCast = () => {
    if (writeIn.trim()) {
      onVoteCast(`Write-in: ${writeIn}`);
    } else if (selected) {
      onVoteCast(selected);
    }
  };

  const isUSA = country === 'USA';

  return (
    <div className="bg-white p-8 border-4 border-slate-800 max-w-sm mx-auto text-slate-900 font-serif">
      <div className="text-center mb-6 border-b-4 border-slate-800 pb-2">
        <h3 className="font-bold text-xl uppercase tracking-tighter">Official Ballot</h3>
        <p className="text-[10px] font-bold mt-1">General Election · {new Date().getFullYear()}</p>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-[11px] font-bold uppercase mb-2 italic">Vote for ONE candidate:</p>
        {CANDIDATES.map(c => (
          <label key={c.name} className="flex items-center space-x-4 cursor-pointer group">
            <div className={`w-8 h-8 border-2 border-slate-800 flex items-center justify-center text-2xl font-bold transition-all ${selected === c.name ? 'bg-slate-800 text-white' : 'group-hover:bg-slate-100'}`}>
              {selected === c.name && "X"}
            </div>
            <input 
              type="radio" 
              name="ballot" 
              className="hidden" 
              checked={selected === c.name}
              onChange={() => { setSelected(c.name); setWriteIn(''); playStampThud(); }}
            />
            <div className="flex-1">
              <span className="block font-bold text-sm uppercase">{c.name}</span>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">{c.party}</span>
            </div>
          </label>
        ))}

        {isUSA && (
          <div className="pt-4 border-t-2 border-slate-200">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 border-2 border-slate-800 flex items-center justify-center text-2xl font-bold ${writeIn ? 'bg-slate-800 text-white' : ''}`}>
                {writeIn && "X"}
              </div>
              <div className="flex-1">
                <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Write-in candidate:</span>
                <input
                  type="text"
                  value={writeIn}
                  onChange={(e) => { setWriteIn(e.target.value); setSelected(null); }}
                  placeholder="Enter name"
                  className="w-full border-b border-slate-800 py-1 text-sm focus:outline-none placeholder:text-slate-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleCast}
        disabled={!selected && !writeIn.trim()}
        className="w-full bg-slate-900 text-white py-3 font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-30"
      >
        Submit Ballot
      </button>
      
      <p className="text-center text-[9px] mt-4 text-slate-400 font-bold uppercase">Polls close at 8:00 PM</p>
    </div>
  );
};
