'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Loader2, TrendingUp, Users, MapPin, Zap, Activity,
  ArrowUpRight, RefreshCw, Terminal, Cpu, Radio, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface RecentJob {
  id: number;
  term: string;
  source: string;
  status: string;
  count: number;
  createdAt?: string;
}

interface Stats {
  totalLeads: number;
  totalPersonas: number;
  activeJobs: number;
  completedJobs: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    totalPersonas: 0,
    activeJobs: 0,
    completedJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Check backend health
      const healthRes = await fetch('http://localhost:3001/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (healthRes.ok) {
        setBackendStatus('online');

        try {
          const jobsRes = await fetch('http://localhost:3001/api/jobs');
          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            if (jobsData.jobs) {
              const jobs = jobsData.jobs;
              const completed = jobs.filter((j: RecentJob) => j.status === 'COMPLETED').length;
              const active = jobs.filter((j: RecentJob) => j.status === 'RUNNING' || j.status === 'PENDING').length;

              setStats(prev => ({
                ...prev,
                completedJobs: completed,
                activeJobs: active
              }));

              setRecentJobs(jobs.slice(0, 5).map((job: { id: number; searchTerm: string; source: string; status: string; resultCount: number; createdAt?: string }) => ({
                id: job.id,
                term: job.searchTerm,
                source: job.source,
                status: job.status,
                count: job.resultCount || 0,
                createdAt: job.createdAt
              })));
            }
          }
        } catch {
          console.log('Jobs API not available');
        }

        try {
          const leadsRes = await fetch('http://localhost:3001/api/leads');
          if (leadsRes.ok) {
            const leadsData = await leadsRes.json();
            setStats(prev => ({
              ...prev,
              totalLeads: leadsData.leads?.length || 0
            }));
          }
        } catch {
          console.log('Leads API not available');
        }

