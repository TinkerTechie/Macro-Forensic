'use client';

import { useMemo } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { Shield, GitFork, FileText, AlertTriangle, BarChart3, Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { AgentExecution } from '@/types';

interface Props {
  executions: AgentExecution[];
  disabledAgents: string[];
}

const ICONS = {
  'Supervisor': Shield,
  'Graph Explorer': GitFork,
  'Temporal RAG': FileText,
  'Risk Analyst': AlertTriangle,
  'Report Generator': BarChart3,
};

export function LangGraphVisualizer({ executions, disabledAgents }: Props) {

  const nodes: Node[] = useMemo(() => {
    return [
      { id: 'Supervisor', position: { x: 250, y: 20 }, data: { label: 'Supervisor' } },
      { id: 'Graph Explorer', position: { x: 100, y: 120 }, data: { label: 'Graph Explorer' } },
      { id: 'Temporal RAG', position: { x: 400, y: 120 }, data: { label: 'Temporal RAG' } },
      { id: 'Risk Analyst', position: { x: 250, y: 220 }, data: { label: 'Risk Analyst' } },
      { id: 'Report Generator', position: { x: 250, y: 320 }, data: { label: 'Report Generator' } }
    ].map(n => {
      const exec = executions.find(e => e.name === n.id);
      const isConfiguredDisabled = disabledAgents.includes(n.id);
      const status = isConfiguredDisabled ? 'disabled' : (exec?.status || 'idle');

      let borderColor = '#27272A';
      let bgColor = '#111113';
      let textColor = '#A1A1AA';

      if (status === 'running') {
        borderColor = '#3B82F6';
        bgColor = 'rgba(59, 130, 246, 0.1)';
        textColor = '#FAFAFA';
      } else if (status === 'done') {
        borderColor = '#10B981';
        textColor = '#FAFAFA';
      } else if (status === 'error') {
        borderColor = '#EF4444';
        textColor = '#FAFAFA';
      } else if (status === 'disabled') {
        borderColor = '#1F1F23';
        bgColor = '#09090B';
        textColor = '#52525B';
      }

      const Icon = ICONS[n.id as keyof typeof ICONS];

      return {
        ...n,
        style: {
          background: bgColor,
          borderColor,
          borderWidth: status === 'running' ? 2 : 1,
          borderRadius: 8,
          padding: 10,
          width: 160,
          color: textColor,
          boxShadow: status === 'running' ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none',
          opacity: status === 'disabled' ? 0.5 : 1,
        },
        data: {
          label: (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-semibold">{n.data.label}</span>
              </div>
              {status === 'running' && <Loader2 className="w-3 h-3 animate-spin text-[#3B82F6]" />}
              {status === 'done' && <CheckCircle className="w-3 h-3 text-[#10B981]" />}
              {status === 'error' && <XCircle className="w-3 h-3 text-[#EF4444]" />}
              {status === 'disabled' && <span className="text-[10px] uppercase">Disabled</span>}
            </div>
          )
        }
      };
    });
  }, [executions, disabledAgents]);

  const edges: Edge[] = useMemo(() => {
    const defaultOpts = {
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#3F3F46', strokeWidth: 1 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3F3F46' },
    };

    const activeOpts = {
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3B82F6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3B82F6' },
    };

    const isRunning = (source: string, target: string) => {
      const targetExec = executions.find(e => e.name === target);
      return targetExec?.status === 'running';
    };

    return [
      { id: 'e1', source: 'Supervisor', target: 'Graph Explorer', ...(isRunning('Supervisor', 'Graph Explorer') ? activeOpts : defaultOpts) },
      { id: 'e2', source: 'Supervisor', target: 'Temporal RAG', ...(isRunning('Supervisor', 'Temporal RAG') ? activeOpts : defaultOpts) },
      { id: 'e3', source: 'Graph Explorer', target: 'Risk Analyst', ...(isRunning('Graph Explorer', 'Risk Analyst') ? activeOpts : defaultOpts) },
      { id: 'e4', source: 'Temporal RAG', target: 'Risk Analyst', ...(isRunning('Temporal RAG', 'Risk Analyst') ? activeOpts : defaultOpts) },
      { id: 'e5', source: 'Risk Analyst', target: 'Report Generator', ...(isRunning('Risk Analyst', 'Report Generator') ? activeOpts : defaultOpts) },
    ];
  }, [executions]);

  return (
    <div className="w-full h-full bg-[#09090B] rounded-lg border border-[#1F1F23]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#1F1F23" gap={16} />
      </ReactFlow>
    </div>
  );
}
