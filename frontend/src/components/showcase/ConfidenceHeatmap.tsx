'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function ConfidenceHeatmap() {
  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 shadow-xl mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Document Heatmap</h3>
        </div>
        <div className="flex space-x-2 text-[10px] uppercase font-bold tracking-wider">
          <span className="text-emerald-400">Supported</span>
          <span className="text-amber-400">Uncertain</span>
          <span className="text-rose-400">Contradicted</span>
        </div>
      </div>
      
      <div className="p-4 bg-white/5 rounded-lg border border-white/10 leading-loose text-slate-300 font-serif text-sm">
        <motion.span 
          initial={{ backgroundColor: 'transparent' }}
          animate={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
          transition={{ duration: 1, delay: 0.5 }}
          className="rounded px-1 text-emerald-100"
        >
          "Despite macroeconomic headwinds,
        </motion.span>
        {' '}
        we anticipate{' '}
        <motion.span 
          initial={{ backgroundColor: 'transparent' }}
          animate={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}
          transition={{ duration: 1, delay: 1 }}
          className="rounded px-1 text-amber-100"
        >
          battery production costs to decrease by 15%
        </motion.span>
        {' '}due to our{' '}
        <motion.span 
          initial={{ backgroundColor: 'transparent' }}
          animate={{ backgroundColor: 'rgba(244, 63, 94, 0.2)' }}
          transition={{ duration: 1, delay: 1.5 }}
          className="rounded px-1 text-rose-100"
        >
          new vertically integrated lithium refinery
        </motion.span>
        {' '}in Texas."
      </div>
    </div>
  );
}
