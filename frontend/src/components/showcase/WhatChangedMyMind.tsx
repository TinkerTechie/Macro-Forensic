'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lightbulb } from 'lucide-react';

export default function WhatChangedMyMind() {
  const shifts = [
    { text: 'Initial Claim (95%)', type: 'base' },
    { text: 'New CPI Report', type: 'trigger' },
    { text: 'Inflation Increased', type: 'impact' },
    { text: 'Original Claim No Longer Supported (68%)', type: 'result' },
  ];

  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 shadow-xl mb-4">
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">What Changed My Mind?</h3>
      </div>
      
      <div className="space-y-3 relative">
        {shifts.map((shift, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.4 }}
            className={`flex items-center space-x-3 ${idx === shifts.length - 1 ? 'mt-4' : ''}`}
          >
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              shift.type === 'base' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' :
              shift.type === 'trigger' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
              shift.type === 'impact' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
              'bg-slate-700/50 border-slate-600 text-slate-200'
            }`}>
              {shift.text}
            </div>
            {idx < shifts.length - 1 && (
              <ArrowRight className="w-3 h-3 text-slate-600" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
