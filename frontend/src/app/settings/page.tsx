'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SettingField {
  id: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  default: string | number;
}

const SETTINGS: { group: string; fields: SettingField[] }[] = [
  {
    group: 'Backend',
    fields: [
      { id: 'api_url',   label: 'Backend URL',  description: 'FastAPI server base URL', type: 'text',   default: 'http://localhost:8000' },
      { id: 'groq_model',label: 'Groq Model',   description: 'LLM model for generation', type: 'select', options: ['llama-3.3-70b-versatile','llama-3.1-70b-versatile','mixtral-8x7b-32768'], default: 'llama-3.3-70b-versatile' },
    ],
  },
  {
    group: 'Retrieval',
    fields: [
      { id: 'top_k',      label: 'Top K',       description: 'Number of chunks to retrieve per query', type: 'number', default: 5 },
      { id: 'chunk_size', label: 'Chunk Size',  description: 'Target character length per chunk',     type: 'number', default: 800 },
      { id: 'graph_depth',label: 'Graph Depth', description: 'Max hops in knowledge graph traversal', type: 'number', default: 3 },
    ],
  },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string | number>>(() => {
    const init: Record<string, string | number> = {};
    SETTINGS.forEach(g => g.fields.forEach(f => { init[f.id] = f.default; }));
    return init;
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {SETTINGS.map(group => (
        <motion.div
          key={group.group}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{group.group} Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.fields.map(field => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="block text-sm font-medium text-[#FAFAFA] mb-1">
                    {field.label}
                  </label>
                  <p className="text-[11px] text-[#52525B] mb-2">{field.description}</p>
                  {field.type === 'select' ? (
                    <select
                      id={field.id}
                      value={values[field.id] as string}
                      onChange={e => setValues(v => ({ ...v, [field.id]: e.target.value }))}
                      className="w-full rounded-lg border border-[#1F1F23] bg-[#09090B] px-3 py-2.5 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#3B82F6]/50"
                    >
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      id={field.id}
                      type={field.type}
                      value={values[field.id] as string}
                      onChange={e => setValues(v => ({ ...v, [field.id]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      className="w-full rounded-lg border border-[#1F1F23] bg-[#09090B] px-3 py-2.5 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#3B82F6]/50 font-mono"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <Button onClick={save} size="lg" className="w-full">
        {saved ? <><CheckCircle className="h-4 w-4 text-green-300" /> Saved!</> : <><Save className="h-4 w-4" /> Save Settings</>}
      </Button>
    </div>
  );
}
