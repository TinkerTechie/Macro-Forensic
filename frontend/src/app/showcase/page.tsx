'use client';

import React from 'react';
import NotebookLayout from '@/components/showcase/NotebookLayout';
import SystemHealth from '@/components/showcase/SystemHealth';
import LivingGraph from '@/components/graph/LivingGraph';
import DualMemoryExplorer from '@/components/showcase/DualMemoryExplorer';
import EvidenceGraph from '@/components/graph/EvidenceGraph';
import LivePipeline from '@/components/agents/LivePipeline';
import MultiAgentChat from '@/components/agents/MultiAgentChat';
import ExplainabilityReplay from '@/components/showcase/ExplainabilityReplay';
import InteractiveConfidence from '@/components/showcase/InteractiveConfidence';
import ConfidenceHeatmap from '@/components/showcase/ConfidenceHeatmap';
import AnimatedDashboard from '@/components/showcase/AnimatedDashboard';
import TimeTravel from '@/components/showcase/TimeTravel';
import WhatChangedMyMind from '@/components/showcase/WhatChangedMyMind';
import ArchitectureExplorer from '@/components/showcase/ArchitectureExplorer';
import { useInvestigationStream } from '@/hooks/useInvestigationStream';
import { Play } from 'lucide-react';

export default function ShowcasePage() {
  const { events, isStreaming, activeAgent, startStream } = useInvestigationStream();

  const handleStart = () => {
    startStream("How does inflation impact Tesla's supply chain based on the 10-K filing?");
  };

  const claimPane = (
    <div className="space-y-4">
      <ConfidenceHeatmap />
      <AnimatedDashboard />
      <TimeTravel />
      <EvidenceGraph />
    </div>
  );

  const evidencePane = (
    <div className="flex flex-col w-full relative space-y-4">
      <div className="h-[350px]">
        <LivingGraph />
      </div>
      <div className="h-[250px]">
        <DualMemoryExplorer />
      </div>
      <div className="h-[350px]">
        <ArchitectureExplorer />
      </div>
    </div>
  );

  const reasoningPane = (
    <div className="flex flex-col h-full space-y-4 relative">
      <div className="flex justify-end">
        <button 
          onClick={handleStart}
          disabled={isStreaming}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>{isStreaming ? 'Analyzing...' : 'Run Investigation'}</span>
        </button>
      </div>
      <InteractiveConfidence />
      <WhatChangedMyMind />
      <LivePipeline activeAgent={activeAgent} />
      <div className="flex-1 min-h-[150px] flex flex-col">
        <MultiAgentChat events={events} isStreaming={isStreaming} />
      </div>
      <ExplainabilityReplay />
    </div>
  );

  return (
    <main className="relative min-h-screen bg-black">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <SystemHealth />
      <NotebookLayout 
        claimPane={claimPane} 
        evidencePane={evidencePane} 
        reasoningPane={reasoningPane} 
      />
    </main>
  );
}
