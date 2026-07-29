'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe2 } from 'lucide-react';

const macroData = {
  US: [
    { year: '2021', gdp: 2.1, inf: 4.7 },
    { year: '2022', gdp: 1.9, inf: 8.0 },
    { year: '2023', gdp: 2.5, inf: 4.1 },
    { year: '2024', gdp: 2.8, inf: 3.2 }
  ],
  China: [
    { year: '2021', gdp: 8.1, inf: 0.9 },
    { year: '2022', gdp: 3.0, inf: 2.0 },
    { year: '2023', gdp: 5.2, inf: 0.2 },
    { year: '2024', gdp: 4.8, inf: 0.5 }
  ],
  India: [
    { year: '2021', gdp: 8.7, inf: 5.1 },
    { year: '2022', gdp: 7.0, inf: 6.7 },
    { year: '2023', gdp: 7.6, inf: 5.7 },
    { year: '2024', gdp: 6.8, inf: 4.8 }
  ]
};

export default function AnimatedDashboard() {
  const [region, setRegion] = useState<'US' | 'China' | 'India'>('US');

  return (
    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 shadow-xl mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Macro Dashboard</h3>
        </div>
        <div className="flex space-x-2">
          {['US', 'China', 'India'].map(r => (
            <button
              key={r}
              onClick={() => setRegion(r as any)}
              className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold tracking-wider transition-colors ${
                region === r ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[150px] w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={region}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={macroData[region]}>
                <XAxis dataKey="year" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="gdp" name="GDP Growth (%)" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                <Line type="monotone" dataKey="inf" name="Inflation (%)" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
