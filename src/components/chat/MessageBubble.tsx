import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, BookMarked, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/lib/firestore';

interface MessageBubbleProps {
  msg: Message;
  mode: 'chat' | 'story';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, mode }) => {
  const isUser = msg.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10'
          : mode === 'story'
          ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/25'
          : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/25'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-white/80" />
          : mode === 'story'
          ? <BookMarked className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-white" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] text-muted-foreground mb-1 px-1 font-medium">
          {isUser ? 'You' : mode === 'story' ? 'Storyteller 📖' : 'VoteWise AI'}
        </span>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary/20 text-foreground border border-primary/20 rounded-tr-sm whitespace-pre-wrap'
            : mode === 'story'
            ? 'bg-amber-500/10 text-foreground border border-amber-500/15 rounded-tl-sm'
            : 'bg-white/[0.05] text-foreground border border-white/[0.08] rounded-tl-sm'
        }`}>
          {isUser ? (
            msg.content
          ) : (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-emerald-400" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="marker:text-emerald-500/50" {...props} />,
                a: ({node, ...props}) => <a className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                h3: ({node, ...props}) => <h3 className="font-bold text-base mt-3 mb-1 text-white" {...props} />,
                h4: ({node, ...props}) => <h4 className="font-bold text-sm mt-2 mb-1 text-white" {...props} />,
              }}
            >
              {msg.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Action Buttons (Registration) */}
        {!isUser && msg.registrationUrl && (
          <div className="mt-2 w-full">
            <a href={msg.registrationUrl.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{msg.registrationUrl.label}</span>
            </a>
          </div>
        )}

        {/* Story illustration / Attached Image */}
        {msg.imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 w-full rounded-xl overflow-hidden border border-amber-500/20 shadow-lg shadow-amber-500/10"
          >
            <div className="relative">
              <img
                src={msg.imageUrl}
                alt="Illustration"
                className="w-full h-auto max-h-52 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-3 py-2">
                <span className="text-[10px] text-white/70 font-medium">🎨 Visual Reference</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
