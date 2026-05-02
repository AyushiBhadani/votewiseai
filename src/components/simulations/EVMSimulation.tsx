import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EVM_CANDIDATES = [
  { name: "Aarav Sharma", symbol: "🌟" },
  { name: "Priya Patel", symbol: "🌺" },
  { name: "Rohan Singh", symbol: "✋" },
  { name: "NOTA", symbol: "🚫" },
];

export const EVMSimulation = ({ onVoteCast }: { onVoteCast: (vote: string) => void }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(2500, audioCtx.currentTime); // High pitch BEEP
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const handleVote = (candidate: string) => {
    setSelected(candidate);
    playBeep();
    // Simulate the EVM light staying on for 2 seconds before confirmation
    setTimeout(() => {
      onVoteCast(candidate);
    }, 1500);
  };

  return (
    <div className="bg-[#E5E7EB] border-4 border-[#9CA3AF] rounded-md p-4 shadow-inner max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-400 pb-2">
        <div className="bg-red-600 w-3 h-3 rounded-full shadow-inner animate-pulse"></div>
        <div className="font-mono text-xs font-bold text-gray-700">BALLOT UNIT</div>
        <div className="bg-green-500 w-3 h-3 rounded-full shadow-inner"></div>
      </div>
      
      <div className="space-y-2">
        {EVM_CANDIDATES.map((c, idx) => (
          <div key={idx} className="flex items-center bg-white border-2 border-gray-300 p-2 rounded justify-between">
            <div className="flex items-center space-x-3 w-1/2">
              <span className="font-bold text-gray-800">{idx + 1}</span>
              <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
            </div>
            <div className="flex items-center justify-between w-1/2 pl-2">
              <div className="text-xl w-8 text-center bg-gray-100 border border-gray-200 rounded">{c.symbol}</div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full border border-gray-400 ${selected === c.name ? 'bg-red-600 shadow-[0_0_8px_#dc2626]' : 'bg-gray-200'}`} />
                <button
                  onClick={() => handleVote(c.name)}
                  disabled={selected !== null}
                  className="w-10 h-6 bg-blue-600 rounded-sm shadow-[0_2px_0_#1e3a8a] active:shadow-none active:translate-y-0.5 transition-all disabled:opacity-50"
                  aria-label={`Vote for ${c.name}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Election Commission Simulation</p>
      </div>
    </div>
  );
};
