'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, CreditCard, User, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ─── Mock Graph Data ──────────────────────────────────────────────────────────
const INITIAL_NODES: Node[] = [
  { id: 'apple',  position: { x: 400, y: 200 }, data: { label: 'Apple Inc.',  type: 'company', ticker: 'AAPL', debt: '$111.1B', jurisdiction: 'USA' }, type: 'default' },
  { id: 'aoi',    position: { x: 200, y: 380 }, data: { label: 'Apple Operations International', type: 'company', jurisdiction: 'Ireland' }, type: 'default' },
  { id: 'aoe',    position: { x: 600, y: 380 }, data: { label: 'Apple Operations Europe', type: 'company', jurisdiction: 'Ireland' }, type: 'default' },
  { id: 'debt1',  position: { x: 100, y: 560 }, data: { label: 'Term Loan B $6.5B', type: 'debt', amount: '$6.5B', maturity: '2028' }, type: 'default' },
  { id: 'debt2',  position: { x: 340, y: 560 }, data: { label: 'CP Program $5B', type: 'debt', amount: '$5B', maturity: 'Rolling' }, type: 'default' },
  { id: 'debt3',  position: { x: 580, y: 560 }, data: { label: 'Senior Notes $8B', type: 'debt', amount: '$8B', maturity: '2030' }, type: 'default' },
  { id: 'ms',     position: { x: 700, y: 200 }, data: { label: 'Morgan Stanley', type: 'entity', role: 'Lender' }, type: 'default' },
  { id: 'jpm',    position: { x: 820, y: 340 }, data: { label: 'JPMorgan Chase', type: 'entity', role: 'Lead Arranger' }, type: 'default' },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1', source: 'apple', target: 'aoi',   label: 'OWNS',        markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#3B82F6' }, labelStyle: { fill: '#52525B', fontSize: 10 } },
  { id: 'e2', source: 'apple', target: 'aoe',   label: 'OWNS',        markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#3B82F6' }, labelStyle: { fill: '#52525B', fontSize: 10 } },
  { id: 'e3', source: 'aoi',   target: 'debt1', label: 'HOLDS_DEBT',  markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#EF4444' }, labelStyle: { fill: '#52525B', fontSize: 10 } },
  { id: 'e4', source: 'aoe',   target: 'debt2', label: 'HOLDS_DEBT',  markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#EF4444' }, labelStyle: { fill: '#52525B', fontSize: 10 } },
  { id: 'e5', source: 'apple', target: 'debt3', label: 'GUARANTEES',  markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#F59E0B' }, labelStyle: { fill: '#52525B', fontSize: 10 } },
  { id: 'e6', source: 'apple', target: 'debt1', label: 'GUARANTEES',  markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#F59E0B', strokeDasharray: '4 2' }, labelStyle: { fill: '#52525B', fontSize: 10 } },
  { id: 'e7', source: 'ms',    target: 'debt1', label: 'LENDS',       markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6366F1' }, labelStyle: { fill: '#52525B', fontSize: 10 } },
  { id: 'e8', source: 'jpm',   target: 'debt2', label: 'ARRANGES',    markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#6366F1' }, labelStyle: { fill: '#52525B', fontSize: 10 } },
];

const NODE_COLORS: Record<string, string> = {
  company: '#3B82F6',
  debt:    '#EF4444',
  entity:  '#8B5CF6',
  person:  '#22C55E',
};

function nodeIcon(type: string) {
  switch (type) {
    case 'company': return <Building2 className="h-3 w-3" />;
    case 'debt':    return <CreditCard className="h-3 w-3" />;
    default:        return <User className="h-3 w-3" />;
  }
}

interface PanelData {
  label: string;
  type: string;
  ticker?: string;
  debt?: string;
  jurisdiction?: string;
  amount?: string;
  maturity?: string;
  role?: string;
}

export default function GraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState<PanelData | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/graph/nodes')
      .then(r => r.json())
      .then(data => {
        const dataNodes = data.nodes || [];
        const dataEdges = data.edges || [];
        
        // Layout nodes in a basic circle/grid to avoid stacking on (0,0)
        const total = dataNodes.length;
        const radius = Math.max(200, total * 15);
        const center = { x: 500, y: 300 };
        
        const laidOutNodes = dataNodes.map((n: any, i: number) => {
          const angle = total > 0 ? (i / total) * 2 * Math.PI : 0;
          return {
            ...n,
            position: {
              x: center.x + radius * Math.cos(angle),
              y: center.y + radius * Math.sin(angle)
            },
            type: 'default'
          };
        });
        
        const styledEdges = dataEdges.map((e: any) => ({
          ...e,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: '#6366F1' },
          labelStyle: { fill: '#A1A1AA', fontSize: 9 }
        }));
        
        setNodes(laidOutNodes);
        setEdges(styledEdges);
      })
      .catch(console.error);
  }, [setNodes, setEdges]);

  const onConnect = useCallback((c: Connection) => setEdges(eds => addEdge(c, eds)), [setEdges]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelected(node.data as PanelData);
  }, []);

  const styledNodes = nodes.map(n => ({
    ...n,
    style: {
      background: '#111113',
      border: `1px solid ${NODE_COLORS[n.data.type] ?? '#1F1F23'}22`,
      borderRadius: 10,
      color: '#FAFAFA',
      fontSize: 11,
      fontWeight: 600,
      padding: '8px 14px',
      boxShadow: `0 0 12px 0 ${NODE_COLORS[n.data.type] ?? '#3B82F6'}18`,
    },
  }));

  const filtered = search
    ? styledNodes.filter(n => (n.data.label as string).toLowerCase().includes(search.toLowerCase()))
    : styledNodes;

  return (
    <div className="relative h-[calc(100vh-84px)] w-full overflow-hidden">
      {/* Toolbar */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-[#1F1F23] bg-[#111113]/90 px-3 py-2 backdrop-blur-sm">
          <Search className="h-3.5 w-3.5 text-[#52525B]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entities…"
            className="w-44 bg-transparent text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none"
          />
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 rounded-xl border border-[#1F1F23] bg-[#111113]/90 px-4 py-2 backdrop-blur-sm">
          {Object.entries(NODE_COLORS).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {type}
            </span>
          ))}
        </div>
      </div>

      <ReactFlow
        nodes={filtered}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-[#09090B]"
      >
        <Background variant={BackgroundVariant.Dots} color="#1F1F23" gap={24} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(n) => NODE_COLORS[n.data?.type] ?? '#3F3F46'}
          maskColor="rgba(9,9,11,0.85)"
        />
      </ReactFlow>

      {/* Side Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="absolute right-4 top-4 bottom-4 z-10 w-72 overflow-y-auto rounded-2xl border border-[#1F1F23] bg-[#111113]/95 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between border-b border-[#1F1F23] p-4">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${NODE_COLORS[selected.type] ?? '#3B82F6'}20` }}
                >
                  <span style={{ color: NODE_COLORS[selected.type] ?? '#3B82F6' }}>
                    {nodeIcon(selected.type)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#FAFAFA] leading-tight">{selected.label}</p>
                  <Badge className="mt-0.5" variant="default">{selected.type}</Badge>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#52525B] hover:text-[#FAFAFA]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {[
                ['Ticker',       selected.ticker],
                ['Jurisdiction', selected.jurisdiction],
                ['Total Debt',   selected.debt],
                ['Amount',       selected.amount],
                ['Maturity',     selected.maturity],
                ['Role',         selected.role],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="flex items-center justify-between rounded-lg border border-[#1F1F23] bg-[#09090B] px-3 py-2">
                  <span className="text-[11px] text-[#52525B]">{k}</span>
                  <span className="text-xs font-mono font-medium text-[#FAFAFA]">{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
