'use client';

import React, { useState, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Node, 
  Edge,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Cpu } from 'lucide-react';

const ArchNode = ({ data, selected }: any) => (
  <div className={`px-4 py-3 border-2 rounded-xl backdrop-blur-md shadow-xl transition-all duration-300 min-w-[120px] text-center ${
    data.isActive 
      ? 'bg-indigo-900/60 border-indigo-400 shadow-indigo-500/20 scale-105' 
      : 'bg-black/60 border-white/10 opacity-70 hover:opacity-100'
  }`}>
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <Handle type="target" position={Position.Left} className="opacity-0" id="left" />
    <div className={`text-xs font-bold uppercase tracking-wider ${data.isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
      {data.label}
    </div>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
    <Handle type="source" position={Position.Right} className="opacity-0" id="right" />
  </div>
);

const nodeTypes = { arch: ArchNode };

export default function ArchitectureExplorer() {
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const initialNodes: Node[] = [
    { id: 'parser', type: 'arch', position: { x: 50, y: 50 }, data: { label: 'Parser' } },
    { id: 'chunker', type: 'arch', position: { x: 50, y: 150 }, data: { label: 'Chunker' } },
    { id: 'embed', type: 'arch', position: { x: 50, y: 250 }, data: { label: 'Embeddings' } },
    { id: 'qdrant', type: 'arch', position: { x: 250, y: 250 }, data: { label: 'Qdrant (Vector)' } },
    { id: 'neo4j', type: 'arch', position: { x: 250, y: 50 }, data: { label: 'Neo4j (Graph)' } },
    { id: 'retriever', type: 'arch', position: { x: 450, y: 150 }, data: { label: 'Retriever' } },
    { id: 'reasoner', type: 'arch', position: { x: 650, y: 150 }, data: { label: 'Reasoner' } },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1', source: 'parser', target: 'chunker', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e2', source: 'chunker', target: 'embed', sourceHandle: 'bottom', targetHandle: 'top' },
    { id: 'e3', source: 'embed', target: 'qdrant', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e4', source: 'parser', target: 'neo4j', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e5', source: 'qdrant', target: 'retriever', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e6', source: 'neo4j', target: 'retriever', sourceHandle: 'right', targetHandle: 'left' },
    { id: 'e7', source: 'retriever', target: 'reasoner', sourceHandle: 'right', targetHandle: 'left' },
  ];

  const nodes = useMemo(() => {
    return initialNodes.map(node => {
      let isActive = activeMode === null;
      if (activeMode === 'vector') {
        isActive = ['parser', 'chunker', 'embed', 'qdrant', 'retriever', 'reasoner'].includes(node.id);
      } else if (activeMode === 'graph') {
        isActive = ['parser', 'neo4j', 'retriever', 'reasoner'].includes(node.id);
      }

      return {
        ...node,
        data: { ...node.data, isActive }
      };
    });
  }, [activeMode]);

  const edges = useMemo(() => {
    return initialEdges.map(edge => {
      let isVisible = activeMode === null;
      if (activeMode === 'vector') {
        isVisible = ['e1', 'e2', 'e3', 'e5', 'e7'].includes(edge.id);
      } else if (activeMode === 'graph') {
        isVisible = ['e4', 'e6', 'e7'].includes(edge.id);
      }

      return {
        ...edge,
        animated: isVisible,
        style: { 
          stroke: isVisible ? '#818cf8' : '#334155', 
          strokeWidth: isVisible ? 2 : 1,
          opacity: isVisible ? 1 : 0.3 
        },
        markerEnd: { 
          type: MarkerType.ArrowClosed, 
          color: isVisible ? '#818cf8' : '#334155' 
        }
      };
    });
  }, [activeMode]);

  return (
    <div className="w-full h-full bg-black/40 border border-white/5 rounded-xl p-4 shadow-xl flex flex-col">
      <div className="flex items-center justify-between mb-2 z-10">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Interactive Architecture</h3>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveMode(activeMode === 'vector' ? null : 'vector')}
            className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold tracking-wider transition-colors border ${
              activeMode === 'vector' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'border-white/10 text-slate-500 hover:text-slate-300'
            }`}
          >
            Vector Pipeline
          </button>
          <button 
            onClick={() => setActiveMode(activeMode === 'graph' ? null : 'graph')}
            className={`text-[10px] px-2 py-1 rounded-md uppercase font-bold tracking-wider transition-colors border ${
              activeMode === 'graph' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'border-white/10 text-slate-500 hover:text-slate-300'
            }`}
          >
            Graph Pipeline
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative -mt-4">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          className="bg-transparent"
          zoomOnScroll={false}
          panOnDrag={false}
        >
          <Background color="#ffffff" gap={20} size={1} className="opacity-5" />
        </ReactFlow>
      </div>
    </div>
  );
}
