import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayoutShell } from '@/components/layout/AppLayoutShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MFAS — Macro-Forensic Alert System',
  description: 'Enterprise AI platform for SEC filing investigation using Knowledge Graphs and RAG',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#09090B] text-[#FAFAFA] antialiased">
        <AppLayoutShell>{children}</AppLayoutShell>
      </body>
    </html>
  );
}

