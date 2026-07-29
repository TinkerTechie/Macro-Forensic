export function StatusBar() {
  const now = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <footer className="fixed bottom-0 left-[220px] right-0 z-30 flex h-7 items-center justify-between border-t border-[#1F1F23] bg-[#09090B] px-5">
      <div className="flex items-center gap-4 text-[10px] text-[#3F3F46]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
          All systems operational
        </span>
        <span>FastAPI v0.115 · LangGraph v1.2 · Groq Llama-3.3-70b</span>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-[#3F3F46]">
        <span>MFAS v1.0.0</span>
        <span>{now}</span>
      </div>
    </footer>
  );
}
