'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

const stages = [
  { id: 1, time: '09:31', label: 'Parsed PDF' },
  { id: 2, time: '09:32', label: 'Extracted Claim' },
  { id: 3, time: '09:33', label: 'Retrieved 8 Documents' },
  { id: 4, time: '09:34', label: 'Graph Traversal' },
  { id: 5, time: '09:35', label: 'Final Validation' }
];

export default function ExplainabilityReplay() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return p + 2; // increments of 2%
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const currentStageIndex = Math.min(
    Math.floor((progress / 100) * stages.length),
    stages.length - 1
  );

  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 shadow-xl mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Explainability Replay</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleReset}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar (Scrubber) */}
      <div className="relative h-2 bg-white/10 rounded-full mb-6 cursor-pointer">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Timeline Stages */}
      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const isActive = idx === currentStageIndex;
          const isPast = idx < currentStageIndex;
          
          return (
            <div key={stage.id} className="flex items-center space-x-4">
              <div className="w-12 text-xs font-mono text-slate-500">{stage.time}</div>
              <div className="relative flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  isActive ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] scale-125' :
                  isPast ? 'bg-cyan-600/50' : 'bg-slate-700'
                }`} />
                {idx !== stages.length - 1 && (
                  <div className={`absolute top-3 w-0.5 h-6 transition-colors duration-300 ${
                    isPast ? 'bg-cyan-600/50' : 'bg-slate-700'
                  }`} />
                )}
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                isActive ? 'text-white font-semibold' :
                isPast ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {stage.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
