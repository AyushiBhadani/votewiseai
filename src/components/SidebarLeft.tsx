"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, ArrowRight, ExternalLink, ChevronRight, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { electionEvents } from '@/data/electionEvents';

// Per-country eligibility rules
const ELIGIBILITY_RULES: Record<string, { age: number; citizenship: string; residency: string; id: string }> = {
  India:          { age: 18, citizenship: "Indian citizen",          residency: "Resident of your constituency", id: "Aadhaar / Voter ID Card" },
  USA:            { age: 18, citizenship: "US citizen",              residency: "Resident of your state",        id: "State-issued ID / Driver's License" },
  UK:             { age: 18, citizenship: "British/Irish/qualifying citizen", residency: "UK resident",          id: "NI Number required to register" },
  Australia:      { age: 18, citizenship: "Australian citizen",      residency: "Australian resident",          id: "Name on electoral roll" },
  Canada:         { age: 18, citizenship: "Canadian citizen",        residency: "Canadian resident",            id: "Proof of address + identity" },
  France:         { age: 18, citizenship: "French citizen",          residency: "Registered at commune",        id: "National ID / Passport" },
  Germany:        { age: 18, citizenship: "German citizen",          residency: "Registered in Germany",        id: "Personal ID / Registration certificate" },
  Japan:          { age: 18, citizenship: "Japanese national",       residency: "Registered in municipality",   id: "Residence card" },
  Brazil:         { age: 16, citizenship: "Brazilian citizen",       residency: "Registered at Electoral Court", id: "Título de Eleitor (Voter ID)" },
  "South Africa": { age: 18, citizenship: "South African citizen",   residency: "Permanent SA resident",        id: "SA ID book/card (green barcoded)" },
  Pakistan:       { age: 18, citizenship: "Pakistani citizen",       residency: "Registered on electoral rolls", id: "CNIC (National ID Card)" },
  Bangladesh:     { age: 18, citizenship: "Bangladeshi citizen",     residency: "Permanent resident",           id: "National Identity Card (NID)" },
  "Sri Lanka":    { age: 18, citizenship: "Sri Lankan citizen",      residency: "Registered in electorate",     id: "National Identity Card" },
};

const QUESTIONS = [
  { id: 'age',        label: (country: string) => `Are you ${ELIGIBILITY_RULES[country]?.age || 18}+ years old?` },
  { id: 'citizen',    label: (country: string) => `Are you a ${ELIGIBILITY_RULES[country]?.citizenship || 'citizen'}?` },
  { id: 'resident',   label: (country: string) => `${ELIGIBILITY_RULES[country]?.residency || 'Are you a resident'}?` },
  { id: 'id',         label: (country: string) => `Do you have valid ID? (${ELIGIBILITY_RULES[country]?.id || 'Government ID'})` },
];

const getSteps = (lang: string) => {
  if (lang === 'Hindi') return [
    { id: 1, title: 'योग्यता की जाँच करें', desc: 'आयु, नागरिकता' },
    { id: 2, title: 'वोट देने के लिए पंजीकरण करें', desc: 'अपना विवरण जमा करें' },
    { id: 3, title: 'मतदान केंद्र खोजें', desc: 'वोट कहां देना है' },
    { id: 4, title: 'अपना वोट डालें', desc: 'अपनी आवाज़ उठाएं!' },
  ];
  if (lang === 'Tamil') return [
    { id: 1, title: 'தகுதி சரிபார்க்கவும்', desc: 'வயது, குடியுரிமை' },
    { id: 2, title: 'வாக்காளராக பதிவு செய்யவும்', desc: 'உங்கள் விவரங்களை சமர்ப்பிக்கவும்' },
    { id: 3, title: 'வாக்குச்சாவடி கண்டறியவும்', desc: 'எங்கு வாக்களிக்க வேண்டும்' },
    { id: 4, title: 'வாக்களிக்கவும்', desc: 'உங்கள் குரலை கேட்கச் செய்யுங்கள்!' },
  ];
  if (lang === 'Chinese') return [
    { id: 1, title: '检查资格', desc: '年龄，公民身份要求' },
    { id: 2, title: '登记投票', desc: '提交您的详细信息' },
    { id: 3, title: '查找投票站', desc: '找到投票地点' },
    { id: 4, title: '投出您的选票', desc: '让世界听到您的声音！' },
  ];
  return [
    { id: 1, title: 'Check Eligibility', desc: 'Age, citizenship requirements' },
    { id: 2, title: 'Register to Vote', desc: 'Submit your details' },
    { id: 3, title: 'Find Polling Station', desc: 'Locate where to vote' },
    { id: 4, title: 'Cast Your Vote', desc: 'Make your voice heard!' },
  ];
};

