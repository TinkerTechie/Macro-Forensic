'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const agents = [
  { id: 'retriever', name: 'Retriever', color: 'bg-blue-400' },
  { id: 'analyst', name: 'Analyst', color: 'bg-emerald-400' },
  { id: 'critic', name: 'Critic', color: 'bg-amber-400' },
  { id: 'validator', name: 'Validator', color: 'bg-rose-400' }
];

export default function LivePipeline({ activeAgent }: { activeAgent: string | null }) {
  const activeIdx = agents.findIndex(a => a.id === activeAgent);
  const displayIdx = activeIdx === -1 ? 0 : activeIdx;

  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 mb-4 shadow-xl">
      <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Live Agent Pipeline</h3>
      
      <div className="relative flex items-center justify-between px-4">
        {/* Background track line */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-white/10" />
        
        {/* Animated active line */}
        <motion.div 
          className="absolute left-8 h-0.5 bg-gradient-to-r from-blue-500 via-emerald-500 to-rose-500 top-1/2 -translate-y-1/2"
          initial={{ width: '0%' }}
          animate={{ width: `${(displayIdx / (agents.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ maxWidth: 'calc(100% - 4rem)' }}
        />

        {agents.map((agent, idx) => (
          <div key={agent.id} className="relative z-10 flex flex-col items-center space-y-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
              idx <= displayIdx ? `border-white ${agent.color.replace('bg-', 'bg-opacity-20 text-')}` : 'border-white/20 bg-black'
            }`}>
              {idx === displayIdx && activeAgent && (
                <motion.div 
                  layoutId="activeDot"
                  className={`w-3 h-3 rounded-full ${agent.color} shadow-[0_0_10px_rgba(255,255,255,0.8)]`} 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
              {idx < displayIdx && (
                <div className={`w-2 h-2 rounded-full ${agent.color}`} />
              )}
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${idx <= displayIdx ? 'text-slate-200' : 'text-slate-600'}`}>
              {agent.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
