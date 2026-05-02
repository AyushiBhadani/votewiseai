import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Paperclip, Send, X } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: (text?: string) => void;
  isTyping: boolean;
  isListening: boolean;
  startListening: () => void;
  language: string;
  country: string;
  mode: 'chat' | 'story';
  fileInputRef: React.RefObject<HTMLInputElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  selectedFile: { file: File; base64: string; preview: string } | null;
  setSelectedFile: (file: any) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input, setInput, handleSend, isTyping, isListening, startListening,
  language, country, mode, fileInputRef, inputRef, selectedFile, setSelectedFile, handleFileChange
}) => {
  return (
    <div className="px-4 pb-4 pt-3 border-t border-white/[0.06] bg-white/[0.01] flex-shrink-0">
      
      {/* File Preview Banner */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex items-center space-x-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 mb-3 overflow-hidden">
            {selectedFile.preview ? (
              <img src={selectedFile.preview} alt="preview" className="w-8 h-8 rounded object-cover border border-white/10" />
            ) : (
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/30">DOC</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{selectedFile.file.name}</p>
              <p className="text-[10px] text-muted-foreground">{(selectedFile.file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className={`flex items-center space-x-2 bg-white/[0.04] border rounded-2xl px-2 py-2 focus-within:shadow-lg transition-all ${
          mode === 'story'
            ? 'border-amber-500/20 focus-within:border-amber-500/40 focus-within:shadow-amber-500/10'
            : 'border-white/[0.10] focus-within:border-primary/40 focus-within:shadow-primary/10'
        }`}>

        <button type="button" onClick={startListening}
          className={`flex-shrink-0 p-2.5 rounded-xl transition-all ${
            isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
          }`}
          title={isListening ? 'Listening...' : `Speak in ${language}`}>
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,application/pdf"
          onChange={handleFileChange} 
        />
        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          title="Attach file (Image or PDF)">
          <Paperclip className="w-4 h-4" />
        </button>

        <input ref={inputRef} type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isListening
              ? `🎤 Listening in ${language}...`
              : mode === 'story'
              ? `Ask for a story about ${country} elections...`
              : `Ask about ${country} elections...`
          }
          className="flex-1 px-2 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
        />

        <motion.button type="submit" disabled={(!input.trim() && !selectedFile) || isTyping} whileTap={{ scale: 0.92 }}
          className={`flex-shrink-0 w-9 h-9 text-white rounded-xl flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none ${
            mode === 'story'
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30 hover:shadow-amber-500/50'
              : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/30 hover:shadow-violet-500/50'
          }`}>
          <Send className="w-4 h-4" />
        </motion.button>
      </form>

      <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
        VoteWise AI speaks 16 languages · {mode === 'story' ? '📖 Story Mode active' : 'Educational purposes only'} · Verify with official sources
      </p>
    </div>
  );
};
