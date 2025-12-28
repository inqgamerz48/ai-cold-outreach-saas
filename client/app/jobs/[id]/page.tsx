'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Clock, Database, Users } from 'lucide-react';

interface JobData {
    id: number;
    status: string;
    term: string;
    source: string;
    createdAt: string;
    resultCount: number;
}

interface ResultItem {
    name: string;
    role?: string;
    phone?: string;
    company?: string;
    website?: string;
    gmapsUrl?: string;
    linkedinUrl?: string;
}

export default function JobDetailsPage() {
    const params = useParams();
    const jobId = params.id;

    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState<JobData | null>(null);
    const [results, setResults] = useState<ResultItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!jobId) return;

        const fetchJob = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/search/job/${jobId}`);
                const data = await res.json();

                if (data.status === 'success') {
                    setJob(data.job);
                    setResults(data.data || []);
                } else {
                    setError(data.error || 'Job not found');
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchJob();

        // Poll if job is still running
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/search/job/${jobId}`);
                const data = await res.json();
                if (data.status === 'success') {
                    setJob(data.job);
                    setResults(data.data || []);
                    if (data.job.status === 'COMPLETED' || data.job.status === 'FAILED') {
                        clearInterval(interval);
                    }
                }
            } catch (_e) { /* polling error ignored */ }
        }, 3000);

        return () => clearInterval(interval);
    }, [jobId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="text-emerald-400" size={20} />;
            case 'FAILED': return <XCircle className="text-red-400" size={20} />;
            case 'RUNNING': return <Loader2 className="text-amber-400 animate-spin" size={20} />;
            default: return <Clock className="text-slate-400" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-900/50 text-emerald-400 border-emerald-500/30';
            case 'FAILED': return 'bg-red-900/50 text-red-400 border-red-500/30';
            case 'RUNNING': return 'bg-amber-900/50 text-amber-400 border-amber-500/30';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <header className="mb-8">
                <Link href="/scraper" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Scraper
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Job #{jobId} Details
                </h1>
            </header>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-slate-500" size={32} />
                </div>
            ) : error ? (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-red-400">
                    <h3 className="font-semibold mb-2">Error Loading Job</h3>
                    <p>{error}</p>
                </div>
            ) : job ? (
                <div className="space-y-6">
                    {/* Job Info Card */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Status</p>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor(job.status)}`}>
                                    {getStatusIcon(job.status)}
                                    <span className="font-medium">{job.status}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Source</p>
                                <p className="text-white font-medium">{job.source}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Search Term</p>
                                <p className="text-white font-medium">{job.term}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Results Found</p>
                                <p className="text-white font-medium text-2xl">{job.resultCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                            {job.source === 'GOOGLE_MAPS' ? (
                                <Database className="text-blue-400" size={18} />
                            ) : (
                                <Users className="text-purple-400" size={18} />
                            )}
                            <h2 className="text-lg font-semibold text-white">
                                {job.source === 'GOOGLE_MAPS' ? 'Leads' : 'Personas'} ({results.length})
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Details</th>
                                        <th className="px-6 py-3">Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {results.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                                {job.status === 'RUNNING' ? 'Job is still running...' : 'No results found.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        results.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">
                                                    {item.name}
                                                    {item.role && <div className="text-xs text-slate-500">{item.role}</div>}
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 text-xs">
                                                    {item.phone || item.company || item.website || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(item.gmapsUrl || item.linkedinUrl) && (
                                                        <a
                                                            href={item.gmapsUrl || item.linkedinUrl}
                                                            target="_blank"
                                                            className="text-indigo-400 hover:underline text-xs"
                                                        >
                                                            View →
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
