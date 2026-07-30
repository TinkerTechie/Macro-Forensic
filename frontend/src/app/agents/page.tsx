'use client';

import { motion } from 'framer-motion';
import { Shield, GitFork, FileText, AlertTriangle, BarChart3, Clock, Zap, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AGENTS = [
  {
    name: 'Supervisor',
    icon: Shield,
    color: '#3B82F6',
    purpose: 'Orchestrates the multi-agent investigation pipeline, routes queries and aggregates outputs.',
    input: 'User forensic query string',
    output: 'Aggregated investigation result',
    status: 'idle' as const,
    latency: 210,
    tokens: 512,
    lastRun: '2 min ago',
  },
  {
    name: 'Graph Explorer',
    icon: GitFork,
    color: '#6366F1',
    purpose: 'Traverses the Neo4j knowledge graph to find entity chains, ownership paths and debt guarantees.',
    input: 'Entity names, query intent',
    output: 'GraphFinding[] with entity chains & evidence',
    status: 'idle' as const,
    latency: 890,
    tokens: 1204,
    lastRun: '2 min ago',
  },
  {
    name: 'Temporal RAG',
    icon: FileText,
    color: '#22C55E',
    purpose: 'Retrieves semantically relevant chunks from Qdrant using HuggingFace embeddings.',
    input: 'Query embedding vector',
    output: 'RetrievedChunk[] with similarity scores',
    status: 'idle' as const,
    latency: 1240,
    tokens: 3800,
    lastRun: '2 min ago',
  },
  {
    name: 'Risk Analyst',
    icon: AlertTriangle,
    color: '#F59E0B',
    purpose: 'Scores contagion exposure, assigns risk levels and generates structured risk signals.',
    input: 'Graph findings + retrieved evidence',
    output: 'RiskLevel, confidence, risk narrative',
    status: 'idle' as const,
    latency: 620,
    tokens: 1650,
    lastRun: '2 min ago',
  },
  {
    name: 'Report Generator',
    icon: BarChart3,
    color: '#8B5CF6',
    purpose: 'Synthesises the executive summary, risk narrative and citations into a final forensic report.',
    input: 'All agent outputs',
    output: 'InvestigationResult with full report',
    status: 'idle' as const,
    latency: 1800,
    tokens: 4200,
    lastRun: '2 min ago',
  },
];

const stagger: any = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } },
};

export default function AgentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#FAFAFA]">AI Agent System</h2>
        <p className="mt-1 text-sm text-[#52525B]">LangGraph multi-agent pipeline powering forensic analysis.</p>
      </div>

      {/* Pipeline flow visual */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {AGENTS.map((agent, i) => {
          const Icon = agent.icon;
          return (
            <div key={agent.name} className="flex items-center gap-2 shrink-0">
              <div
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
                style={{ borderColor: `${agent.color}30`, background: `${agent.color}08` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: agent.color }} />
                <span className="text-sm font-medium text-[#FAFAFA] whitespace-nowrap">{agent.name}</span>
              </div>
              {i < AGENTS.length - 1 && (
                <Zap className="h-3.5 w-3.5 shrink-0 text-[#3F3F46]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Agent cards */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {AGENTS.map((agent) => {
          const Icon = agent.icon;
          return (
            <motion.div key={agent.name} variants={stagger.item}>
              <Card className="group h-full hover:border-[#3B82F6]/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ background: `${agent.color}15` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: agent.color }} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#FAFAFA]">{agent.name}</h3>
                        <Badge variant="default" className="mt-0.5 text-[9px]">
                          {agent.status === 'idle' ? 'READY' : (agent.status as string).toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className="flex h-2 w-2 rounded-full"
                      style={{ background: agent.status === 'idle' ? '#22C55E' : '#F59E0B' }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs leading-relaxed text-[#71717A]">{agent.purpose}</p>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-[#1F1F23] bg-[#09090B] p-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#3F3F46] mb-1">Input</p>
                      <p className="text-xs text-[#A1A1AA]">{agent.input}</p>
                    </div>
                    <div className="rounded-lg border border-[#1F1F23] bg-[#09090B] p-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#3F3F46] mb-1">Output</p>
                      <p className="text-xs text-[#A1A1AA]">{agent.output}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-[#1F1F23] pt-3">
                    <div className="text-center">
                      <p className="text-[10px] text-[#3F3F46]">Latency</p>
                      <p className="mt-0.5 text-xs font-mono font-bold text-[#FAFAFA]">{agent.latency}ms</p>
                    </div>
                    <div className="text-center border-x border-[#1F1F23]">
                      <p className="text-[10px] text-[#3F3F46]">Tokens</p>
                      <p className="mt-0.5 text-xs font-mono font-bold text-[#FAFAFA]">{agent.tokens.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-[#3F3F46]">Last Run</p>
                      <p className="mt-0.5 text-xs font-bold text-[#FAFAFA]">{agent.lastRun}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
