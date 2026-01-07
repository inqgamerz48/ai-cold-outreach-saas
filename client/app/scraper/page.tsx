'use client';

import { useState } from 'react';
import { Search, MapPin, Hash, Linkedin, Database, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ScraperPage() {
    const [activeTab, setActiveTab] = useState<'maps' | 'reddit' | 'linkedin'>('maps');
    const [loading, setLoading] = useState(false);
    const [lastJobId, setLastJobId] = useState<number | null>(null);
    const [status, setStatus] = useState<string>('');

    // Form States
    const [mapsTerm, setMapsTerm] = useState('');
    const [redditKeywords, setRedditKeywords] = useState('');
    const [redditSubs, setRedditSubs] = useState('');
    const [linkedinKeywords, setLinkedinKeywords] = useState('');
    const [linkedinLocation, setLinkedinLocation] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setStatus('Queueing...');
        setLastJobId(null);

        try {
            let endpoint = '';
            let body = {};

            if (activeTab === 'maps') {
                endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/search/maps`;
                body = { term: mapsTerm };
            } else if (activeTab === 'reddit') {
                endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/search/reddit`;
                body = {
                    keywords: redditKeywords.split(',').map(s => s.trim()),
                    subreddits: redditSubs.split(',').map(s => s.trim()),
                    limit: 10
                };
            } else if (activeTab === 'linkedin') {
                endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/search/linkedin`;
                body = { keywords: linkedinKeywords, location: linkedinLocation };
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (data.status === 'queued') {
                setLastJobId(data.jobId);
                setStatus(`Job #${data.jobId} Queued! Polling for results...`);
                pollJob(data.jobId);
            } else {
                setStatus(`Error: ${data.error}`);
            }

        } catch (e) {
            setStatus(`Network Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
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
            } catch (e) {
                console.error(e);
            }
        }, 2000);
    };

    return (
        <div className="p-8">
            {/* Header */}
            <header className="mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">Universal Scraper Engine</h1>
                <p className="text-slate-400">Launch data extraction missions across multiple platforms.</p>
            </header>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8">
                <button
                    onClick={() => setActiveTab('maps')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all border ${activeTab === 'maps' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                    <MapPin size={18} />
                    <span>Google Maps</span>
                </button>
                <button
                    onClick={() => setActiveTab('reddit')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all border ${activeTab === 'reddit' ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                    <Hash size={18} />
                    <span>Reddit</span>
                </button>
                <button
                    onClick={() => setActiveTab('linkedin')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all border ${activeTab === 'linkedin' ? 'bg-blue-700/20 border-blue-600 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                    <Linkedin size={18} />
                    <span>LinkedIn</span>
                </button>
            </div>

            {/* Card */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl max-w-2xl">
                <div className="space-y-6">

                    {activeTab === 'maps' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Search Term</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    value={mapsTerm}
                                    onChange={(e) => setMapsTerm(e.target.value)}
                                    placeholder="e.g. Italian Restaurants in NYC"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'reddit' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Subreddits (comma separated)</label>
                                <input
                                    type="text"
                                    value={redditSubs}
                                    onChange={(e) => setRedditSubs(e.target.value)}
                                    placeholder="e.g. startups, entrepreneur, saas"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Keywords</label>
                                <input
                                    type="text"
                                    value={redditKeywords}
                                    onChange={(e) => setRedditKeywords(e.target.value)}
                                    placeholder="e.g. 'looking for tool', 'how to scrape'"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'linkedin' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Context / Keywords</label>
                                <input
                                    type="text"
                                    value={linkedinKeywords}
                                    onChange={(e) => setLinkedinKeywords(e.target.value)}
                                    placeholder="e.g. Marketing Director"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Location (Optional)</label>
                                <input
                                    type="text"
                                    value={linkedinLocation}
                                    onChange={(e) => setLinkedinLocation(e.target.value)}
                                    placeholder="e.g. San Francisco, CA"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Database size={20} />}
                        <span>{loading ? 'Processing...' : 'Start Extraction Job'}</span>
                    </button>
                </div>
            </div>

            {/* Status Area */}
            {status && (
                <div className="mt-8 p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-2xl animate-in fade-in slide-in-from-bottom-4">
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
