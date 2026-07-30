'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server, Brain, Database, Sliders, Save, CheckCircle2,
  RotateCcw, ChevronRight, Cpu, Network, Zap, Globe,
} from 'lucide-react';

/* ─── Config Schema ────────────────────────────────────── */
type FieldType = 'text' | 'number' | 'select' | 'toggle';

interface Field {
  id: string;
  label: string;
  description: string;
  type: FieldType;
  options?: string[];
  default: string | number | boolean;
  badge?: string;
}

interface Group {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  fields: Field[];
}

const GROUPS: Group[] = [
  {
    id: 'backend',
    label: 'Backend Connection',
    icon: Server,
    color: '#F59E0B',
    fields: [
      {
        id: 'api_url', label: 'FastAPI Server URL', type: 'text',
        description: 'Base URL for the MFAS backend REST API.',
        default: 'http://localhost:8000', badge: 'required',
      },
      {
        id: 'qdrant_url', label: 'Qdrant Vector DB URL', type: 'text',
        description: 'Qdrant instance URL for semantic retrieval.',
        default: 'http://localhost:6333',
      },
      {
        id: 'neo4j_uri', label: 'Neo4j Bolt URI', type: 'text',
        description: 'Bolt URI for the Knowledge Graph database.',
        default: 'bolt://localhost:7687',
      },
    ],
  },
  {
    id: 'llm',
    label: 'LLM & AI Models',
    icon: Brain,
    color: '#A78BFA',
    fields: [
      {
        id: 'groq_model', label: 'Primary LLM Model', type: 'select',
        description: 'Model used for forensic reasoning and generation.',
        options: [
          'llama-3.3-70b-versatile',
          'llama-3.1-70b-versatile',
          'mixtral-8x7b-32768',
          'llama-3.1-8b-instant',
        ],
        default: 'llama-3.3-70b-versatile', badge: 'groq',
      },
      {
        id: 'streaming', label: 'Enable Streaming', type: 'toggle',
        description: 'Stream LLM tokens to UI in real time via SSE.',
        default: true,
      },
      {
        id: 'temperature', label: 'LLM Temperature', type: 'number',
        description: 'Sampling temperature (0.0 = deterministic, 1.0 = creative).',
        default: 0.1,
      },
    ],
  },
  {
    id: 'retrieval',
    label: 'Retrieval & Memory',
    icon: Database,
    color: '#34D399',
    fields: [
      {
        id: 'top_k', label: 'Top K Chunks', type: 'number',
        description: 'Number of vector chunks retrieved per query.',
        default: 5,
      },
      {
        id: 'chunk_size', label: 'Chunk Size (chars)', type: 'number',
        description: 'Target character length per document chunk.',
        default: 800,
      },
      {
        id: 'graph_depth', label: 'Graph Traversal Depth', type: 'number',
        description: 'Maximum hops in Knowledge Graph traversal.',
        default: 3,
      },
      {
        id: 'reranking', label: 'Enable Reranking', type: 'toggle',
        description: 'Cross-encoder reranking for higher precision retrieval.',
        default: false,
      },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    icon: Sliders,
    color: '#60A5FA',
    fields: [
      {
        id: 'risk_threshold', label: 'Risk Alert Threshold', type: 'select',
        description: 'Minimum severity level to generate a risk alert.',
        options: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
      {
        id: 'max_agents', label: 'Max Concurrent Agents', type: 'number',
        description: 'Maximum parallel LangGraph agent nodes per investigation.',
        default: 4,
      },
      {
        id: 'debug_mode', label: 'Debug Mode', type: 'toggle',
        description: 'Show verbose agent reasoning traces in the UI.',
        default: false,
      },
    ],
  },
];

/* ─── Toggle Component ─────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-amber-500 border-amber-500' : 'bg-[#1F1F23] border-[#2A2A2D]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

const ICON_MAP: Record<string, React.ElementType> = {
  backend: Globe, llm: Cpu, retrieval: Network, platform: Zap,
};

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string | number | boolean>>(() => {
    const init: Record<string, string | number | boolean> = {};
    GROUPS.forEach(g => g.fields.forEach(f => { init[f.id] = f.default; }));
    return init;
  });
  const [saved, setSaved] = useState(false);
  const [activeGroup, setActiveGroup] = useState('backend');

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('mfas_token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:8000/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // merge with defaults
          const init: Record<string, string | number | boolean> = {};
          GROUPS.forEach(g => g.fields.forEach(f => {
            init[f.id] = data[f.id] !== undefined ? data[f.id] : f.default;
          }));
          setValues(init);
        }
      } catch (e) {
        console.error('Failed to fetch settings:', e);
      }
    };
    fetchSettings();
  }, []);

  const set = (id: string, val: string | number | boolean) =>
    setValues(v => ({ ...v, [id]: val }));

  const save = async () => {
    const token = localStorage.getItem('mfas_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  const reset = () => {
    const init: Record<string, string | number | boolean> = {};
    GROUPS.forEach(g => g.fields.forEach(f => { init[f.id] = f.default; }));
    setValues(init);
  };

  const currentGroup = GROUPS.find(g => g.id === activeGroup)!;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-black text-[#FAFAFA]">Settings</h1>
        <p className="text-xs text-[#52525B] mt-0.5">Configure backend, LLM models, retrieval, and platform behaviour</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* ── Sidebar nav ─────────────────────────────── */}
        <div className="lg:col-span-1 space-y-1">
          {GROUPS.map(group => {
            const Icon = group.icon;
            const active = group.id === activeGroup;
            return (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  active
                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                    : 'border border-transparent text-[#52525B] hover:bg-[#111113] hover:text-[#A1A1AA]'
                }`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${group.color}18` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: group.color }} />
                </div>
                <span className="text-xs font-semibold">{group.label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto text-amber-400" />}
              </button>
            );
          })}
        </div>

        {/* ── Field panel ─────────────────────────────── */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-[#111113] border border-[#1F1F23] rounded-2xl overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1F1F23]">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${currentGroup.color}18` }}>
                <currentGroup.icon className="w-4 h-4" style={{ color: currentGroup.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#FAFAFA]">{currentGroup.label}</p>
                <p className="text-[11px] text-[#52525B]">{currentGroup.fields.length} settings</p>
              </div>
            </div>

            {/* Fields */}
            <div className="divide-y divide-[#1A1A1C]">
              {currentGroup.fields.map(field => (
                <div key={field.id} className="px-6 py-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <label htmlFor={field.id} className="text-sm font-semibold text-[#FAFAFA]">
                        {field.label}
                      </label>
                      {field.badge && (
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                          field.badge === 'required'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>
                          {field.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#52525B] leading-relaxed">{field.description}</p>
                  </div>

                  {/* Input */}
                  <div className="flex-shrink-0 w-52">
                    {field.type === 'toggle' ? (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <span className="text-[11px] text-[#52525B]">{values[field.id] ? 'On' : 'Off'}</span>
                        <Toggle
                          checked={values[field.id] as boolean}
                          onChange={v => set(field.id, v)}
                        />
                      </div>
                    ) : field.type === 'select' ? (
                      <select
                        id={field.id}
                        value={values[field.id] as string}
                        onChange={e => set(field.id, e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-[#1F1F23] rounded-xl text-xs text-[#FAFAFA] focus:outline-none focus:border-amber-500/40 transition-colors appearance-none cursor-pointer"
                      >
                        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        id={field.id}
                        type={field.type}
                        value={values[field.id] as string}
                        onChange={e => set(field.id, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-[#1F1F23] rounded-xl text-xs text-[#FAFAFA] focus:outline-none focus:border-amber-500/40 transition-colors font-mono"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={save}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                saved
                  ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02]'
              }`}
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
            </button>

            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#1F1F23] text-[#71717A] hover:text-[#FAFAFA] hover:border-[#3F3F46] rounded-xl font-semibold text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
