'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Building, Mail, Calendar, ShieldCheck, LogOut,
  Edit2, KeyRound, CheckCircle2, AlertCircle, Lock, Zap,
  Clock, FileText, Search, AlertTriangle, ChevronRight,
  Trash2,
} from 'lucide-react';

interface UserProfile {
  id: number;
  full_name: string;
  organization: string;
  email: string;
}

const ACTIVITY_STATS = [
  { label: 'Investigations', value: 12, icon: Search,        color: '#F59E0B' },
  { label: 'Documents',      value: 8,  icon: FileText,      color: '#A78BFA' },
  { label: 'Alerts Raised',  value: 5,  icon: AlertTriangle, color: '#F87171' },
];

const SECURITY_ITEMS = [
  { label: 'Authentication',  value: 'JWT HS256 · 24h token',         icon: ShieldCheck, ok: true },
  { label: 'Password Hashing', value: 'PBKDF2-SHA256 · 200k rounds',  icon: Lock,        ok: true },
  { label: 'Transport',       value: 'HTTPS recommended in production', icon: Zap,         ok: false },
];

function fade(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay },
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginTime] = useState(() =>
    new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  );
  const [tab, setTab] = useState<'account' | 'security'>('account');

  useEffect(() => {
    const stored = localStorage.getItem('mfas_user');
    if (!stored) { router.push('/login'); return; }
    const p = JSON.parse(stored) as UserProfile;
    setUser(p); setFullName(p.full_name); setOrganization(p.organization);
  }, [router]);

  const handleSave = async () => {
    if (!fullName.trim()) { setError('Name cannot be empty.'); return; }
    setError(null);
    const token = localStorage.getItem('mfas_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ full_name: fullName, organization })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('mfas_user', JSON.stringify(data.user));
        localStorage.setItem('mfas_token', data.access_token);
        setUser(data.user); setEditing(false);
        setSaved(true); setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to update profile.');
      }
    } catch (e) {
      console.error(e);
      setError('Network error saving profile.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mfas_user');
    localStorage.removeItem('mfas_token');
    router.push('/');
  };

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">

      {/* ── Page Title ─────────────────────────── */}
      <div>
        <h1 className="text-xl font-black text-[#FAFAFA]">Profile</h1>
        <p className="text-xs text-[#52525B] mt-0.5">Your identity, account security, and session</p>
      </div>

      {/* ── Banners ────────────────────────────── */}
      {saved && (
        <motion.div {...fade()} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Profile updated successfully
        </motion.div>
      )}
      {error && (
        <motion.div {...fade()} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </motion.div>
      )}

      {/* ── Hero Card ──────────────────────────── */}
      <motion.div {...fade(0)}
        className="relative overflow-hidden bg-[#111113] border border-[#1F1F23] rounded-2xl p-6"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(245,158,11,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,158,11,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-amber-500/30">
              {initials(user.full_name)}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#111113] flex items-center justify-center shadow-sm">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-xl font-black text-[#FAFAFA] leading-tight">{user.full_name}</p>
            <p className="text-sm text-[#71717A] mt-0.5">{user.organization}</p>
            <p className="text-xs text-[#52525B] mt-0.5">{user.email}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3 h-3" /> Verified Account
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-bold text-amber-400">
                <Zap className="w-3 h-3" /> JWT Active
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 bg-[#1A1A1C] border border-[#2A2A2D] rounded-lg text-[10px] font-bold text-[#71717A]">
                <KeyRound className="w-3 h-3" /> ID #{user.id}
              </span>
            </div>
          </div>

          <button
            onClick={() => { setEditing(!editing); setError(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border rounded-xl transition-all flex-shrink-0 ${
              editing
                ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                : 'border-[#2A2A2D] text-[#71717A] hover:text-[#FAFAFA] hover:border-[#3F3F46]'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            {editing ? 'Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Activity row */}
        <div className="mt-6 pt-5 border-t border-[#1F1F23] grid grid-cols-3 gap-4">
          {ACTIVITY_STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-[#FAFAFA]">{s.value}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <s.icon className="w-3 h-3" style={{ color: s.color }} />
                <p className="text-[10px] text-[#52525B]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Tabs ───────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-[#111113] border border-[#1F1F23] rounded-xl w-fit">
        {(['account', 'security'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
              tab === t
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                : 'text-[#52525B] hover:text-[#A1A1AA]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Account Tab ────────────────────────── */}
      {tab === 'account' && (
        <motion.div {...fade(0)} className="bg-[#111113] border border-[#1F1F23] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1A1A1C]">
            <p className="text-xs font-bold text-[#52525B] uppercase tracking-widest">Account Details</p>
          </div>

          <div className="divide-y divide-[#1A1A1C]">
            {/* Full Name */}
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider mb-1">Full Name</p>
                {editing ? (
                  <input value={fullName} onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-500/30 rounded-xl text-sm text-[#FAFAFA] focus:outline-none focus:border-amber-500/60 transition-all"
                  />
                ) : (
                  <p className="text-sm text-[#FAFAFA] font-medium">{user.full_name}</p>
                )}
              </div>
            </div>

            {/* Organization */}
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Building className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider mb-1">Organization</p>
                {editing ? (
                  <input value={organization} onChange={e => setOrganization(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-amber-500/30 rounded-xl text-sm text-[#FAFAFA] focus:outline-none focus:border-amber-500/60 transition-all"
                  />
                ) : (
                  <p className="text-sm text-[#FAFAFA] font-medium">{user.organization}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-sm text-[#71717A] font-medium">{user.email}</p>
              </div>
              <span className="text-[10px] border border-[#2A2A2D] text-[#3F3F46] px-2 py-1 rounded-lg font-semibold flex-shrink-0">
                Read-only
              </span>
            </div>

            {/* User ID */}
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-[#1A1A1C] flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-4 h-4 text-[#52525B]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider mb-1">User ID</p>
                <p className="text-sm text-[#52525B] font-mono">#{user.id}</p>
              </div>
            </div>
          </div>

          {editing && (
            <div className="px-6 py-4 border-t border-[#1A1A1C] flex gap-3">
              <button onClick={handleSave}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20"
              >
                Save Changes
              </button>
              <button
                onClick={() => { setEditing(false); setError(null); setFullName(user.full_name); setOrganization(user.organization); }}
                className="px-5 py-2.5 border border-[#1F1F23] text-[#71717A] hover:text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Security Tab ───────────────────────── */}
      {tab === 'security' && (
        <motion.div {...fade(0)} className="space-y-4">
          {/* Security items */}
          <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1A1A1C]">
              <p className="text-xs font-bold text-[#52525B] uppercase tracking-widest">Security Configuration</p>
            </div>
            <div className="divide-y divide-[#1A1A1C]">
              {SECURITY_ITEMS.map(item => (
                <div key={item.label} className="px-6 py-4 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                    <item.icon className={`w-4 h-4 ${item.ok ? 'text-emerald-400' : 'text-amber-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#FAFAFA]">{item.label}</p>
                    <p className="text-[11px] text-[#52525B]">{item.value}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex-shrink-0 ${
                    item.ok
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {item.ok ? '✓ Active' : '⚠ Warning'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Session card */}
          <div className="bg-[#111113] border border-[#1F1F23] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1A1A1C]">
              <p className="text-xs font-bold text-[#52525B] uppercase tracking-widest">Current Session</p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              <div className="bg-black/20 border border-[#1A1A1C] rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-3 h-3 text-[#52525B]" />
                  <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-wider">Signed In</span>
                </div>
                <p className="text-xs text-[#A1A1AA] font-medium">{loginTime}</p>
              </div>
              <div className="bg-black/20 border border-[#1A1A1C] rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="w-3 h-3 text-[#52525B]" />
                  <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-wider">Expires</span>
                </div>
                <p className="text-xs text-[#A1A1AA] font-medium">24 hours from login</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 font-semibold text-sm rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" /> Sign Out of MFAS
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-[#111113] border border-rose-500/15 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-rose-500/10">
              <p className="text-xs font-bold text-rose-500/70 uppercase tracking-widest">Danger Zone</p>
            </div>
            <div className="px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#FAFAFA]">Delete Account</p>
                <p className="text-[11px] text-[#52525B] mt-0.5">Permanently delete your account and all associated data</p>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
