'use client';

import { Hash, ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function RedditScraperPage() {
    const [subreddits, setSubreddits] = useState('');
    const [keywords, setKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [lastJobId, setLastJobId] = useState<number | null>(null);

    const handleSubmit = async () => {
        if (!subreddits || !keywords) return;

        setLoading(true);
        setStatus('Queueing...');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/search/reddit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subreddits: subreddits.split(',').map(s => s.trim()),
                    keywords: keywords.split(',').map(s => s.trim()),
                    limit: 25
                })
            });

            const data = await res.json();
            if (data.status === 'queued') {
                setLastJobId(data.jobId);
                setStatus(`Job #${data.jobId} Queued! Processing...`);
                pollJob(data.jobId);
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (e) {
            setStatus(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const pollJob = async (id: number) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/search/job/${id}`);
                const data = await res.json();
                if (data.status === 'success') {
                    if (data.job.status === 'COMPLETED' || data.job.status === 'FAILED') {
                        setStatus(`Job #${id} ${data.job.status}: Found ${data.job.resultCount} results`);
                        clearInterval(interval);
                    } else {
                        setStatus(`Job #${id} is ${data.job.status}...`);
                    }
                }
            } catch (_e) { /* polling error ignored */ }
        }, 2000);
    };

    return (
        <div className="p-8">
            <header className="mb-8">
                <Link href="/scraper" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Multi-Scraper
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Hash className="text-orange-500" /> Reddit Scraper
                </h1>
                <p className="text-slate-400">Discover leads and discussions from Reddit communities.</p>
            </header>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 max-w-2xl">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Subreddits (comma separated)</label>
                        <input
                            type="text"
                            value={subreddits}
                            onChange={(e) => setSubreddits(e.target.value)}
                            placeholder="e.g. startups, entrepreneur, saas"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Keywords (comma separated)</label>
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="e.g. looking for tool, need help with"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !subreddits || !keywords}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <MessageCircle size={20} />}
                        <span>{loading ? 'Processing...' : 'Start Reddit Discovery'}</span>
                    </button>
                </div>
            </div>

            {status && (
                <div className="mt-8 p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-2xl">
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">Job Status</h3>
                    <div className="flex items-center space-x-3 text-emerald-400">
                        <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span>{status}</span>
                    </div>
                    {lastJobId && (
                        <Link href={`/jobs/${lastJobId}`} className="text-sm text-indigo-400 hover:underline mt-2 inline-block">
                            View Job Details →
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
