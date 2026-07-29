// ─── Core Domain Types ───────────────────────────────────────────────────────

export type RiskLevel = 'high' | 'medium' | 'low' | 'unknown';

export interface Company {
  id: string;
  name: string;
  ticker?: string;
  jurisdiction?: string;
  sector?: string;
  cik?: string;
}

export interface DebtObligation {
  id: string;
  amount: number;
  currency: string;
  maturity?: string;
  type: string;
  guarantor?: string;
  debtor: string;
}

export interface RetrievedChunk {
  text: string;
  source_document: string;
  chunk_index?: number;
  score: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'company' | 'debt' | 'person' | 'entity';
  properties?: Record<string, unknown>;
  risk?: RiskLevel;
}

export interface GraphRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, unknown>;
}

export interface GraphFinding {
  entity_chain: string[];
  relationship_type: string;
  evidence: string;
  risk_level: RiskLevel;
}

// ─── Investigation Types ─────────────────────────────────────────────────────

export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

export interface AgentExecution {
  name: string;
  status: AgentStatus;
  latency_ms?: number;
  tokens?: number;
  started_at?: string;
  completed_at?: string;
}

export interface InvestigationResult {
  query: string;
  executive_summary: string;
  risk_level: RiskLevel;
  confidence: number;
  sources: string[];
  graph_findings: GraphFinding[];
  retrieved_chunks: RetrievedChunk[];
  risk_narrative: string;
  agent_executions: AgentExecution[];
  created_at: string;
}

// ─── Alert Types ─────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  title: string;
  description: string;
  risk_level: RiskLevel;
  company: string;
  exposure?: number;
  created_at: string;
  acknowledged: boolean;
}

// ─── Report Types ─────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  title: string;
  query: string;
  risk_level: RiskLevel;
  created_at: string;
  result: InvestigationResult;
}

// ─── Upload / Ingestion Types ─────────────────────────────────────────────────

export type PipelineStepStatus = 'pending' | 'running' | 'done' | 'error';

export interface PipelineStep {
  id: string;
  label: string;
  status: PipelineStepStatus;
  duration_ms?: number;
}

export interface IngestionJob {
  job_id: string;
  filename: string;
  status: 'processing' | 'done' | 'error';
  steps: PipelineStep[];
  created_at: string;
}

// ─── Stats Types ─────────────────────────────────────────────────────────────

export interface PlatformStats {
  documents_indexed: number;
  companies: number;
  debt_obligations: number;
  graph_nodes: number;
  graph_relationships: number;
  risk_alerts: number;
}

export interface HealthStatus {
  neo4j: boolean;
  qdrant: boolean;
  llm: boolean;
}

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
