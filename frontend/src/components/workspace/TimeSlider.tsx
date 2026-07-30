'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimeSliderProps {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number | null) => void;
}

export function TimeSlider({ years, selectedYear, onChange }: TimeSliderProps) {
  if (!years.length) return null;

  const sortedYears = [...years].sort((a, b) => a - b);
  const minYear = sortedYears[0];
  const maxYear = sortedYears[sortedYears.length - 1];

  return (
    <div className="flex items-center gap-4 bg-[#111113] border border-[#1F1F23] rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-[#71717A]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
          Time Machine
        </span>
      </div>

      <div className="flex-1 relative h-8 flex items-center">
        {/* Track */}
        <div className="absolute inset-0 h-1 bg-[#1F1F23] rounded-full top-1/2 -translate-y-1/2" />

        {/* Year Markers */}
        <div className="absolute inset-0 flex justify-between items-center pointer-events-none">
          {sortedYears.map((year, i) => (
            <div key={year} className="relative flex flex-col items-center">
              <div className={`h-2.5 w-2.5 rounded-full z-10 transition-colors ${selectedYear === year ? 'bg-[#3B82F6]' : 'bg-[#3F3F46]'
                }`} />
              <span className={`absolute top-4 text-[10px] font-mono transition-colors ${selectedYear === year ? 'text-[#FAFAFA]' : 'text-[#71717A]'
                }`}>
                {year}
              </span>
            </div>
          ))}
        </div>

        {/* Invisible Input for scrubbing */}
        <input
          type="range"
          min={0}
          max={sortedYears.length - 1}
          step={1}
          value={selectedYear ? sortedYears.indexOf(selectedYear) : sortedYears.length - 1}
          onChange={(e) => onChange(sortedYears[parseInt(e.target.value)] ?? null)}
          className="w-full absolute opacity-0 cursor-pointer z-20 h-full"
        />
      </div>

      <button
        onClick={() => onChange(null)}
        className="ml-2 px-2 py-1 text-[10px] bg-[#1F1F23] text-[#A1A1AA] rounded hover:bg-[#27272A]"
      >
        Reset
      </button>
    </div>
  );
}