        try {
          const personasRes = await fetch('http://localhost:3001/api/personas');
          if (personasRes.ok) {
            const personasData = await personasRes.json();
            setStats(prev => ({
              ...prev,
              totalPersonas: personasData.personas?.length || 0
            }));
          }
        } catch {
          console.log('Personas API not available');
        }
      }
    } catch {
      setBackendStatus('offline');
      // Demo Data
      setStats({
        totalLeads: 1247,
        totalPersonas: 423,
        activeJobs: 3,
        completedJobs: 89
      });
      setRecentJobs([
        { id: 1, term: 'SaaS Founders', source: 'LINKEDIN', status: 'COMPLETED', count: 45 },
        { id: 2, term: 'Pizza NYC', source: 'GOOGLE_MAPS', status: 'COMPLETED', count: 120 },
        { id: 3, term: 'AI Tools', source: 'REDDIT', status: 'RUNNING', count: 0 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const statCards = [
    { label: 'TOTAL LEADS', value: stats.totalLeads, icon: Database, trend: '+12%', sub: 'INDEXED' },
    { label: 'PERSONAS', value: stats.totalPersonas, icon: Users, trend: '+8%', sub: 'ACTIVE' },
    { label: 'RUNNING JOBS', value: stats.activeJobs, icon: Activity, trend: 'LIVE', sub: 'PROCESSES' },
    { label: 'COMPLETED', value: stats.completedJobs, icon: ShieldCheck, trend: '99.9%', sub: 'SUCCESS RATE' },
  ];

  const quickActions = [
    { href: '/scraper/google-maps', label: 'MAPS_EXTRACTOR', icon: MapPin, desc: 'Target local entities' },
    { href: '/scraper/linkedin', label: 'LINKEDIN_MINER', icon: Users, desc: 'Professional network scan' },
    { href: '/scraper/reddit', label: 'REDDIT_OSINT', icon: Zap, desc: 'Social sentiment analysis' },
  ];

  return (
    <div className="min-h-screen relative p-8 md:p-12 font-body selection:bg-acid selection:text-black">
      <div className="grid-bg" />

      {/* HEADER SECTION */}
      <header className="relative z-10 mb-16 border-b border-[#333] pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-2 h-2 bg-acid animate-pulse"></div>
              <span className="text-xs font-mono text-acid tracking-[0.2em] uppercase">System Ready // v2.4.0</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-heading text-primary uppercase tracking-tighter"
            >
              NEXUS<span className="text-acid">.CMD</span>
            </motion.h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <div className="text-xs text-[#666] uppercase tracking-widest mb-1">Backend Uplink</div>
              <div className={`text-sm font-mono flex items-center justify-end gap-2 ${backendStatus === 'online' ? 'text-emerald-500' : 'text-red-500'
                }`}>
                {backendStatus === 'online' ? 'CONNECTED' : 'OFFLINE'}
                <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-mech group"
            >
              <span className="flex items-center gap-2">
                <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`} />
                SYNC_DATA
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="panel p-6 group hover:translate-y-[-2px] transition-transform duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <stat.icon size={20} className="text-[#444] group-hover:text-acid transition-colors duration-300" />
              <span className="text-[10px] font-mono border border-[#333] px-2 py-0.5 text-[#666] group-hover:border-acid group-hover:text-acid transition-colors">
                {stat.trend}
              </span>
            </div>
            <div className="text-4xl font-heading text-white mb-1">
              {loading ? (
                <span className="animate-pulse bg-[#222] h-10 w-24 block rounded-none" />
              ) : (
                stat.value.toLocaleString()
              )}
            </div>
            <div className="text-xs uppercase tracking-widest text-[#666] group-hover:text-[#999]">
              {stat.label}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-[#333] group-hover:border-acid transition-colors duration-300" />
          </motion.div>
        ))}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

        {/* QUICK ACTIONS */}
        <div className="lg:col-span-1">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-heading text-[#888] mb-6 flex items-center gap-2"
          >
            <Terminal size={18} />
            EXECUTION PROFILES
          </motion.h2>

          <div className="space-y-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Link href={action.href} className="block group">
                  <div className="panel p-5 flex items-center gap-4 transition-all duration-300 group-hover:bg-[#111]">
                    <div className="w-10 h-10 bg-[#111] border border-[#333] flex items-center justify-center group-hover:border-acid group-hover:text-acid transition-colors">
                      <action.icon size={20} />
                    </div>
                    <div>
                      <div className="font-mono text-sm text-primary group-hover:text-acid transition-colors">
                        {'>'} {action.label}
                      </div>
                      <div className="text-xs text-[#555] mt-1">{action.desc}</div>
                    </div>
                    <ArrowUpRight className="ml-auto text-[#333] group-hover:text-acid transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={18} />
                  </div>
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="p-5 border border-dashed border-[#333] text-center">
                <div className="text-xs text-[#555] uppercase tracking-widest mb-2">System Resources</div>
                <div className="flex justify-center gap-4 text-[#444]">
                  <Cpu size={16} />
                  <Radio size={16} />
                  <Database size={16} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RECENT LOGS */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg font-heading text-[#888] flex items-center gap-2"
            >
              <Activity size={18} />
              LATEST OPERATIONS
            </motion.h2>
            <Link href="/jobs" className="text-xs font-mono text-acid hover:underline">
              VIEW_ALL_LOGS
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="panel overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#222]">
                    <th className="pl-6">ID</th>
                    <th>TARGET_QUERY</th>
                    <th>PROTOCOL</th>
                    <th>STATUS</th>
                    <th className="pr-6">YIELD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151515]">
                  <AnimatePresence>
                    {loading ? (
                      [1, 2, 3].map(n => (
                        <tr key={n}>
                          <td colSpan={5} className="py-4 px-6"><div className="h-4 bg-[#111] animate-pulse w-full" /></td>
                        </tr>
                      ))
                    ) : recentJobs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#444] font-mono text-sm">
                          // NO ACTIVE OPERATIONS DETECTED
                        </td>
                      </tr>
                    ) : (
                      recentJobs.map((job) => (
                        <tr key={job.id} className="group">
                          <td className="pl-6 font-mono text-xs text-[#555] py-4 group-hover:text-white">#{job.id}</td>
                          <td className="font-medium text-white group-hover:text-acid transition-colors">{job.term}</td>
                          <td>
                            <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-[#111] border border-[#222] text-[#888]">
                              {job.source}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-none ${job.status === 'COMPLETED' ? 'bg-acid' :
                                  job.status === 'RUNNING' ? 'bg-amber-500 animate-pulse' :
                                    'bg-red-500'
                                }`} />
                              <span className={`text-xs font-mono ${job.status === 'COMPLETED' ? 'text-white' :
                                  job.status === 'RUNNING' ? 'text-amber-500' :
                                    'text-red-500'
                                }`}>{job.status}</span>
                            </div>
                          </td>
                          <td className="pr-6 font-mono text-sm text-[#888]">{job.count}</td>
                        </tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
