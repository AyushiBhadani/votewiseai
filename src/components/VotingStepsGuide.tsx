"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Image from 'next/image';

// Country-specific steps data
const COUNTRY_STEPS: Record<string, { title: string; description: string; tip: string }[]> = {
  India: [
    { title: "Register to Vote", description: "Enroll in the National Voter Service Portal (NVSP) or visit your local BLO (Booth Level Officer). You must be 18+ and a citizen of India.", tip: "🔗 nvsp.in" },
    { title: "Check Your Voter ID", description: "Your EPIC (Elector's Photo Identity Card) is your key. Download it from the Voters' Portal or collect it at your local office.", tip: "📱 Voter Helpline: 1950" },
    { title: "Find Your Polling Booth", description: "Search your polling station on the Voter Portal or SMS 'EPIC <your voter ID>' to 1950. Carry your EPIC or an approved alternate ID.", tip: "🗺️ voterportal.eci.gov.in" },
    { title: "Cast Your Vote (EVM)", description: "Press the blue button next to your chosen candidate on the Electronic Voting Machine. A red light and BEEP confirms your vote. Press VVPAT to verify.", tip: "⏰ Polls open 7AM–6PM" },
    { title: "Results & Counting", description: "Votes are counted electronically. Results are announced on the ECI website and national TV. The winning candidate takes oath within days.", tip: "📺 results.eci.gov.in" },
  ],
  USA: [
    { title: "Register to Vote", description: "Register at vote.gov or through your state's DMV. Deadlines vary by state — some allow same-day registration. You must be a US citizen, 18+ on Election Day.", tip: "🔗 vote.gov" },
    { title: "Check Your Registration", description: "Verify your registration status and find your polling place at vote.gov. Make sure your address is up to date if you've moved.", tip: "📮 Request mail ballot early" },
    { title: "Find Your Polling Place", description: "Your polling location is assigned based on your registered address. You can also request a mail-in or absentee ballot in most states.", tip: "🗺️ polls.withgoogle.com" },
    { title: "Cast Your Vote", description: "Mark your ballot clearly with a pen. Fill in the oval next to your candidate. Scan or deposit it. You may also have a Write-In option.", tip: "🪪 Bring valid photo ID" },
    { title: "Results", description: "Results are reported on election night but may take days to certify. The Electoral College meets in December to confirm the President.", tip: "📺 AP, CNN, Fox News" },
  ],
  Australia: [
    { title: "Enrol to Vote", description: "Enrolment is compulsory for all Australian citizens 18+. Update via the AEC website. Rolls close 7 days after the election is called.", tip: "🔗 aec.gov.au" },
    { title: "Understand Preferential Voting", description: "Australia uses Preferential Voting — you MUST number every candidate from 1 to the total number of candidates. Just picking one is not enough!", tip: "📖 AEC has free guides" },
    { title: "Find Your Polling Place", description: "You can vote at any polling place in your state or territory. Overseas and postal voting options are also available.", tip: "🌏 Overseas voting available" },
    { title: "Cast Your Preference Ballot", description: "Write numbers (1, 2, 3…) in the boxes next to candidates. Number ALL boxes. Do not tick or cross — use numbers only!", tip: "⚠️ Voting is compulsory!" },
    { title: "Results", description: "Counting begins after polls close. Preference distribution takes longer. The party with the majority of seats forms government.", tip: "📺 ABC News Election" },
  ],
  France: [
    { title: "Register (Inscription)", description: "Register at mairie (town hall) or online. EU citizens can vote in local/EU elections. You must be 18+ and a French citizen for national elections.", tip: "🔗 service-public.fr" },
    { title: "Receive Voter Card", description: "Your Carte d'Électeur is mailed to your home. Bring it plus a photo ID (national ID or passport) to the polling station.", tip: "📬 Check your mailbox!" },
    { title: "Find Your Bureau de Vote", description: "Your polling station is listed on your voter card. You can also check at mairie or online at the government portal.", tip: "🗺️ Vote at your mairie" },
    { title: "Pick Your Ballot Slip & Vote", description: "Enter the polling booth, pick the paper slip of your chosen candidate, place it in the envelope, and insert it into the ballot box. Two rounds if no majority.", tip: "📋 Two-round system" },
    { title: "Results", description: "Round 1 results are known same night. If no candidate gets 50%+, top two face off 2 weeks later in Round 2.", tip: "📺 France 2 TV" },
  ],
  UK: [
    { title: "Register to Vote", description: "Register at gov.uk/register-to-vote. You must be 18+ and a British, Irish, or qualifying Commonwealth citizen.", tip: "🔗 gov.uk/register-to-vote" },
    { title: "Get Your Poll Card", description: "A poll card is posted to your address. You don't need it to vote but it shows your polling station. Photo ID is now required in England.", tip: "🪪 Photo ID required (England)" },
    { title: "Find Your Polling Station", description: "Your polling station is printed on your poll card. Polls are open from 7AM to 10PM on election day.", tip: "⏰ 7AM to 10PM" },
    { title: "Cast Your Vote", description: "Mark ONE X next to your chosen candidate using the pencil provided. Fold your ballot and put it in the box. Simple and quick!", tip: "✏️ Use the pencil provided" },
    { title: "Results", description: "Counts start after polls close at 10PM. Most results come in overnight. The party with most seats forms government by morning.", tip: "📺 BBC Election Night" },
  ],
};

