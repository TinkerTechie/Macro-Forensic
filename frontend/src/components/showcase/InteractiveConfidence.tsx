'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveConfidence() {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const metrics = [
    { id: 'strength', label: 'Evidence Strength', score: 91, color: 'bg-emerald-500', reason: 'High similarity across 3 primary SEC filings.' },
    { id: 'support', label: 'Supporting Sources', score: 80, color: 'bg-cyan-500', reason: 'Supported by World Bank and OECD macroeconomic reports.' },
    { id: 'contradict', label: 'Contradictions', score: 20, color: 'bg-rose-500', reason: 'Minor CPI index deviation suggests potential timeline delays.' }
  ];

  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 shadow-xl mt-4">
      <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Confidence Breakdown</h3>
      
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div 
            key={metric.id}
            className="relative"
            onMouseEnter={() => setHoveredMetric(metric.id)}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">{metric.label}</span>
              <span className="text-slate-400 font-mono">{metric.score}%</span>
            </div>
            
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${metric.score}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${metric.color}`}
              />
            </div>

            <AnimatePresence>
              {hoveredMetric === metric.id && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute z-20 top-8 left-0 w-full p-2 bg-zinc-800 border border-white/10 rounded shadow-2xl text-[10px] text-slate-300"
                >
                  {metric.reason}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
