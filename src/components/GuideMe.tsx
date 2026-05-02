"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, ExternalLink, X, MapPin, FileText, UserCheck, Vote, Download } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getRegistrationUrl } from '@/lib/aiUtils';

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const ELIGIBILITY: Record<string, { age: number; citizenRequired: boolean; idRequired: string }> = {
  India:        { age: 18, citizenRequired: true,  idRequired: 'Aadhaar Card / Voter ID' },
  USA:          { age: 18, citizenRequired: true,  idRequired: 'Government-issued photo ID' },
  UK:           { age: 16, citizenRequired: false, idRequired: 'National Insurance Number' },
  Australia:    { age: 18, citizenRequired: true,  idRequired: 'Proof of identity document' },
  Canada:       { age: 18, citizenRequired: true,  idRequired: 'Government-issued ID with address' },
  France:       { age: 18, citizenRequired: true,  idRequired: "Carte nationale d'identité" },
  Germany:      { age: 18, citizenRequired: true,  idRequired: 'Personalausweis (National ID)' },
  Japan:        { age: 18, citizenRequired: true,  idRequired: 'My Number Card / Jūminhyō' },
  Brazil:       { age: 16, citizenRequired: true,  idRequired: 'CPF + Título de Eleitor' },
  'South Africa': { age: 18, citizenRequired: true, idRequired: 'South African ID book/card' },
  Pakistan:     { age: 18, citizenRequired: true,  idRequired: 'CNIC (Computerised National ID)' },
  Bangladesh:   { age: 18, citizenRequired: true,  idRequired: 'National Identity Card (NID)' },
  'Sri Lanka':  { age: 18, citizenRequired: true,  idRequired: 'National Identity Card' },
};

interface GuideMeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideMe({ isOpen, onClose }: GuideMeProps) {
  const { country } = useAppStore();
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [isCitizen, setIsCitizen] = useState<boolean | null>(null);
  const [eligible, setEligible] = useState<boolean | null>(null);

  const eligibility = ELIGIBILITY[country] ?? ELIGIBILITY['India'];
  const registration = getRegistrationUrl(country);

  const STEPS: Step[] = [
    {
      id: 0, title: 'Your Country',
      icon: <MapPin className="w-5 h-5" />,
      description: `You have selected 🌍 ${country}. This guide will walk you through the exact steps to vote in ${country}.`,
    },
    {
      id: 1, title: 'Check Eligibility',
      icon: <UserCheck className="w-5 h-5" />,
      description: `Let's check if you can vote in ${country}.`,
    },
    {
      id: 2, title: 'Documents Needed',
      icon: <FileText className="w-5 h-5" />,
      description: `Here's what you need to bring.`,
    },
    {
      id: 3, title: 'Register to Vote',
      icon: <Vote className="w-5 h-5" />,
      description: `How to get on the electoral roll.`,
    },
    {
      id: 4, title: 'You\'re Ready!',
      icon: <CheckCircle2 className="w-5 h-5" />,
      description: `You know everything you need to vote!`,
    },
  ];

