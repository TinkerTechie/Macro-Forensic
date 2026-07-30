'use client';

import { useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Search, Loader2, GitFork, Building2, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/explore/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const newNodes: Node[] = data.nodes.map((n: any, i: number) => ({
          id: n.id,
          position: { x: (i % 5) * 200 + 100, y: Math.floor(i / 5) * 150 + 100 },
          data: { label: n.name, type: n.label.toLowerCase(), ...n.properties },
          style: {
            background: '#111113',
            border: `1px solid ${n.label === 'Company' ? '#3B82F6' : '#EF4444'}`,
            borderRadius: '8px',
            padding: '10px',
            color: '#FAFAFA',
            fontSize: '12px'
          }
        }));
        
        const newEdges: Edge[] = data.edges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.type,
          style: { stroke: '#52525B' },
          labelStyle: { fill: '#71717A', fontSize: 10 }
        }));
        
        setNodes(newNodes);
        setEdges(newEdges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] p-4 gap-4 bg-[#09090B]">
      
      {/* Search Bar */}
      <div className="flex-none bg-[#111113] border border-[#1F1F23] rounded-xl p-3 flex gap-4 items-center max-w-2xl mx-auto w-full">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search knowledge graph (e.g., 'Apple', 'Debt')..."
            className="w-full bg-transparent border-none focus:outline-none pl-10 text-sm text-[#FAFAFA] placeholder:text-[#52525B]"
          />
        </div>
        <Button onClick={handleSearch} disabled={!query.trim() || loading} size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Explore'}
        </Button>
      </div>

      {/* Graph Workspace */}
      <div className="flex-1 bg-[#111113] border border-[#1F1F23] rounded-xl overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#09090B] px-3 py-1.5 rounded-lg border border-[#1F1F23]">
          <GitFork className="h-4 w-4 text-[#3B82F6]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">
            Neo4j Explorer
          </span>
        </div>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          className="bg-[#09090B]"
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#1F1F23" />
          <Controls className="bg-[#111113] border-[#1F1F23] fill-[#FAFAFA]" />
          <MiniMap className="bg-[#111113] border-[#1F1F23]" maskColor="rgba(0,0,0,0.5)" />
        </ReactFlow>
        
        {!nodes.length && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[#52525B] text-sm">Search for an entity to begin exploration</span>
          </div>
        )}
      </div>
      
    </div>
  );
}
