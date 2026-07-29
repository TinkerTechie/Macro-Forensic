'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';

// Custom Node Component for that premium look
const CustomNode = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-2 shadow-xl rounded-lg border-2 backdrop-blur-sm transition-colors duration-300 ${
      selected 
        ? 'border-indigo-400 bg-indigo-900/40 shadow-indigo-500/20' 
        : 'border-white/10 bg-black/60 shadow-black/50'
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-indigo-400 !border-none" />
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${data.type === 'claim' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        <div className="font-semibold text-slate-200 text-sm">{data.label}</div>
      </div>
      {data.subLabel && (
        <div className="text-xs text-slate-400 mt-1">{data.subLabel}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-indigo-400 !border-none" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

const initialNodes: Node[] = [
  { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Tesla Revenue Claim', type: 'claim', subLabel: '10-K Filing' } },
  { id: '2', type: 'custom', position: { x: 100, y: 150 }, data: { label: 'Inflation Data', subLabel: 'CPI Report' } },
  { id: '3', type: 'custom', position: { x: 400, y: 150 }, data: { label: 'Supply Chain', subLabel: 'Logistics' } },
  { id: '4', type: 'custom', position: { x: 100, y: 250 }, data: { label: 'Interest Rates', subLabel: 'Fed Reserve' } },
  { id: '5', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'GDP Growth', subLabel: 'World Bank' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }, style: { stroke: '#10b981' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }, style: { stroke: '#10b981' } },
  { id: 'e3-5', source: '3', target: '5', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }, style: { stroke: '#10b981' } },
];

export default function LivingGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  // Animate nodes appearing one by one
  useEffect(() => {
    const timer = setTimeout(() => {
      let currentNodes = 0;
      const interval = setInterval(() => {
        if (currentNodes < initialNodes.length) {
          setNodes(initialNodes.slice(0, currentNodes + 1));
          setEdges(initialEdges.filter(e => 
            initialNodes.slice(0, currentNodes + 1).some(n => n.id === e.source) &&
            initialNodes.slice(0, currentNodes + 1).some(n => n.id === e.target)
          ));
          currentNodes++;
        } else {
          clearInterval(interval);
        }
      }, 600); // 600ms between each node appearing
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full min-h-[400px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="#ffffff" gap={16} size={1} className="opacity-10" />
        <Controls className="!bg-black/50 !border-white/10 !fill-white" />
      </ReactFlow>
    </div>
  );
}
