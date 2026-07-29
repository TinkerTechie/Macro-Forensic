'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle, Loader2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { PipelineStep, PipelineStepStatus } from '@/types';

const PIPELINE_STEPS: { id: string; label: string }[] = [
  { id: 'parse',    label: 'Parsing PDF via LlamaParse' },
  { id: 'markdown', label: 'Extracting Markdown content' },
  { id: 'chunk',    label: 'Chunking document' },
  { id: 'embed',    label: 'Generating HuggingFace embeddings' },
  { id: 'qdrant',   label: 'Storing vectors in Qdrant' },
  { id: 'entity',   label: 'Extracting entities & relationships' },
  { id: 'neo4j',    label: 'Writing to Neo4j graph' },
  { id: 'ready',    label: 'Document ready for investigation' },
];

function StepRow({ step }: { step: PipelineStep }) {
  const icons: Record<PipelineStepStatus, React.ReactNode> = {
    pending: <div className="h-4 w-4 rounded-full border-2 border-[#3F3F46]" />,
    running: <Loader2 className="h-4 w-4 animate-spin text-[#3B82F6]" />,
    done:    <CheckCircle className="h-4 w-4 text-[#22C55E]" />,
    error:   <AlertCircle className="h-4 w-4 text-[#EF4444]" />,
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        step.status === 'running' ? 'border-[#3B82F6]/30 bg-[#3B82F6]/5' :
        step.status === 'done'   ? 'border-[#22C55E]/15 bg-[#22C55E]/5' :
        step.status === 'error'  ? 'border-red-500/15 bg-red-500/5' :
        'border-[#1F1F23] bg-transparent'
      }`}
    >
      <div className="shrink-0">{icons[step.status]}</div>
      <span className={`text-sm ${
        step.status === 'done' ? 'text-[#FAFAFA]' :
        step.status === 'running' ? 'text-[#3B82F6]' :
        'text-[#52525B]'
      }`}>
        {step.label}
      </span>
      {step.duration_ms && (
        <span className="ml-auto text-[11px] font-mono text-[#3F3F46]">
          {step.duration_ms}ms
        </span>
      )}
    </motion.div>
  );
}

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setPhase('uploading');

    // Simulate upload progress
    for (let p = 0; p <= 100; p += 10) {
      await new Promise(r => setTimeout(r, 60));
      setUploadProgress(p);
    }

    setPhase('processing');
    const initialSteps: PipelineStep[] = PIPELINE_STEPS.map(s => ({ ...s, status: 'pending' }));
    setSteps(initialSteps);

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      const dur = 400 + Math.random() * 800;
      await new Promise(r => setTimeout(r, dur));
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done', duration_ms: Math.round(dur) } : s));
    }

    setPhase('done');
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null); setPhase('idle'); setSteps([]); setUploadProgress(0);
  };

  const doneCount = steps.filter(s => s.status === 'done').length;
  const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#FAFAFA]">Upload SEC Filing</h2>
        <p className="mt-1 text-sm text-[#52525B]">Ingest PDF, HTML, 10-K or 10-Q documents into the MFAS intelligence pipeline.</p>
      </div>

      {/* Drop zone */}
      <AnimatePresence mode="wait">
        {phase === 'idle' ? (
          <motion.label
            key="dropzone"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-300 ${
              dragging
                ? 'border-[#3B82F6] bg-[#3B82F6]/5 scale-[1.01]'
                : 'border-[#1F1F23] bg-[#111113] hover:border-[#3B82F6]/40 hover:bg-[#111113]'
            }`}
          >
            <input type="file" className="sr-only" accept=".pdf,.html,.htm" onChange={onFileInput} />
            <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border transition-colors ${
              dragging ? 'border-[#3B82F6]/40 bg-[#3B82F6]/10' : 'border-[#1F1F23] bg-[#09090B]'
            }`}>
              <Upload className={`h-8 w-8 transition-colors ${dragging ? 'text-[#3B82F6]' : 'text-[#3F3F46]'}`} />
            </div>
            <p className="text-base font-semibold text-[#FAFAFA]">
              {dragging ? 'Drop to upload' : 'Drop your filing here'}
            </p>
            <p className="mt-1 text-sm text-[#52525B]">
              or <span className="text-[#3B82F6] underline underline-offset-2">browse files</span>
            </p>
            <div className="mt-4 flex gap-2">
              {['PDF', 'HTML', '10-K', '10-Q'].map(t => (
                <span key={t} className="rounded-md border border-[#1F1F23] bg-[#09090B] px-2.5 py-1 text-[11px] text-[#52525B]">{t}</span>
              ))}
            </div>
          </motion.label>
        ) : (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <File className="h-3.5 w-3.5" /> Ingestion Pipeline
                  </CardTitle>
                  <button onClick={reset} className="rounded-md p-1 text-[#52525B] hover:text-[#FAFAFA] transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File info */}
                <div className="flex items-center gap-3 rounded-lg border border-[#1F1F23] bg-[#09090B] p-3">
                  <File className="h-8 w-8 text-[#3B82F6] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#FAFAFA]">{file?.name}</p>
                    <p className="text-[11px] text-[#52525B]">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '—'}
                    </p>
                  </div>
                  {phase === 'done' && <CheckCircle className="h-5 w-5 text-[#22C55E] shrink-0" />}
                </div>

                {/* Upload progress */}
                {phase === 'uploading' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[#52525B]">Uploading…</span>
                      <span className="text-[11px] font-mono text-[#3B82F6]">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Pipeline steps */}
                {steps.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] text-[#52525B]">Pipeline progress</p>
                      <span className="text-[11px] font-mono text-[#3B82F6]">
                        {doneCount}/{steps.length} steps
                      </span>
                    </div>
                    <Progress value={progress} color={phase === 'done' ? '#22C55E' : '#3B82F6'} className="mb-3" />
                    {steps.map(step => (
                      <StepRow key={step.id} step={step} />
                    ))}
                  </div>
                )}

                {phase === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5 p-4 text-center"
                  >
                    <CheckCircle className="h-8 w-8 text-[#22C55E] mx-auto mb-2" />
                    <p className="font-semibold text-[#22C55E]">Document ready for investigation</p>
                    <p className="mt-1 text-xs text-[#52525B]">All vectors, entities and graph relationships have been indexed.</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