  const checkEligibility = () => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return;
    const ageOk = ageNum >= eligibility.age;
    const citizenOk = !eligibility.citizenRequired || isCitizen === true;
    setEligible(ageOk && citizenOk);
    setStep(2);
  };

  const reset = () => {
    setStep(0);
    setAge('');
    setIsCitizen(null);
    setEligible(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 0.99, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#0d1117] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-gradient-to-r from-primary/10 to-violet-500/10">
          <div>
            <h2 className="font-bold text-foreground text-base">🧭 Guide Me</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step-by-step voting guide for {country}</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center space-x-1.5">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-primary text-white' :
                  'bg-white/[0.06] text-muted-foreground'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-emerald-500' : 'bg-white/[0.06]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Step {step + 1} of {STEPS.length}: <span className="text-foreground font-medium">{STEPS[step]?.title}</span></p>
        </div>

        {/* Step Content */}
        <div className="px-6 py-5 min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Country */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <p className="text-sm text-foreground leading-relaxed">{STEPS[0].description}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What this guide covers:</h4>
                    {['✅ Eligibility check', '📄 Document requirements', '🗳️ How to register', '🔗 Official registration link'].map(item => (
                      <div key={item} className="flex items-center space-x-2 text-sm text-foreground/80">
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Eligibility Check */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Your Age</label>
                      <input
                        type="number" min="1" max="120"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        placeholder={`Min age to vote in ${country}: ${eligibility.age}`}
                        className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 transition-all"
                      />
                    </div>
                    {eligibility.citizenRequired && (
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Are you a citizen of {country}?</label>
                        <div className="flex space-x-2">
                          {[true, false].map(val => (
                            <button key={String(val)}
                              onClick={() => setIsCitizen(val)}
                              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                                isCitizen === val
                                  ? 'bg-primary/10 border-primary/40 text-primary'
                                  : 'bg-white/[0.03] border-white/[0.08] text-muted-foreground hover:border-white/20'
                              }`}
                            >
                              {val ? 'Yes' : 'No'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={checkEligibility}
                    disabled={!age || (eligibility.citizenRequired && isCitizen === null)}
                    className="w-full bg-gradient-to-r from-primary to-violet-500 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary/20"
                  >
                    Check My Eligibility →
                  </button>
                </div>
              )}

              {/* Step 2: Documents */}
              {step === 2 && (
                <div className="space-y-4">
                  {eligible === false ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <h4 className="font-bold text-red-400 mb-1">⚠️ Not Yet Eligible</h4>
                      <p className="text-sm text-foreground/80">You need to be at least <strong>{eligibility.age} years old</strong> and {eligibility.citizenRequired ? 'a citizen' : 'a resident'} of {country} to vote. Check back when you meet these requirements!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                        <p className="text-sm font-semibold text-emerald-400">✅ You are likely eligible to vote in {country}!</p>
                      </div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Documents:</h4>
                      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2">
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{eligibility.idRequired}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">Proof of address (utility bill, bank statement)</span>
                        </div>
                        {country === 'India' && (
                          <div className="flex items-start space-x-2">
                            <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground">Form 6 (available on NVSP portal)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Register */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">How to register in {country}:</h4>
                    {[
                      `Visit the official registration portal`,
                      `Create an account with your email / phone`,
                      `Fill in your personal details and address`,
                      `Upload your required identity documents`,
                      `Submit and await confirmation (usually 2–4 weeks)`,
                    ].map((s, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</div>
                        <p className="text-sm text-foreground/80">{s}</p>
                      </div>
                    ))}
                  </div>
                  <a href={registration.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-primary to-violet-500 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{registration.label}</span>
                  </a>
                </div>
              )}

              {/* Step 4: Done */}
              {step === 4 && (
                <div className="flex flex-col items-center text-center space-y-4 py-2">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-foreground">You're ready to vote! 🗳️</h3>
                  <p className="text-sm text-muted-foreground">You now know your eligibility, required documents, and how to register. Democracy needs YOU!</p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full">
                    <a href={registration.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center space-x-2 bg-primary/10 border border-primary/30 text-primary py-2.5 rounded-xl text-sm font-medium hover:bg-primary/20 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Register Now</span>
                    </a>
                    <button onClick={handleClose}
                      className="flex-1 bg-gradient-to-r from-primary to-violet-500 text-white py-2.5 rounded-xl font-semibold text-sm"
                    >
                      Back to Chat
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        {step !== 4 && !(step === 2 && eligible === false) && (
          <div className="px-6 pb-5 flex items-center justify-between">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {step !== 1 && (
              <button
                onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-sm bg-primary text-white font-medium hover:bg-primary/90 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Reset if not eligible */}
        {step === 2 && eligible === false && (
          <div className="px-6 pb-5">
            <button onClick={reset} className="w-full py-2.5 rounded-xl text-sm border border-white/[0.10] text-muted-foreground hover:text-foreground hover:border-white/20 transition-all">
              Start Over
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
