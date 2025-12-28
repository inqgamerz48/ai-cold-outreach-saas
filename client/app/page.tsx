'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Loader2, TrendingUp, Users, MapPin, Zap, Activity,
  ArrowUpRight, RefreshCw, Sparkles, Clock, CheckCircle
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

        // Try to fetch real stats from jobs endpoint
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

              // Show last 5 jobs
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

        // Try to fetch leads count
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

        // Try to fetch personas count
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
      // Use demo data when backend is offline
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
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const statCards = [
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
      bgGlow: 'glow-cyan',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Personas',
      value: stats.totalPersonas,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgGlow: 'glow',
      trend: '+8%',
      trendUp: true
    },
    {
      label: 'Active Jobs',
      value: stats.activeJobs,
      icon: Activity,
      color: 'from-amber-500 to-orange-500',
      bgGlow: 'glow-amber',
      trend: 'Live',
      trendUp: null
    },
    {
      label: 'Completed',
      value: stats.completedJobs,
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      bgGlow: 'glow-emerald',
      trend: '+23%',
      trendUp: true
    },
  ];

  const quickActions = [
    { href: '/scraper/google-maps', label: 'Google Maps Search', icon: MapPin, color: 'from-blue-600 to-blue-500', description: 'Find local businesses' },
    { href: '/scraper/linkedin', label: 'LinkedIn Scrape', icon: Users, color: 'from-indigo-600 to-indigo-500', description: 'Find decision makers' },
    { href: '/scraper/reddit', label: 'Reddit Discovery', icon: Zap, color: 'from-orange-600 to-orange-500', description: 'Find potential leads' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'badge-success';
      case 'FAILED': return 'badge-error';
      case 'RUNNING': return 'badge-warning';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3"
              >
                <Sparkles className="text-indigo-400" size={32} />
                Mission Control
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-slate-400"
              >
                Overview of your lead generation operations.
              </motion.p>
            </div>
            <div className="flex items-center gap-4">
              {/* Backend Status */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`px-4 py-2 rounded-full glass flex items-center gap-2 text-sm ${backendStatus === 'online' ? 'text-emerald-400' :
                    backendStatus === 'offline' ? 'text-red-400' : 'text-amber-400'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400 animate-pulse' :
                    backendStatus === 'offline' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'
                  }`} />
                Backend: {backendStatus}
              </motion.div>
              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 glass rounded-xl hover:bg-slate-800/50 transition-all"
              >
                <RefreshCw className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} size={20} />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`card-modern shimmer p-6 ${stat.bgGlow}`}
            >
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                >
                  <stat.icon className="text-white" size={26} />
                </motion.div>
                {stat.trend && (
                  <span className={`text-xs px-2 py-1 rounded-full ${stat.trendUp === true ? 'bg-emerald-900/50 text-emerald-400' :
                      stat.trendUp === false ? 'bg-red-900/50 text-red-400' :
                        'bg-amber-900/50 text-amber-400 animate-pulse'
                    }`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-4xl font-bold text-white">
                {loading ? (
                  <span className="skeleton h-10 w-20 inline-block" />
                ) : (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={stat.value}
                  >
                    {stat.value.toLocaleString()}
                  </motion.span>
                )}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="text-amber-400" size={20} />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="group flex items-center gap-4 p-5 card-modern glow-hover"
                >
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <action.icon className="text-white" size={24} />
                  </motion.div>
                  <div className="flex-1">
                    <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.description}</p>
                  </div>
                  <ArrowUpRight className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={20} />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="text-indigo-400" size={20} />
              Recent Jobs
            </h2>
            <Link href="/jobs" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-800">
                <tr>
                  <th className="pb-4 pr-4">ID</th>
                  <th className="pb-4 pr-4">Search Term</th>
                  <th className="pb-4 pr-4">Source</th>
                  <th className="pb-4 pr-4">Status</th>
                  <th className="pb-4">Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    [1, 2, 3].map((n) => (
                      <motion.tr key={n} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td className="py-4 pr-4"><span className="skeleton h-4 w-8 inline-block" /></td>
                        <td className="py-4 pr-4"><span className="skeleton h-4 w-32 inline-block" /></td>
                        <td className="py-4 pr-4"><span className="skeleton h-4 w-20 inline-block" /></td>
                        <td className="py-4 pr-4"><span className="skeleton h-4 w-16 inline-block" /></td>
                        <td className="py-4"><span className="skeleton h-4 w-8 inline-block" /></td>
                      </motion.tr>
                    ))
                  ) : recentJobs.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No jobs yet. Start a scrape to see results here!
                      </td>
                    </motion.tr>
                  ) : (
                    recentJobs.map((job, i) => (
                      <motion.tr
                        key={job.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        className="table-row-hover"
                      >
                        <td className="py-4 pr-4 text-slate-400">#{job.id}</td>
                        <td className="py-4 pr-4 font-medium text-white">{job.term}</td>
                        <td className="py-4 pr-4">
                          <span className="px-3 py-1 text-xs rounded-full glass">
                            {job.source}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1.5 w-fit ${getStatusColor(job.status)}`}>
                            {job.status === 'COMPLETED' && <CheckCircle size={12} />}
                            {job.status === 'RUNNING' && <Loader2 size={12} className="animate-spin" />}
                            {job.status}
                          </span>
                        </td>
                        <td className="py-4 text-slate-400">{job.count}</td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
