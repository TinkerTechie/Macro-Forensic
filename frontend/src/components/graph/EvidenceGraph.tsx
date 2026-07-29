'use client';

import React from 'react';
import ReactFlow, { 
  Background, 
  Node, 
  Edge,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

const SourceNode = ({ data }: any) => (
  <div className="px-4 py-3 bg-zinc-900 border border-white/20 rounded-xl shadow-xl backdrop-blur-md min-w-[150px]">
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <div className="flex items-center space-x-2 mb-2">
      <div className={`w-2 h-2 rounded-full ${data.color || 'bg-blue-400'}`} />
      <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">{data.source}</span>
    </div>
    <div className="text-sm text-slate-400">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

const ClaimNode = ({ data }: any) => (
  <div className="px-6 py-4 bg-indigo-900/40 border-2 border-indigo-500/50 rounded-xl shadow-2xl backdrop-blur-md">
    <div className="text-sm font-bold text-indigo-300 mb-1">CLAIM</div>
    <div className="text-base text-slate-200 font-medium">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

const nodeTypes = { source: SourceNode, claim: ClaimNode };

const nodes: Node[] = [
  { id: 'claim', type: 'claim', position: { x: 300, y: 20 }, data: { label: 'Battery Production Costs -15%' } },
  { id: 'sec', type: 'source', position: { x: 50, y: 150 }, data: { source: 'SEC Filing', label: 'Tesla 10-K', color: 'bg-emerald-400' } },
  { id: 'fed', type: 'source', position: { x: 250, y: 150 }, data: { source: 'Fed Reserve', label: 'Interest Rate Data', color: 'bg-amber-400' } },
  { id: 'wb', type: 'source', position: { x: 450, y: 150 }, data: { source: 'World Bank', label: 'Commodity Report', color: 'bg-rose-400' } },
  { id: 'oecd', type: 'source', position: { x: 650, y: 150 }, data: { source: 'OECD', label: 'Supply Chain Index', color: 'bg-blue-400' } },
];

const edges: Edge[] = [
  { 
    id: 'e1', source: 'claim', target: 'sec', 
    animated: true, 
    label: 'Strong Evidence',
    labelStyle: { fill: '#a7f3d0', fontWeight: 700 },
    style: { stroke: '#10b981', strokeWidth: 4 }, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } 
  },
  { 
    id: 'e2', source: 'claim', target: 'fed', 
    animated: true, 
    label: 'Moderate Evidence',
    labelStyle: { fill: '#fde68a', fontWeight: 600 },
    style: { stroke: '#f59e0b', strokeWidth: 2 }, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } 
  },
  { 
    id: 'e3', source: 'claim', target: 'wb', 
    animated: true, 
    label: 'Contradiction',
    labelStyle: { fill: '#fecdd3', fontWeight: 600 },
    style: { stroke: '#f43f5e', strokeWidth: 3, strokeDasharray: '5,5' }, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } 
  },
  { 
    id: 'e4', source: 'claim', target: 'oecd', 
    animated: true, 
    label: 'Weak Link',
    labelStyle: { fill: '#bfdbfe', fontWeight: 400 },
    style: { stroke: '#3b82f6', strokeWidth: 1 }, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } 
  },
];

export default function EvidenceGraph() {
  return (
    <div className="w-full h-[300px] mt-6 border border-white/10 rounded-xl overflow-hidden bg-black/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        zoomOnScroll={false}
        panOnDrag={false}
      >
        <Background color="#ffffff" gap={24} size={1} className="opacity-5" />
      </ReactFlow>
    </div>
  );
}
