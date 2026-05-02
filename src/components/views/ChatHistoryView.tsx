"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Trash2, Plus, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getAllConversations, deleteConversation, Conversation } from '@/lib/firestore';

export default function ChatHistoryView() {
  const { setActiveConversationId, setActiveNavTab, setLoadedMessages } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const convos = await getAllConversations();
      setConversations(convos);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  const handleOpen = (convo: Conversation) => {
    // Load the actual messages into the store so AIChat can display them
    setActiveConversationId(convo.id);
    setLoadedMessages(convo.messages || []);
    setActiveNavTab('home');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setLoadedMessages([]);
    setActiveNavTab('home');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group by date
  const today = conversations.filter(c => {
    if (!c.updatedAt) return false;
    const d = (c.updatedAt as any).toDate ? (c.updatedAt as any).toDate() : new Date();
    return new Date().toDateString() === d.toDateString();
  });
  const older = conversations.filter(c => !today.includes(c));

  return (
    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chat History</h1>
          <p className="text-sm text-muted-foreground mt-1">All your past conversations with VoteWise AI</p>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading conversations...</p>
          </div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
          <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">No conversations yet</p>
          <p className="text-sm mt-1 mb-6">Start chatting with VoteWise AI to see your history here</p>
          <button
            onClick={handleNewChat}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium hover:bg-primary/90 transition-all"
          >
            Start Your First Chat
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {today.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Today</span>
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {today.map(convo => (
                    <ConversationCard
                      key={convo.id}
                      convo={convo}
                      onOpen={handleOpen}
                      onDelete={handleDelete}
                      formatDate={formatDate}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
          {older.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Previous
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {older.map(convo => (
                    <ConversationCard
                      key={convo.id}
                      convo={convo}
                      onOpen={handleOpen}
                      onDelete={handleDelete}
                      formatDate={formatDate}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConversationCard({ convo, onOpen, onDelete, formatDate }: {
  convo: Conversation;
  onOpen: (c: Conversation) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  formatDate: (t: any) => string;
}) {
  const preview = convo.messages?.find(m => m.role === 'assistant' && m.id !== '1')?.content || 'No response yet';

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => onOpen(convo)}
      className="group flex items-start space-x-4 p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-card/80 transition-all"
    >
      <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center flex-shrink-0">
        <MessageSquare className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-foreground text-sm truncate">{convo.title}</p>
          <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">{formatDate(convo.updatedAt)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 truncate">{preview}</p>
        <div className="flex items-center space-x-2 mt-1.5">
          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{convo.country}</span>
          <span className="text-[10px] text-muted-foreground">{convo.messages?.length || 0} messages</span>
        </div>
      </div>
      <button
        onClick={(e) => onDelete(e, convo.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-400 transition-all rounded-lg hover:bg-red-500/10"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