// Default steps for countries without specific data
const DEFAULT_STEPS = [
  { title: "Register to Vote", description: "Check your eligibility and register with your country's election commission. Requirements include citizenship, age (typically 18+), and residency.", tip: "📋 Check official election commission website" },
  { title: "Verify Your Documents", description: "Prepare your national ID, passport, or other approved identification documents required for voting in your country.", tip: "🪪 Keep your ID updated" },
  { title: "Find Your Polling Station", description: "Locate your designated polling station using your voter registration details or the national election commission's online portal.", tip: "🗺️ Check your voter card" },
  { title: "Cast Your Vote", description: "Follow the voting procedure for your country's electoral system. Mark your ballot clearly and submit it to the ballot box or machine.", tip: "✅ Every vote counts!" },
  { title: "Results", description: "Votes are counted and results announced by the election commission. Winners are sworn in after the official count is certified.", tip: "📺 Follow official channels" },
];

const STEP_IMAGES = [
  '/guide/step1_register.png',
  '/guide/step2_id.png',
  '/guide/step3_booth.png',
  '/guide/step4_vote.png',
  '/guide/step5_results.png',
];

const STEP_COLORS = [
  'from-violet-500/20 to-indigo-500/10 border-violet-500/30',
  'from-teal-500/20 to-cyan-500/10 border-teal-500/30',
  'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
  'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
  'from-amber-500/20 to-orange-500/10 border-amber-500/30',
];

export default function VotingStepsGuide({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const { country } = useAppStore();

  const steps = COUNTRY_STEPS[country] || DEFAULT_STEPS;
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(s => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(s => s - 1);
    }
  };

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Step-by-step voting guide">
      {/* Progress Bar */}
      <div className="flex items-center space-x-1.5 mb-5" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={steps.length}>
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-primary flex-1' : i < currentStep ? 'bg-primary/40 w-6' : 'bg-white/10 w-6'}`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      {/* Step Counter */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">Step {currentStep + 1} of {steps.length}</span>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          {country} Guide
        </span>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`flex-1 bg-gradient-to-br ${STEP_COLORS[currentStep]} border rounded-2xl p-5 flex flex-col`}
        >
          {/* Illustration */}
          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-white/5 mb-4 flex-shrink-0">
            <Image
              src={STEP_IMAGES[currentStep]}
              alt={`Illustration for ${step.title}`}
              fill
              className="object-contain p-3"
              priority
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {currentStep + 1}
              </div>
              <h3 className="font-bold text-foreground text-base">{step.title}</h3>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed mb-3 flex-1">{step.description}</p>

            {/* Tip */}
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2">
              <p className="text-xs text-muted-foreground">{step.tip}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous step"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {isLast ? (
          <button
            onClick={onClose}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-white text-sm font-bold shadow-lg hover:shadow-primary/30 transition-all"
            aria-label="Finish guide"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>All Done! 🎉</span>
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/30 transition-all"
            aria-label="Next step"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
