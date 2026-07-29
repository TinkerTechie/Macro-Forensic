'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { AgentEvent } from '@/hooks/useInvestigationStream';

const agentStyles: Record<string, any> = {
  supervisor: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', name: 'Supervisor' },
  retriever_agent: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', name: 'Retriever' },
  graph_agent: { color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20', name: 'Graph Explorer' },
  analyst: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', name: 'Analyst' },
  risk_agent: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', name: 'Critic' },
  report_agent: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', name: 'Validator' }
};

export default function MultiAgentChat({ events, isStreaming }: { events: AgentEvent[], isStreaming: boolean }) {
  return (
    <div className="flex-1 flex flex-col space-y-3 bg-black/40 border border-white/5 rounded-xl p-4 overflow-y-auto custom-scrollbar">
      <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-2">Agent Consensus Protocol</h3>
      
      <AnimatePresence>
        {events.map((evt, idx) => {
          const style = agentStyles[evt.agent] || agentStyles.analyst;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`p-3 rounded-lg border ${style.bg} ${style.border} flex flex-col`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${style.color}`}>
                  {style.name}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{evt.content}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {isStreaming && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="flex space-x-1 p-3"
        >
          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </motion.div>
      )}
    </div>
  );
}
