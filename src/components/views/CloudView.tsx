"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, FileText, Trash2, Download, RefreshCw,
  HardDrive, ShieldCheck, Info, CloudOff, MapPin
} from 'lucide-react';
import { getMyDownloads, deleteDownload, DownloadedFile } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { useAppStore } from '@/store/useAppStore';

export default function CloudView() {
  const { country } = useAppStore();
  const [downloads, setDownloads] = useState<DownloadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const files = await getMyDownloads();
      setDownloads(files);
    } catch (err) {
      console.error('getMyDownloads error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for Firebase auth to resolve, then fetch downloads
    const unsub = auth.onAuthStateChanged((user) => {
      setUid(user?.uid || null);
      if (user) {
        fetchData(); // only fetch once we have a uid
      } else {
        setLoading(false);
      }
    });

    // Also listen for download events dispatched by TopNav
    const handleNewDownload = () => fetchData();
    window.addEventListener('votewise-download', handleNewDownload);

    return () => {
      unsub();
      window.removeEventListener('votewise-download', handleNewDownload);
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDownload(id);
      setDownloads(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    const ts = timestamp as { toDate?: () => Date };
    const date = ts.toDate ? ts.toDate() : new Date(timestamp as string | number);
    const now = new Date();
    const diffH = (now.getTime() - date.getTime()) / 3600000;
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const shortUid = uid ? uid.slice(0, 8) + '...' : 'Not connected';

  return (
    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cloud & Resources</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your downloaded files and saved resources</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowInfo(p => !p)}
              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-all">
              <Info className="w-4 h-4" />
            </button>
            <button onClick={fetchData}
              className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* How access works info card */}
        <AnimatePresence>
          {showInfo && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 glass-card rounded-2xl p-5 border border-primary/20">
              <h3 className="font-bold text-foreground flex items-center space-x-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>How your data is saved (no login needed!)</span>
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <span className="text-primary font-bold shrink-0">1.</span>
                  <p>When you first open VoteWise AI, your browser is automatically given a <strong className="text-foreground">unique anonymous ID</strong> by Firebase. This happens silently — no password needed.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary font-bold shrink-0">2.</span>
                  <p>All your <strong className="text-foreground">chat conversations</strong> and <strong className="text-foreground">downloaded files</strong> are saved to the cloud linked to that ID.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-primary font-bold shrink-0">3.</span>
                  <p><strong className="text-foreground">Same device / same browser</strong> = you always see your history. Firebase remembers your anonymous ID in your browser&apos;s storage.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-amber-400 font-bold shrink-0">⚠</span>
                  <p><strong className="text-foreground">Different device or cleared browser data</strong> = new anonymous ID = fresh start. No one else can see your conversations.</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Your anonymous ID: <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[11px]">{shortUid}</code></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Downloads', value: downloads.length, icon: Download, color: 'text-primary' },
            { label: 'Storage Used', value: downloads.length > 0 ? downloads.reduce((a, f) => a + parseFloat(f.size || '0'), 0).toFixed(1) + ' KB' : '0 KB', icon: HardDrive, color: 'text-emerald-400' },
            { label: 'Your Session', value: uid ? 'Active' : 'Loading...', icon: Cloud, color: 'text-violet-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card rounded-2xl p-4 border border-white/[0.06]">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Downloads list */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h3 className="font-semibold text-foreground text-sm">Downloaded Files</h3>
            <span className="text-xs text-muted-foreground">{downloads.length} file{downloads.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center space-y-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm">Loading your files...</p>
              </div>
            </div>
          ) : downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <CloudOff className="w-14 h-14 mb-4 opacity-20" />
              <p className="font-medium text-foreground">No downloads yet</p>
              <p className="text-sm mt-1 max-w-xs">Click the <strong>&quot;Download PDF&quot;</strong> button in the top bar to save an election guide. It will appear here instantly.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              <AnimatePresence>
                {downloads.map((file) => (
                  <motion.div key={file.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="group flex items-center space-x-4 px-5 py-4 hover:bg-white/[0.03] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{file.name}</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[10px] bg-white/[0.06] px-2 py-0.5 rounded-full text-muted-foreground">{file.country}</span>
                        <span className="text-[10px] text-muted-foreground">{file.size}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(file.downloadedAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Google Maps Embed (Google Services Integration) */}
        <div className="mt-6 glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
          <div className="flex items-center px-5 py-4 border-b border-white/[0.06] bg-white/[0.01]">
            <MapPin className="w-4 h-4 text-emerald-400 mr-2" />
            <h3 className="font-semibold text-foreground text-sm">Election Authority Locator</h3>
          </div>
          <div className="p-1">
            <iframe
              title={`Election Commission ${country}`}
              width="100%"
              height="250"
              style={{ border: 0, borderRadius: '0.75rem' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`Election Commission of ${country}`)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          Files are linked to your browser session · Clear browser data to reset · No account required
        </p>
      </div>
    </div>
  );
}
