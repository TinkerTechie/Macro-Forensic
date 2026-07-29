'use client';

import React, { useState } from 'react';
import { History } from 'lucide-react';

export default function TimeTravel() {
  const [year, setYear] = useState(2026);
  
  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 shadow-xl mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Historical Context</h3>
        </div>
        <span className="text-sm font-bold text-indigo-400">{year}</span>
      </div>
      
      <div className="relative pt-1">
        <input 
          type="range" 
          min="2020" 
          max="2026" 
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
          <span>2020</span>
          <span>2022</span>
          <span>2024</span>
          <span>2026</span>
        </div>
      </div>
    </div>
  );
}
