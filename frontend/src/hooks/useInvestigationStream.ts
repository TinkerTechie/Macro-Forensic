'use client';

import { useState, useCallback } from 'react';

export type AgentEvent = {
  event: string;
  agent: string;
  content: string;
  confidence?: number;
  final_answer?: string;
};

export function useInvestigationStream() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const startStream = useCallback(async (query: string) => {
    setEvents([]);
    setIsStreaming(true);
    setActiveAgent('supervisor');
    
    try {
      const response = await fetch('http://localhost:8000/api/investigate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || ''; // keep the last partial chunk

        for (const chunk of chunks) {
          if (!chunk.trim()) continue;
          
          try {
            const data = JSON.parse(chunk);
            setEvents(prev => [...prev, data]);
            setActiveAgent(data.agent);
          } catch (e) {
            console.error('Failed to parse chunk:', chunk);
          }
        }
      }
    } catch (e) {
      console.error('Stream error:', e);
    } finally {
      setIsStreaming(false);
      setActiveAgent(null);
    }
  }, []);

  return { events, isStreaming, activeAgent, startStream };
}
