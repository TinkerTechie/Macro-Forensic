'use client';

import { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const unwrappedParams = use(params);

  useEffect(() => {
    fetch(`http://localhost:8000/api/reports/${unwrappedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.sections_json) {
          data.sections = JSON.parse(data.sections_json);
        }
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-84px)] items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 pt-32">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold text-[#FAFAFA]">Report Not Found</h2>
        <Link href="/dashboard" className="text-sm text-amber-500 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const riskColor = 
    report.risk_level === 'HIGH' || report.risk_level === 'CRITICAL' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
    report.risk_level === 'MEDIUM' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
    'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans p-6 md:p-12 max-w-5xl mx-auto">
      
      {/* ── Toolbar (Hidden when printing) ── */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm rounded-lg transition-colors"
        >
          <Printer className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* ── Report Document ── */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111113] border border-[#1F1F23] rounded-xl p-8 md:p-12 print:bg-white print:text-black print:border-none print:shadow-none print:p-0"
      >
        {/* Header */}
        <div className="border-b border-[#2A2A2D] print:border-gray-300 pb-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black text-[#FAFAFA] print:text-black tracking-tight">{report.title}</h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-md border uppercase ${riskColor} print:text-black print:border-black print:bg-transparent`}>
              {report.risk_level} RISK
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#71717A] print:text-gray-600 font-mono">
            <p><strong>Entity:</strong> {report.company}</p>
            <p><strong>Date:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
            <p><strong>ID:</strong> {report.id}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-[#FAFAFA] print:text-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500 print:text-black" />
            Executive Summary
          </h2>
          <p className="text-[#A1A1AA] print:text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
            {report.summary}
          </p>
        </div>

        {/* Dynamic Sections */}
        {report.sections?.map((section: any, idx: number) => (
          <div key={idx} className="mb-10 break-inside-avoid">
            <h2 className="text-sm font-bold text-[#FAFAFA] print:text-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 print:text-black" />
              {section.title}
            </h2>
            <div className="bg-[#09090B] print:bg-transparent border border-[#1F1F23] print:border-gray-200 rounded-lg p-5">
              <p className="text-[#A1A1AA] print:text-gray-800 leading-relaxed text-sm whitespace-pre-wrap font-mono">
                {section.content}
              </p>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#2A2A2D] print:border-gray-300 text-center text-xs text-[#52525B] print:text-gray-500 font-mono">
          <p>Generated by Macro-Forensic AI System (MFAS) v1.0.0</p>
          <p>CONFIDENTIAL AND PROPRIETARY</p>
        </div>
      </motion.div>

      {/* Print-specific global styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          nav, aside, header, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
