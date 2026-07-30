'use client';

import { useEffect, useState } from 'react';

export function StatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="fixed bottom-0 left-[220px] right-0 z-30 flex h-7 items-center justify-between border-t border-[#1F1F23] bg-[#09090B]/90 backdrop-blur-sm px-5">
      <div className="flex items-center gap-4 text-[10px] text-[#3F3F46]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400/70">MacroForensic</span>
        </span>
        <span>FastAPI · LangGraph · Groq Llama-3.3-70b · Neo4j · Qdrant</span>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-[#3F3F46]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          All systems operational
        </span>
        <span className="font-mono">{time}</span>
      </div>
    </footer>
  );
}
