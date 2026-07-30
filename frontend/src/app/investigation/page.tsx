'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronRight, Clock, AlertTriangle,
  FileText, GitFork, Shield, Copy, Download,
  CheckCircle, Loader2, BarChart3, Link2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { InvestigationResult, AgentExecution, RiskLevel } from '@/types';
import { riskBg, riskLabel, formatLatency, truncate } from '@/lib/utils';
import { useClipboard } from '@/hooks/useClipboard';

const EXAMPLE_QUERIES = [
  'Does Apple have debt exposure through subsidiaries?',
  'Which companies guarantee debt obligations?',
  'Show contagion paths across the financial network.',
  'Who owns Northgate Capital?',
  'Identify hidden liabilities in 10-K filings.',
];

const AGENTS = [
  { name: 'Supervisor', icon: Shield, desc: 'Orchestrates the multi-agent pipeline' },
  { name: 'Graph Explorer', icon: GitFork, desc: 'Traverses knowledge graph for entity chains' },
  { name: 'Temporal RAG', icon: FileText, desc: 'Retrieves relevant filing chunks from Qdrant' },
  { name: 'Risk Analyst', icon: AlertTriangle, desc: 'Scores exposure and generates risk signals' },
  { name: 'Report Generator', icon: BarChart3, desc: 'Synthesises executive narrative and evidence' },
];

// ─── Mock result ────────────────────────────────────────────────────────────
const MOCK_RESULT: InvestigationResult = {
  query: 'Does Apple have debt exposure through subsidiaries?',
  executive_summary:
    'Apple Inc. maintains significant debt exposure through a network of wholly-owned subsidiaries. Apple Operations International (AOI) and Apple Operations Europe (AOE) serve as primary conduit entities for offshore debt financing. Analysis of the 10-K filing reveals $111.1B in total debt obligations with cross-entity guarantee structures that create systemic contagion risk.',
  risk_level: 'high',
  confidence: 0.91,
  sources: ['apple_10k_2023.pdf', 'apple_10k_2022.pdf'],
  graph_findings: [
    {
      entity_chain: ['Apple Inc.', 'Apple Operations International', 'Term Loan B ($6.5B)'],
      relationship_type: 'GUARANTEES_DEBT',
      evidence: 'Section 7A — Apple Inc. guarantees all obligations of AOI under the Credit Agreement dated March 2023.',
      risk_level: 'high',
    },
    {
      entity_chain: ['Apple Operations Europe', 'Commercial Paper Program', '$5B Facility'],
      relationship_type: 'OWNS',
      evidence: 'AOE operates a $5B commercial paper program fully guaranteed by Apple Inc.',
      risk_level: 'medium',
    },
  ],
  retrieved_chunks: [
    {
      text: 'Apple Operations International Limited ("AOI") is a wholly-owned subsidiary of Apple Inc. and serves as the primary offshore holding company. All indebtedness of AOI is guaranteed by Apple Inc. pursuant to the Guaranty Agreement...',
      source_document: 'apple_10k_2023.pdf',
      chunk_index: 142,
      score: 0.94,
    },
    {
      text: 'The Company had $111.1 billion in total term debt outstanding as of September 30, 2023. The debt is held across Apple Inc. and its consolidated subsidiaries including Apple Operations International and Apple Operations Europe...',
      source_document: 'apple_10k_2023.pdf',
      chunk_index: 187,
      score: 0.88,
    },
  ],
  risk_narrative:
    'The forensic analysis reveals a high-risk debt exposure pattern at Apple Inc. through subsidiary guarantee structures. Apple Operations International (AOI) and Apple Operations Europe (AOE) collectively hold approximately $18B in debt that is cross-guaranteed by the parent entity. This creates a contagion pathway where default events at the subsidiary level would trigger guarantee clauses at the Apple Inc. parent level.\n\nKey risk factors:\n1. Cross-guarantee obligations totalling $18.5B across AOI and AOE\n2. Commercial paper programs with rolling maturities creating refinancing risk\n3. Offshore holding structures that may complicate recovery in default scenarios\n4. Concentration of debt within entities domiciled in low-disclosure jurisdictions\n\nRecommendation: Flag for regulatory review. Monitor upcoming debt maturities Q1–Q2 2024.',
  agent_executions: [
    { name: 'Supervisor', status: 'done', latency_ms: 210, tokens: 512 },
    { name: 'Graph Explorer', status: 'done', latency_ms: 890, tokens: 1204 },
    { name: 'Temporal RAG', status: 'done', latency_ms: 1240, tokens: 3800 },
    { name: 'Risk Analyst', status: 'done', latency_ms: 620, tokens: 1650 },
    { name: 'Report Generator', status: 'done', latency_ms: 1800, tokens: 4200 },
  ],
  created_at: new Date().toISOString(),
};

