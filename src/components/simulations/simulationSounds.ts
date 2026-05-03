/**
 * Shared sound utilities for voting simulations.
 * All sounds are generated programmatically using the Web Audio API.
 * No external audio files needed.
 */

const getAudioContext = async (): Promise<AudioContext | null> => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
};

/** India EVM: Two short sharp electronic beeps */
export const playEVMBeep = async () => {
  const ctx = await getAudioContext();
  if (!ctx) return;
  const playTone = (start: number, dur: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, start);
    gain.gain.setValueAtTime(0.8, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(start); osc.stop(start + dur);
  };
  playTone(ctx.currentTime, 0.18);
  playTone(ctx.currentTime + 0.25, 0.18);
};

/** Australia: Soft pencil scratch (white noise burst) when ranking */
export const playPencilScratch = async () => {
  const ctx = await getAudioContext();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3000, ctx.currentTime);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  source.buffer = buffer;
  source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  source.start();
};

/** USA/UK Paper Ballot: Deep stamp thud when marking X */
export const playStampThud = async () => {
  const ctx = await getAudioContext();
  if (!ctx) return;
  // Low thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.9, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.2);
};

/** France: Paper rustle sound when picking a ballot slip */
export const playPaperRustle = async () => {
  const ctx = await getAudioContext();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const envelope = Math.sin((i / bufferSize) * Math.PI);
    data[i] = (Math.random() * 2 - 1) * envelope * 0.25;
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1500, ctx.currentTime);
  source.buffer = buffer;
  source.connect(filter); filter.connect(ctx.destination);
  source.start();
};
