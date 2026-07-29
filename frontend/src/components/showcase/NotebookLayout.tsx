'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface NotebookLayoutProps {
  claimPane: React.ReactNode;
  evidencePane: React.ReactNode;
  reasoningPane: React.ReactNode;
}

export default function NotebookLayout({ claimPane, evidencePane, reasoningPane }: NotebookLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-black text-slate-200 overflow-hidden pt-16 pb-20">
      <div className="grid grid-cols-12 gap-4 w-full max-w-[1600px] mx-auto p-4 h-full">
        
        {/* Left Pane: Claim (25%) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="col-span-3 flex flex-col h-full bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          <div className="p-4 border-b border-white/5 bg-black/40">
            <h2 className="text-sm font-semibold tracking-widest text-slate-400 uppercase">1. The Claim</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {claimPane}
          </div>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
        </motion.div>

        {/* Middle Pane: Evidence (40%) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-span-5 flex flex-col h-full bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
            <h2 className="text-sm font-semibold tracking-widest text-slate-400 uppercase">2. Evidence Landscape</h2>
            <div className="flex space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-10">
            {evidencePane}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        </motion.div>

        {/* Right Pane: Reasoning (35%) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="col-span-4 flex flex-col h-full bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          <div className="p-4 border-b border-white/5 bg-black/40">
            <h2 className="text-sm font-semibold tracking-widest text-slate-400 uppercase">3. AI Reasoning</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {reasoningPane}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none" />
        </motion.div>

      </div>
    </div>
  );
}
