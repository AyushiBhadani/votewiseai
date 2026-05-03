import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPaperRustle } from './simulationSounds';

const CANDIDATES = ["Candidate Blue", "Candidate Red"];

export const FranceSimulation = ({ onVoteCast }: { onVoteCast: (vote: string) => void }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  return (
    <div className="bg-slate-50 p-6 border border-slate-200 rounded-xl max-w-sm mx-auto text-slate-900 shadow-sm">
      <div className="text-center mb-6">
        <div className="flex justify-center space-x-1 mb-2">
          <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
          <div className="w-4 h-4 bg-white border border-slate-200 rounded-sm"></div>
          <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
        </div>
        <h3 className="font-bold text-lg text-slate-800">Élection Présidentielle</h3>
        <p className="text-xs text-slate-500">Pick one ballot slip and place it in the envelope.</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {CANDIDATES.map(c => (
                <button
                  key={c}
                  onClick={() => { setSelected(c); playPaperRustle(); setStep(2); }}
                  className="bg-white border-2 border-slate-200 p-4 shadow-sm hover:border-primary hover:shadow-md transition-all text-sm font-bold text-center"
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
            <div className="w-32 h-40 bg-[#fef3c7] border-2 border-[#d97706] rounded shadow-inner relative flex items-center justify-center mb-6">
              <div className="absolute top-2 w-24 h-1 bg-[#d97706]/20"></div>
              <div className="bg-white border border-slate-200 px-3 py-4 shadow-sm rotate-3 font-bold text-[10px]">
                {selected}
              </div>
            </div>
            <button
              onClick={() => onVoteCast(selected!)}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-800 transition-all"
            >
              Insérer dans l&apos;urne 🗳️
            </button>
            <button onClick={() => setStep(1)} className="mt-4 text-xs text-slate-400 hover:text-slate-600">Go back</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
