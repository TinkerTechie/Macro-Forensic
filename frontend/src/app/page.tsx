'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  ArrowRight,
  Upload,
  Cpu,
  GitBranch,
  ShieldCheck,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Zap,
  Search,
} from 'lucide-react';

// ─── Workflow steps ────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    icon: <Upload className="w-5 h-5" />,
    label: 'Upload Filing',
    color: 'amber',
    desc: 'Drop a PDF — a 10-K, earnings report, or any financial document.',
    preview: (
      <div className="space-y-2">
        <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <div className="w-8 h-10 bg-amber-500/20 rounded flex items-center justify-center text-amber-400 text-xs font-bold">PDF</div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Tesla_10K_2024.pdf</p>
            <p className="text-[10px] text-slate-500">142 pages · 8.4 MB</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
        </div>
        <div className="text-[10px] text-slate-500 px-1">Parsing document… extracting 2,847 text chunks</div>
      </div>
    ),
  },
  {
    id: 2,
    icon: <Search className="w-5 h-5" />,
    label: 'Claims Extracted',
    color: 'blue',
    desc: 'AI identifies every forward-looking statement and financial claim.',
    preview: (
      <div className="space-y-2">
        {[
          { text: '"We expect revenue to grow 18–22% year-over-year…"', risk: 'medium' },
          { text: '"Supply chain costs will normalise by Q3 2025…"', risk: 'high' },
          { text: '"Gross margin improvement of 300 bps is anticipated…"', risk: 'low' },
        ].map((c, i) => (
          <div key={i} className="flex items-start space-x-2 text-[10px]">
            <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.risk === 'high' ? 'bg-rose-400' : c.risk === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className="text-slate-300 leading-relaxed">{c.text}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    icon: <GitBranch className="w-5 h-5" />,
    label: 'Evidence Retrieved',
    color: 'purple',
    desc: 'Hybrid memory searches vector embeddings and a knowledge graph simultaneously.',
    preview: (
      <div className="space-y-2 text-[10px]">
        <div className="flex justify-between text-slate-500 font-semibold uppercase tracking-wider">
          <span>Qdrant (Vectors)</span><span>Neo4j (Graph)</span>
        </div>
        {[['SEC filing Q2 2024', 'Tesla → Panasonic → LFP costs'], ['CPI Index Jul 2024', 'Inflation → Supply Chain'], ['Fed Rate Statement', 'Interest Rate → CapEx']].map(([v, g], i) => (
          <div key={i} className="flex justify-between text-slate-400">
            <span className="text-blue-300">{v}</span>
            <span className="text-purple-300">{g}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    icon: <Cpu className="w-5 h-5" />,
    label: 'Agents Debate',
    color: 'rose',
    desc: 'Three specialized AI agents cross-examine the evidence and flag contradictions.',
    preview: (
      <div className="space-y-2 text-[10px]">
        {[
          { agent: 'Analyst', color: 'text-emerald-400', msg: 'Revenue target is consistent with historical 3-yr CAGR of 19%.' },
          { agent: 'Critic', color: 'text-rose-400', msg: 'Supply chain claim contradicts rising LFP battery costs (+12% YoY).' },
          { agent: 'Validator', color: 'text-amber-400', msg: 'Consensus: Partially supported. Downgrading confidence to 71%.' },
        ].map((a, i) => (
          <div key={i} className={`${a.color} font-semibold`}>
            {a.agent}: <span className="text-slate-400 font-normal">{a.msg}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 5,
    icon: <ShieldCheck className="w-5 h-5" />,
    label: 'Verdict Delivered',
    color: 'emerald',
    desc: 'A confidence score with a full explainability replay — no black boxes.',
    preview: (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Confidence Score</span>
          <span className="text-2xl font-black text-amber-400">71%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[71%] bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" />
        </div>
        <div className="flex items-center space-x-2 text-[10px]">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span className="text-slate-400">Risk: <span className="text-amber-400 font-semibold">Medium</span> · 1 contradiction found</span>
        </div>
      </div>
    ),
  },
];

const COLOR_MAP: Record<string, string> = {
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  rose: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
};

const DOT_MAP: Record<string, string> = {
  amber: 'bg-amber-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  rose: 'bg-rose-400',
  emerald: 'bg-emerald-400',
};

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance steps
  useEffect(() => {
    const t = setInterval(() => {
      setActiveStep(prev => (prev + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#080810] text-slate-200 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[15%] w-[700px] h-[700px] bg-amber-500/8 rounded-full blur-[160px]" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-rose-500/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-emerald-500/6 rounded-full blur-[120px]" />
        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10">

        {/* ── Nav ─────────────────────────────────────────── */}
        <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Macro<span className="text-amber-400">Forensic</span></span>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/login">
              <button className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white border border-white/10 rounded-xl hover:border-white/20 transition-all">
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <button className="flex items-center space-x-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:scale-105 transition-all">
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>AI-Powered Financial Document Forensics</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-7 max-w-4xl mx-auto"
          >
            <span className="text-white">Stop Trusting.</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500">
              Start Verifying.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            MacroForensic uploads any SEC filing, extracts every forward-looking claim, and cross-examines it against real macroeconomic data using a panel of AI agents — delivering a verified confidence score in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <button className="group flex items-center space-x-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] hover:scale-105 transition-all">
                <span>Start Your First Investigation</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="flex items-center space-x-2 px-8 py-4 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 font-semibold text-sm rounded-2xl transition-all">
                <span>See How It Works</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </a>
          </motion.div>
        </section>

        {/* ── Problem Statement ──────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pb-28">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: <AlertTriangle className="w-5 h-5 text-rose-400" />, stat: '~400 pages', label: 'Average 10-K filing length', sub: 'Hundreds of claims buried in footnotes' },
              { icon: <Zap className="w-5 h-5 text-amber-400" />, stat: '3–5 weeks', label: 'Manual due diligence time', sub: 'Analyst hours spent cross-referencing data' },
              { icon: <BarChart3 className="w-5 h-5 text-rose-400" />, stat: '1 in 3', label: 'Claims cannot be verified', sub: 'Without a dedicated data pipeline' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <div className="text-2xl font-black text-white mb-1">{item.stat}</div>
                <div className="text-sm font-semibold text-slate-300 mb-1">{item.label}</div>
                <div className="text-xs text-slate-500">{item.sub}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How It Works (Animated Workflow) ──────────── */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 pb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              From Filing to <span className="text-amber-400">Verdict</span> in 5 Steps
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">Every step is transparent, explainable, and auditable. No black boxes.</p>
          </div>

          <div className="grid md:grid-cols-[1fr_1.4fr] gap-8 items-start">
            {/* Step selector */}
            <div className="space-y-2">
              {STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                const colorCls = COLOR_MAP[step.color];
                const dotCls = DOT_MAP[step.color];
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${isActive
                        ? `${colorCls} shadow-lg`
                        : 'bg-white/3 border-white/8 hover:bg-white/5 hover:border-white/15'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-black/30' : 'bg-white/5'}`}>
                        {isActive ? (
                          <motion.div layoutId="activeIcon" className={`${(colorCls || '').split(' ')[2]}`}>
                            {step.icon}
                          </motion.div>
                        ) : (
                          <span className="text-slate-500">{step.icon}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {isActive && <span className={`w-1.5 h-1.5 rounded-full ${dotCls} animate-pulse`} />}
                          <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                            {step.id}. {step.label}
                          </span>
                        </div>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-xs text-slate-400 mt-1 leading-relaxed"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Preview panel */}
            <div className="sticky top-8">
              <div className="bg-black/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
                {/* Mock window chrome */}
                <div className="flex items-center space-x-2 px-5 py-3.5 border-b border-white/8 bg-white/3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <span className="ml-3 text-xs text-slate-500 font-mono">MacroForensic · {STEPS[activeStep]?.label}</span>
                </div>
                <div className="p-6 min-h-[200px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {STEPS[activeStep]?.preview}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Progress bar */}
                <div className="px-6 pb-4">
                  <div className="flex space-x-1">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= activeStep ? `${DOT_MAP[STEPS[activeStep]?.color as keyof typeof DOT_MAP] || ''}` : 'bg-white/10'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Key Capabilities ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Built Different</h2>
            <p className="text-slate-400">Not another chatbot. A verifiable, evidence-first AI pipeline.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <GitBranch className="w-6 h-6 text-purple-400" />,
                title: 'Hybrid Memory Retrieval',
                desc: 'Combines semantic vector search (Qdrant) with a structured knowledge graph (Neo4j) to find both similar concepts and precise entity relationships.',
                tag: 'Qdrant + Neo4j',
                tagColor: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
              },
              {
                icon: <Cpu className="w-6 h-6 text-rose-400" />,
                title: 'Multi-Agent Debate Protocol',
                desc: 'An Analyst proposes, a Critic challenges, and a Validator adjudicates. Three independent agents prevent single-model hallucinations.',
                tag: 'LangGraph · Supervisor Pattern',
                tagColor: 'text-rose-300 bg-rose-500/10 border-rose-500/20',
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
                title: 'Explainable Confidence Scores',
                desc: 'Every score comes with a full reasoning timeline you can scrub through — see exactly which data point changed the verdict from 92% to 71%.',
                tag: 'Explainability Replay',
                tagColor: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white/3 border border-white/8 rounded-2xl p-7 hover:bg-white/5 hover:border-white/15 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-3">{card.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{card.desc}</p>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${card.tagColor}`}>
                  {card.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ─────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pb-28 text-center">
          <p className="text-slate-600 text-xs uppercase tracking-widest font-semibold mb-6">Technology Stack</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Next.js 16', 'FastAPI', 'LangGraph', 'Neo4j', 'Qdrant', 'PostgreSQL', 'Framer Motion', 'Tailwind CSS'].map((t) => (
              <span key={t} className="px-4 py-2 bg-white/4 border border-white/8 rounded-full text-slate-400 text-xs font-medium hover:border-amber-500/30 hover:text-amber-300 transition-colors cursor-default">
                {t}
              </span>
            ))}
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent p-14 text-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 relative z-10">
              Ready to Stop Trusting?
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-10 relative z-10">
              Sign in and upload your first filing. The AI panel will have a verdict for you in under 30 seconds.
            </p>
            <Link href="/signup" className="relative z-10">
              <button className="group inline-flex items-center space-x-2 px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.35)] hover:shadow-[0_0_70px_rgba(245,158,11,0.5)] hover:scale-105 transition-all">
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-white/8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center">
              <Network className="w-3.5 h-3.5 text-white" />
            </div>
            <span>© {new Date().getFullYear()} MacroForensic Analytics System</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors flex items-center space-x-1">
              <ExternalLink className="w-3 h-3" /><span>GitHub</span>
            </a>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Login</Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