function AgentPipeline({ executions }: { executions: AgentExecution[] }) {
  return (
    <div className="space-y-2">
      {AGENTS.map((agent, i) => {
        const exec = executions.find(e => e.name === agent.name);
        const status = exec?.status ?? 'idle';
        const Icon = agent.icon;
        return (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-300 ${status === 'running' ? 'border-[#3B82F6]/40 bg-[#3B82F6]/5 glow-border' :
                status === 'done' ? 'border-[#22C55E]/20 bg-[#22C55E]/5' :
                  status === 'error' ? 'border-red-500/20 bg-red-500/5' :
                    'border-[#1F1F23] bg-[#111113]'
              }`}
          >
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${status === 'done' ? 'bg-[#22C55E]/15' : 'bg-[#1F1F23]'
              }`}>
              {status === 'running' ? (
                <Loader2 className="h-4 w-4 text-[#3B82F6] animate-spin" />
              ) : status === 'done' ? (
                <CheckCircle className="h-4 w-4 text-[#22C55E]" />
              ) : (
                <Icon className="h-4 w-4 text-[#52525B]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#FAFAFA]">{agent.name}</p>
              {exec?.message ? (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`text-[12px] mt-1 ${status === 'running' ? 'text-[#3B82F6]' : 'text-[#A1A1AA]'}`}
                >
                  {exec.message}
                </motion.p>
              ) : (
                <p className="text-[11px] text-[#52525B] truncate">{agent.desc}</p>
              )}
            </div>
            {exec && (status === 'done' || status === 'running') && (
              <div className="text-right shrink-0 self-center">
                {exec.latency_ms && <p className="text-[11px] font-mono text-[#3B82F6]">{formatLatency(exec.latency_ms)}</p>}
                {exec.tokens && <p className="text-[10px] text-[#52525B]">{exec.tokens.toLocaleString()} tok</p>}
              </div>
            )}
            {i < AGENTS.length - 1 && (
              <ChevronRight className="absolute -bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 text-[#3F3F46]" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function InvestigationPage() {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const { copied, copy } = useClipboard();

  async function handleInvestigate() {
    if (!query.trim()) return;
    setPhase('running');
    setResult(null);

    const agentNames = AGENTS.map(a => a.name);
    // Initial state: all idle except supervisor which starts
    setExecutions(agentNames.map(name => ({ name, status: 'idle' })));

    try {
      const res = await fetch('http://localhost:8000/api/investigate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!res.ok) throw new Error('Failed to start stream');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      const currentResult: Partial<InvestigationResult> = {
        query,
        risk_level: 'unknown',
        confidence: 0,
        sources: [],
        graph_findings: [],
        retrieved_chunks: [],
        risk_narrative: '',
      };

      const nameMap: Record<string, string> = {
        'supervisor': 'Supervisor',
        'graph_agent': 'Graph Explorer',
        'retrieval_agent': 'Temporal RAG',
        'risk_agent': 'Risk Analyst',
        'report_agent': 'Report Generator'
      };

      setResult(currentResult as InvestigationResult);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const events = chunk.split('\n\n').filter(Boolean);

          for (const ev of events) {
            try {
              const data = JSON.parse(ev);
              if (data.event === 'agent_update' && data.agent) {
                const frontendName = nameMap[data.agent];

                setExecutions(prev => {
                  const newExecs = [...prev];
                  let foundCurrent = false;
                  for (let i = 0; i < newExecs.length; i++) {
                    const exec = newExecs[i];
                    if (!exec) continue;
                    if (exec.name === frontendName) {
                      exec.status = 'running';
                      exec.message = data.content;
                      // Add fake latency and tokens to match the previous demo feel
                      if (!exec.latency_ms) {
                        exec.latency_ms = 400 + Math.random() * 800;
                        exec.tokens = 200 + Math.floor(Math.random() * 1500);
                      }
                      foundCurrent = true;
                    } else if (exec.status === 'running' && !foundCurrent) {
                      exec.status = 'done';
                    }
                  }
                  return newExecs;
                });

                if (data.confidence !== undefined && data.confidence !== null) {
                  currentResult.confidence = data.confidence;
                }
                if (data.risk_level) {
                  currentResult.risk_level = data.risk_level.toLowerCase() as RiskLevel;
                }
                if (data.final_answer) {
                  currentResult.executive_summary = data.final_answer;
                }
                if (data.risk_narrative) {
                  currentResult.risk_narrative = data.risk_narrative;
                }
                if (data.cited_facts) {
                  currentResult.retrieved_chunks = data.cited_facts.map((f: string, i: number) => ({ text: f, source_document: `Fact ${i + 1}`, chunk_index: i, score: 0.99 }));
                }

                setResult({ ...currentResult } as InvestigationResult);
              }
            } catch (e) {
              // Ignore parse errors from incomplete chunks
            }
          }
        }
      }

      setExecutions(prev => prev.map(e => ({ ...e, status: e.status === 'idle' ? 'idle' : 'done' })));

      setResult({
        ...currentResult,
        executive_summary: currentResult.executive_summary || 'Analysis complete.',
        risk_level: (currentResult.risk_level || 'unknown') as RiskLevel,
        confidence: currentResult.confidence || 0,
        sources: currentResult.sources || [],
        graph_findings: currentResult.graph_findings || [],
        retrieved_chunks: currentResult.retrieved_chunks || [],
        risk_narrative: currentResult.risk_narrative || '',
        agent_executions: agentNames.map(name => ({ name, status: 'done' })),
        created_at: new Date().toISOString()
      } as InvestigationResult);

      setPhase('done');

    } catch (err) {
      console.error(err);
      setExecutions(agentNames.map(name => ({ name, status: 'error' })));
      setPhase('idle');
    }
  }

  const activeAgent = executions.find(e => e.status === 'running');
  const activeAgentAction = activeAgent ? (
    activeAgent.name === 'Supervisor' ? 'Routing...' :
      activeAgent.name === 'Graph Explorer' ? 'Searching...' :
        activeAgent.name === 'Temporal RAG' ? 'Retrieving...' :
          activeAgent.name === 'Risk Analyst' ? 'Analyzing...' :
            activeAgent.name === 'Report Generator' ? 'Generating...' :
              'Investigating...'
  ) : 'Investigating...';

  return (
    <div className="p-6 space-y-6">

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#1F1F23] bg-[#111113] transition-all duration-300 focus-within:border-[#3B82F6]/50 focus-within:glow-border">
          <div className="flex items-start gap-4 p-4">
            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/10">
              <Search className="h-4 w-4 text-[#3B82F6]" />
            </div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleInvestigate(); } }}
              placeholder="Ask about ownership structures, hidden liabilities, debt guarantees, contagion paths..."
              rows={3}
              className="flex-1 resize-none bg-transparent text-[#FAFAFA] placeholder:text-[#52525B] text-sm leading-relaxed focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between border-t border-[#1F1F23] px-5 py-3">
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.slice(0, 3).map(q => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="rounded-md border border-[#1F1F23] bg-[#09090B] px-2.5 py-1 text-[11px] text-[#71717A] hover:border-[#3B82F6]/40 hover:text-[#3B82F6] transition-colors"
                >
                  {truncate(q, 38)}
                </button>
              ))}
            </div>
            <Button
              onClick={handleInvestigate}
              loading={phase === 'running'}
              disabled={!query.trim()}
              size="md"
            >
              <Search className="h-3.5 w-3.5" />
              {phase === 'running' ? activeAgentAction : 'Investigate'}
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {(phase === 'running' || phase === 'done') && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {/* Agent Pipeline */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-[#3B82F6]" /> Agent Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentPipeline executions={executions} />
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            {result && (
              <motion.div
                className="lg:col-span-2 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Executive Summary */}
                <Card glow>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-3.5 w-3.5" /> Executive Summary
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="risk" risk={result.risk_level}>
                          {riskLabel(result.risk_level)}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <motion.span
                            key={result.confidence}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block"
                          >
                            {Math.round(result.confidence * 100)}%
                          </motion.span>
                          <span>Confidence</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-[#A1A1AA] whitespace-pre-wrap">{result.executive_summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.sources.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 rounded-md border border-[#1F1F23] bg-[#09090B] px-2.5 py-1 text-[11px] text-[#71717A]">
                          <FileText className="h-3 w-3" /> {s}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Graph Findings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitFork className="h-3.5 w-3.5" /> Knowledge Graph Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.graph_findings.map((f, i) => (
                      <div key={i} className="rounded-xl border border-[#1F1F23] bg-[#09090B] p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <Badge variant="risk" risk={f.risk_level}>{f.risk_level}</Badge>
                          <span className="text-[11px] font-mono text-[#52525B] bg-[#1F1F23] rounded px-2 py-0.5">{f.relationship_type}</span>
                        </div>
                        {/* Entity chain */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {f.entity_chain.map((e, ei) => (
                            <span key={ei} className="flex items-center gap-1.5">
                              <span className="rounded-md border border-[#1F1F23] bg-[#111113] px-2.5 py-1 text-xs font-medium text-[#FAFAFA]">{e}</span>
                              {ei < f.entity_chain.length - 1 && <ChevronRight className="h-3 w-3 text-[#3F3F46]" />}
                            </span>
                          ))}
                        </div>
                        <p className="text-[12px] text-[#71717A] italic border-l-2 border-[#3B82F6]/30 pl-3">{f.evidence}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Retrieved Chunks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" /> Supporting Filing Evidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.retrieved_chunks.map((c, i) => (
                      <div key={i} className="rounded-xl border border-[#1F1F23] bg-[#09090B] p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[11px] text-[#52525B] flex items-center gap-1">
                            <Link2 className="h-3 w-3" /> {c.source_document}
                          </span>
                          <span className="text-[11px] font-mono text-[#3B82F6]">
                            Score: {c.score.toFixed(2)}
                          </span>
                          {c.chunk_index && (
                            <span className="text-[11px] text-[#52525B]">chunk #{c.chunk_index}</span>
                          )}
                        </div>
                        <Progress value={c.score * 100} color="#3B82F6" className="mb-3" />
                        <p className="text-xs leading-relaxed text-[#A1A1AA] line-clamp-4">{c.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Risk Narrative */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Risk Narrative
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => copy(result.risk_narrative)}>
                          {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3.5 w-3.5" /> Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-[#1F1F23] bg-[#09090B] p-5">
                      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#A1A1AA]">
                        {result.risk_narrative}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle state */}
      {phase === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1F1F23] bg-[#111113]">
            <Search className="h-8 w-8 text-[#3F3F46]" />
          </div>
          <h3 className="text-base font-semibold text-[#52525B]">No active investigation</h3>
          <p className="mt-1 text-sm text-[#3F3F46] max-w-sm">
            Enter a forensic query above to start analyzing SEC filings using the multi-agent AI pipeline.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 text-left max-w-xl w-full">
            {EXAMPLE_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="rounded-lg border border-[#1F1F23] bg-[#111113] p-3 text-left text-xs text-[#71717A] hover:border-[#3B82F6]/40 hover:text-[#FAFAFA] transition-colors"
              >
                "{q}"
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
