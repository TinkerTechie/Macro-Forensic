'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Share2, AlignLeft, Hexagon } from 'lucide-react';

export default function DualMemoryExplorer() {
  const [activeChunk, setActiveChunk] = useState<number>(0);

  const chunks = [
    { id: 123, sim: 0.94, text: "Tesla is constructing a new lithium refinery in Texas to secure supply chain and reduce costs." },
    { id: 145, sim: 0.89, text: "Global lithium prices have surged 15% due to bottlenecked supplier capacity in South America." },
    { id: 189, sim: 0.81, text: "Macroeconomic inflation has led to increased borrowing costs for manufacturing expansion." }
  ];

  return (
    <div className="flex space-x-4 p-4 h-full bg-black/40 rounded-xl border border-white/5 mt-4">
      
      {/* Vector Memory Pane */}
      <div className="flex-1 border-r border-white/10 pr-4">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold tracking-widest text-slate-300 uppercase">Vector Memory</h3>
        </div>
        
        <div className="space-y-3">
          {chunks.map((chunk, idx) => (
            <motion.div 
              key={chunk.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveChunk(idx)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                activeChunk === idx 
                  ? 'border-emerald-500/50 bg-emerald-500/10' 
                  : 'border-white/5 bg-black/40 hover:bg-white/5'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500 font-mono">Chunk #{chunk.id}</span>
                <span className="text-xs font-semibold text-emerald-400">Sim: {chunk.sim}</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">"{chunk.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Graph Memory Pane */}
      <div className="flex-1 pl-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-4">
          <Share2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold tracking-widest text-slate-300 uppercase">Knowledge Graph</h3>
        </div>
        
        <div className="flex-1 flex flex-col justify-center items-center relative py-8">
          <motion.div 
            key={activeChunk}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center w-full"
          >
            {activeChunk === 0 && (
              <>
                <div className="px-3 py-1.5 border border-indigo-500/50 bg-indigo-500/10 rounded-md text-xs font-semibold text-indigo-300">Tesla (ORG)</div>
                <div className="h-6 border-l-2 border-dashed border-slate-600 my-1" />
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">BUILDS</div>
                <div className="h-6 border-l-2 border-dashed border-slate-600 my-1" />
                <div className="px-3 py-1.5 border border-amber-500/50 bg-amber-500/10 rounded-md text-xs font-semibold text-amber-300">Lithium Refinery (FAC)</div>
                <div className="h-6 border-l-2 border-dashed border-slate-600 my-1" />
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">LOCATED_IN</div>
                <div className="h-6 border-l-2 border-dashed border-slate-600 my-1" />
                <div className="px-3 py-1.5 border border-rose-500/50 bg-rose-500/10 rounded-md text-xs font-semibold text-rose-300">Texas (GPE)</div>
              </>
            )}
            
            {activeChunk === 1 && (
              <>
                <div className="px-3 py-1.5 border border-amber-500/50 bg-amber-500/10 rounded-md text-xs font-semibold text-amber-300">Lithium Prices (METRIC)</div>
                <div className="h-6 border-l-2 border-dashed border-slate-600 my-1" />
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">AFFECTED_BY</div>
                <div className="h-6 border-l-2 border-dashed border-slate-600 my-1" />
                <div className="px-3 py-1.5 border border-rose-500/50 bg-rose-500/10 rounded-md text-xs font-semibold text-rose-300">Supplier Capacity (EVENT)</div>
              </>
            )}

            {activeChunk === 2 && (
              <>
                <div className="px-3 py-1.5 border border-rose-500/50 bg-rose-500/10 rounded-md text-xs font-semibold text-rose-300">Inflation (MACRO)</div>
                <div className="h-6 border-l-2 border-dashed border-slate-600 my-1" />
                <div className="text-[10px] text-slate-500 uppercase tracking-widest">CAUSES_INCREASE</div>
                <div className="h-6 border-l-2 border-dashed border-slate-600 my-1" />
                <div className="px-3 py-1.5 border border-amber-500/50 bg-amber-500/10 rounded-md text-xs font-semibold text-amber-300">Borrowing Costs (METRIC)</div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
