import type {
  PlatformStats,
  HealthStatus,
  InvestigationResult,
  IngestionJob,
  Alert,
  Report,
  GraphNode,
  GraphRelationship,
} from '@/types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>('/health');
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getStats(): Promise<PlatformStats> {
  return request<PlatformStats>('/graph/stats');
}

// ─── Ingestion ───────────────────────────────────────────────────────────────

export async function ingestFile(file: File): Promise<IngestionJob> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/ingest`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Ingest failed: HTTP ${res.status}`);
  return res.json() as Promise<IngestionJob>;
}

// ─── Investigation ────────────────────────────────────────────────────────────

export async function runInvestigation(
  query: string
): Promise<InvestigationResult> {
  return request<InvestigationResult>('/ask', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

// ─── Knowledge Graph ─────────────────────────────────────────────────────────

export async function getGraph(): Promise<{
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}> {
  return request('/graph');
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export async function getAlerts(): Promise<Alert[]> {
  return request<Alert[]>('/alerts');
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function getReports(): Promise<Report[]> {
  return request<Report[]>('/reports');
}

// ─── History ─────────────────────────────────────────────────────────────────

export interface InvestigationHistoryItem {
  id: number;
  query: string;
  risk_level: string;
  confidence: number;
  created_at: string;
}

export async function getInvestigations(skip = 0, limit = 100): Promise<InvestigationHistoryItem[]> {
  return request<InvestigationHistoryItem[]>(`/investigations?skip=${skip}&limit=${limit}`);
}

export async function getInvestigation(id: number): Promise<any> {
  return request<any>(`/investigations/${id}`);
}
