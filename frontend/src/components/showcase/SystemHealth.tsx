'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Network, Clock, ShieldCheck } from 'lucide-react';

export default function SystemHealth() {
  const [metrics, setMetrics] = useState({
    gpu: 42,
    latency: 124,
    docs: 1240,
    traversals: 85,
    tokens: 4520,
  });

  // Simulate live metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        gpu: Math.max(10, Math.min(95, prev.gpu + (Math.random() * 10 - 5))),
        latency: Math.max(50, prev.latency + (Math.random() * 20 - 10)),
        docs: prev.docs + Math.floor(Math.random() * 2),
        traversals: prev.traversals + Math.floor(Math.random() * 3),
        tokens: prev.tokens + Math.floor(Math.random() * 50),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const MetricItem = ({ icon: Icon, label, value, unit, color = "text-emerald-400" }: any) => (
    <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-md border border-white/5 backdrop-blur-sm">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-slate-400">{label}:</span>
      <span className="text-sm font-mono font-medium text-slate-200">
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
        <span className="text-xs text-slate-500 ml-1">{unit}</span>
      </span>
    </div>
  );

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 bg-zinc-900/80 backdrop-blur-md border border-white/10 p-2 rounded-xl shadow-2xl"
    >
      <div className="flex items-center px-3 border-r border-white/10">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-2 h-2 rounded-full bg-emerald-500 mr-2"
        />
        <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">System Live</span>
      </div>
      
      <MetricItem icon={Cpu} label="GPU" value={metrics.gpu} unit="%" color="text-purple-400" />
      <MetricItem icon={Clock} label="Latency" value={metrics.latency} unit="ms" color="text-amber-400" />
      <MetricItem icon={Database} label="Vectors" value={metrics.docs} unit="docs" color="text-blue-400" />
      <MetricItem icon={Network} label="Graph" value={metrics.traversals} unit="paths" color="text-pink-400" />
      <MetricItem icon={Activity} label="LLM" value={metrics.tokens} unit="toks" color="text-cyan-400" />
    </motion.div>
  );
}
