'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Loader2, CheckCircle, XCircle, Clock, Search,
    RefreshCw, BarChart3, ArrowUpRight, Play, MapPin, Linkedin, Hash
} from 'lucide-react';

interface Job {
    id: number;
    status: string;
    searchTerm: string;
    source: string;
    createdAt: string;
    resultCount: number;
    updatedAt?: string;
    error?: string;
}

export default function JobsListPage() {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchJobs = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/jobs');
            if (res.ok) {
                const data = await res.json();
                if (data.jobs) {
                    setJobs(data.jobs);
                }
            } else {
                setJobs(getDemoJobs());
            }
        } catch {
            setJobs(getDemoJobs());
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getDemoJobs = (): Job[] => [
        { id: 35, status: 'COMPLETED', searchTerm: 'Coffee Shops in Austin', source: 'GOOGLE_MAPS', createdAt: '2024-12-27T10:30:00Z', resultCount: 10 },
        { id: 34, status: 'COMPLETED', searchTerm: 'Digital Agencies in Brooklyn', source: 'GOOGLE_MAPS', createdAt: '2024-12-27T09:15:00Z', resultCount: 10 },
        { id: 33, status: 'RUNNING', searchTerm: 'SaaS Founders Bay Area', source: 'LINKEDIN', createdAt: '2024-12-27T08:00:00Z', resultCount: 0 },
        { id: 32, status: 'COMPLETED', searchTerm: 'AI Tools Discussion', source: 'REDDIT', createdAt: '2024-12-26T15:00:00Z', resultCount: 25 },
        { id: 31, status: 'FAILED', searchTerm: 'Test Search', source: 'GOOGLE_MAPS', createdAt: '2024-12-26T12:00:00Z', resultCount: 0, error: 'Timeout' },
    ];

    useEffect(() => {
        fetchJobs();
        // Poll every 10 seconds for active jobs
        const interval = setInterval(fetchJobs, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const filteredJobs = jobs.filter(job =>
        job.searchTerm.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.source.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="text-emerald-400" size={16} />;
            case 'FAILED': return <XCircle className="text-red-400" size={16} />;
            case 'RUNNING': return <Loader2 className="text-amber-400 animate-spin" size={16} />;
            case 'PENDING': return <Play className="text-blue-400" size={16} />;
            default: return <Clock className="text-slate-400" size={16} />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'badge-success';
            case 'FAILED': return 'badge-error';
            case 'RUNNING': return 'badge-warning';
            default: return 'glass';
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'GOOGLE_MAPS': return <MapPin size={14} className="text-blue-400" />;
            case 'LINKEDIN': return <Linkedin size={14} className="text-indigo-400" />;
            case 'REDDIT': return <Hash size={14} className="text-orange-400" />;
            default: return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Stats
    const completedCount = jobs.filter(j => j.status === 'COMPLETED').length;
    const runningCount = jobs.filter(j => j.status === 'RUNNING' || j.status === 'PENDING').length;
    const totalResults = jobs.reduce((acc, j) => acc + (j.resultCount || 0), 0);

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
            </div>

            <div className="relative z-10 p-8">
                {/* Header */}
                <header className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3"
                    >
                        <BarChart3 className="text-indigo-400" size={32} /> Job History
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400"
                    >
                        History of all scraping jobs and their results.
                    </motion.p>
                </header>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
                >
                    <div className="glass p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="text-emerald-400" size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Completed</p>
                            <p className="text-xl font-bold text-white">{completedCount}</p>
                        </div>
                    </div>
                    <div className="glass p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Loader2 className="text-amber-400" size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Running</p>
                            <p className="text-xl font-bold text-white">{runningCount}</p>
                        </div>
                    </div>
                    <div className="glass p-4 rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <BarChart3 className="text-blue-400" size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Total Results</p>
                            <p className="text-xl font-bold text-white">{totalResults}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Toolbar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center gap-4 mb-6"
                >
                    <div className="relative flex-1 min-w-[250px] max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search jobs..."
                            className="w-full input-modern py-3 pl-11 pr-4 text-white text-sm"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-3 glass rounded-xl hover:bg-slate-800/50 transition-all"
                    >
                        <RefreshCw className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} size={18} />
                    </motion.button>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card-modern overflow-hidden"
                >
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Search Term</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Results</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map((n) => (
                                        <motion.tr key={n} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                                                <td key={c} className="px-6 py-4">
                                                    <span className="skeleton h-4 w-16 inline-block" />
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))
                                ) : filteredJobs.length === 0 ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                                    <BarChart3 className="text-slate-600" size={32} />
                                                </div>
                                                <p className="text-slate-500">No jobs found. Start a scrape to see results here.</p>
                                                <motion.a
                                                    href="/scraper"
                                                    whileHover={{ scale: 1.05 }}
                                                    className="px-4 py-2 btn-primary rounded-lg text-sm"
                                                >
                                                    Go to Scraper
                                                </motion.a>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    filteredJobs.map((job, i) => (
                                        <motion.tr
                                            key={job.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="table-row-hover group"
                                        >
                                            <td className="px-6 py-4 text-slate-400">#{job.id}</td>
                                            <td className="px-6 py-4 font-medium text-white group-hover:text-indigo-300 transition-colors">
                                                {job.searchTerm}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 text-xs rounded-full glass flex items-center gap-1.5 w-fit">
                                                    {getSourceIcon(job.source)}
                                                    {job.source.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs rounded-full flex items-center gap-1.5 w-fit ${getStatusBadge(job.status)}`}>
                                                    {getStatusIcon(job.status)}
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-semibold ${job.resultCount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                    {job.resultCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {formatDate(job.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/jobs/${job.id}`}
                                                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors text-sm"
                                                >
                                                    Details <ArrowUpRight size={14} />
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </motion.div>
            </div>
        </div>
    );
}