export default function SidebarLeft() {
  const { country, language } = useAppStore();
  const steps = getSteps(language);

  // Eligibility quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean | null>>({
    age: null, citizen: null, resident: null, id: null,
  });
  const [quizDone, setQuizDone] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const eligible = quizDone && Object.values(quizAnswers).every(v => v === true);
  const ineligible = quizDone && Object.values(quizAnswers).some(v => v === false);

  // Calculate progress from quiz results
  const completedSteps = useMemo(() => {
    if (!quizDone) return 0;
    if (ineligible) return 0;
    // Step 1 (eligibility) always done if eligible
    return 1;
  }, [quizDone, ineligible]);

  const progress = (completedSteps / steps.length) * 100;

  const answerQuestion = (answer: boolean) => {
    const qId = QUESTIONS[currentQ].id;
    const updated = { ...quizAnswers, [qId]: answer };
    setQuizAnswers(updated);

    if (!answer) {
      // Failed — mark quiz done immediately
      setQuizDone(true);
    } else if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setQuizDone(true);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({ age: null, citizen: null, resident: null, id: null });
    setQuizDone(false);
    setCurrentQ(0);
  };

  // Next election alert
  const nextElection = useMemo(() => {
    const today = new Date();
    return electionEvents
      .filter(e => e.country === country && new Date(e.date) >= today && e.type === 'election')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;
  }, [country]);

  const alertInfo = useMemo(() => {
    if (!nextElection) return null;
    const electionDate = new Date(nextElection.date);
    const today = new Date();
    const daysUntilElection = Math.ceil((electionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const deadlineDate = new Date(electionDate);
    deadlineDate.setDate(deadlineDate.getDate() - 30);
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return {
      electionTitle: nextElection.title,
      electionDate: electionDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      deadlineDate: deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      daysUntilElection, daysUntilDeadline,
      isUrgent: daysUntilDeadline <= 30,
    };
  }, [nextElection]);

  const REGISTER_URLS: Record<string, string> = {
    India: 'https://voters.eci.gov.in/', USA: 'https://vote.gov', UK: 'https://www.gov.uk/register-to-vote',
    Australia: 'https://www.aec.gov.au/enrol/', Canada: 'https://ereg.elections.ca/CWelcome.aspx',
    France: 'https://www.service-public.fr/particuliers/vosdroits/F1961', Germany: 'https://www.bundeswahlleiterin.de/',
    Japan: 'https://www.soumu.go.jp/senkyo/', Brazil: 'https://www.tse.jus.br/eleitor/cadastro-eleitoral',
    'South Africa': 'https://www.elections.org.za/', Pakistan: 'https://www.nadra.gov.pk/',
    Bangladesh: 'https://www.ecs.gov.bd/', 'Sri Lanka': 'https://www.elections.gov.lk/',
  };
  const registerUrl = REGISTER_URLS[country] || `https://www.google.com/search?q=voter+registration+${country}`;

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col">
      <div className="mb-5">
        <h3 className="font-bold text-lg text-foreground mb-0.5">
          {language === 'Hindi' ? 'मतदान यात्रा' : language === 'Chinese' ? '投票之旅' : 'Voting Journey'}
        </h3>
        <p className="text-xs text-muted-foreground">
          {language === 'Hindi' ? `${country} के लिए मार्गदर्शिका` : `Step-by-step guide for ${country}`}
        </p>
      </div>

      {/* ── ELIGIBILITY QUIZ ── */}
      <AnimatePresence mode="wait">
        {!quizDone ? (
          <motion.div key="quiz" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-5 bg-primary/5 border border-primary/15 rounded-2xl p-4">
            <p className="text-[10px] text-primary font-semibold uppercase tracking-wide mb-3">
              Eligibility Check · Q{currentQ + 1}/{QUESTIONS.length}
            </p>
            {/* Progress dots */}
            <div className="flex space-x-1 mb-3">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                  i < currentQ ? 'bg-primary' : i === currentQ ? 'bg-primary/60' : 'bg-white/10'
                }`} />
              ))}
            </div>
            <p className="text-sm font-medium text-foreground mb-4 leading-snug">
              {QUESTIONS[currentQ].label(country)}
            </p>
            <div className="flex space-x-2">
              <button onClick={() => answerQuestion(true)}
                className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all">
                ✅ Yes
              </button>
              <button onClick={() => answerQuestion(false)}
                className="flex-1 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-foreground text-xs font-semibold hover:bg-white/[0.1] transition-all">
                ❌ No
              </button>
            </div>
          </motion.div>
        ) : eligible ? (
          <motion.div key="eligible" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-400">✅ You are eligible to vote!</p>
                <p className="text-[10px] text-emerald-400/70 mt-0.5">in {country}</p>
              </div>
              <button onClick={resetQuiz} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/[0.06]">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="ineligible" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-red-400">❌ Not yet eligible</p>
              <button onClick={resetQuiz} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/[0.06]">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-red-400/70 leading-relaxed">
              You answered "No" to one of the eligibility questions. Requirements in {country}: age {ELIGIBILITY_RULES[country]?.age || 18}+, {ELIGIBILITY_RULES[country]?.citizenship || 'citizenship'}, and valid ID.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar — only show after quiz */}
      {quizDone && eligible && (
        <div className="mb-5">
          <div className="flex justify-between text-xs font-medium mb-2">
            <span className="text-foreground">Progress</span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full" />
          </div>
        </div>
      )}

      {/* Steps — only show after eligible */}
      {quizDone && eligible && (
        <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {steps.map((step, idx) => {
            const status = idx === 0 ? 'completed' : idx === 1 ? 'current' : 'upcoming';
            return (
              <div key={step.id} className="relative">
                {idx !== steps.length - 1 && (
                  <div className={`absolute left-3 top-7 bottom-[-16px] w-[2px] ${status === 'completed' ? 'bg-primary' : 'bg-white/[0.06]'}`} />
                )}
                <div className="flex items-start space-x-3">
                  <div className="relative z-10 mt-0.5 bg-background shrink-0">
                    {status === 'completed' ? <CheckCircle2 className="w-6 h-6 text-primary" />
                      : status === 'current' ? (
                        <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        </div>
                      ) : <Circle className="w-6 h-6 text-white/20" />}
                  </div>
                  <div className={`flex-1 ${status === 'upcoming' ? 'opacity-40' : ''}`}>
                    <h4 className={`font-semibold text-sm ${status === 'current' ? 'text-primary' : 'text-foreground'}`}>{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    {status === 'current' && (
                      <button onClick={() => window.open(registerUrl, '_blank')}
                        className="mt-2 text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-1">
                        <span>{language === 'Hindi' ? 'अभी रजिस्टर करें' : language === 'Chinese' ? '现在注册' : 'Register Now'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* If quiz not done yet, show placeholder */}
      {!quizDone && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground/40 pb-4">
          <ChevronRight className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">Answer the questions above to see your voting journey</p>
        </div>
      )}

      {/* Dynamic Alert */}
      {alertInfo && (
        <motion.div key={country} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={`mt-4 rounded-xl p-3.5 flex items-start space-x-3 border ${alertInfo.isUrgent ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${alertInfo.isUrgent ? 'text-red-500' : 'text-amber-500'}`} />
          <div className="flex-1 min-w-0">
            <h5 className={`text-xs font-bold truncate ${alertInfo.isUrgent ? 'text-red-500' : 'text-amber-500'}`}>{alertInfo.electionTitle}</h5>
            <p className={`text-[10px] mt-0.5 ${alertInfo.isUrgent ? 'text-red-500/80' : 'text-amber-500/80'}`}>
              📅 {alertInfo.electionDate} · {alertInfo.daysUntilElection}d away
            </p>
            <p className={`text-[10px] mt-0.5 ${alertInfo.isUrgent ? 'text-red-500/80' : 'text-amber-500/80'}`}>
              ⏰ Deadline: {alertInfo.deadlineDate}
            </p>
            <button onClick={() => window.open(registerUrl, '_blank')}
              className={`mt-1.5 text-[10px] flex items-center space-x-1 font-semibold hover:underline ${alertInfo.isUrgent ? 'text-red-400' : 'text-amber-500'}`}>
              <ExternalLink className="w-3 h-3" />
              <span>Register to vote →</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
