'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Loader2, ExternalLink, Phone, Star, Globe,
    MapPin, Search, Download, RefreshCw, Filter, ArrowUpRight,
    Wand2, X, Copy, Check, Send
} from 'lucide-react';

interface Lead {
    id: number;
    name: string;
    phone?: string;
    website?: string;
    rating?: number;
    address?: string;
    gmapsUrl?: string;
    createdAt?: string;
    company?: string; // Optional if not in original type
}

interface GeneratedEmail {
    subject: string;
    body: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // AI Generation State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [userContext, setUserContext] = useState('');
    const [tone, setTone] = useState('professional');
    const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
    const [copied, setCopied] = useState(false);

    const fetchLeads = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/leads');
            if (res.ok) {
                const data = await res.json();
                if (data.leads) {
                    setLeads(data.leads);
                }
            } else {
                setLeads(getDemoLeads());
            }
        } catch {
            setLeads(getDemoLeads());
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getDemoLeads = (): Lead[] => [
        { id: 1, name: 'Joes Pizza', phone: '+1-212-555-0123', website: 'joespizza.com', rating: 4.5, address: '123 Broadway, NYC', gmapsUrl: '#' },
        { id: 2, name: 'Brooklyn Coffee', phone: '+1-212-555-0456', website: 'brooklyncoffee.com', rating: 4.8, address: '456 Atlantic Ave, Brooklyn', gmapsUrl: '#' },
        { id: 3, name: 'Manhattan Tacos', phone: '+1-212-555-0789', website: 'mantacos.com', rating: 4.2, address: '789 5th Ave, Manhattan', gmapsUrl: '#' },
        { id: 4, name: 'Downtown Sushi', phone: '+1-212-555-0321', website: 'downtownsushi.com', rating: 4.9, address: '321 Canal St, NYC', gmapsUrl: '#' },
        { id: 5, name: 'Williamsburg Bakery', phone: '+1-718-555-0654', website: 'wburgbakery.com', rating: 4.7, address: '654 Bedford Ave, Brooklyn', gmapsUrl: '#' },
    ];

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchLeads();
    };

    const handleGenerateEmail = async () => {
        if (!selectedLead) return;

        setIsGenerating(true);
        setGeneratedEmail(null);

        try {
            const res = await fetch('http://localhost:3001/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadName: selectedLead.name,
                    leadCompany: selectedLead.name, // Using name as company for GMap leads
                    userContext: userContext || 'We offer premium SEO services to help local businesses rank higher.',
                    tone
                })
            });

            const data = await res.json();
            if (data.status === 'success') {
                setGeneratedEmail(data.email);
            } else {
                alert('Generation failed: ' + data.error);
            }
        } catch (e) {
            alert('Failed to connect to backend');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedEmail) return;
        const text = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Name', 'Phone', 'Website', 'Rating', 'Address'];
        const csvContent = [
            headers.join(','),
            ...leads.map(lead =>
                [lead.name, lead.phone || '', lead.website || '', lead.rating || '', lead.address || ''].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads_export.csv';
        a.click();
    };

    return (
        <div className="relative min-h-screen">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
            </div>

            <div className="relative z-10 p-8">
                {/* Header */}
                <header className="mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3"
                    >
                        <Database className="text-blue-400" size={32} /> Leads Database
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400"
                    >
                        All extracted business leads from Google Maps and other sources.
                    </motion.p>
                </header>

                {/* Toolbar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center gap-4 mb-6"
                >
                    {/* Search */}
                    <div className="relative flex-1 min-w-[250px] max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search leads..."
                            className="w-full input-modern py-3 pl-11 pr-4 text-white text-sm"
                        />
                    </div>

                    {/* Stats */}
                    <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="text-slate-500 text-sm">Total:</span>
                        <span className="font-bold text-white">{leads.length}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-3 glass rounded-xl hover:bg-slate-800/50 transition-all"
                        >
                            <RefreshCw className={`text-slate-400 ${refreshing ? 'animate-spin' : ''}`} size={18} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 glass rounded-xl hover:bg-slate-800/50 transition-all"
                        >
                            <Filter className="text-slate-400" size={18} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-3 btn-primary rounded-xl text-sm font-medium"
                        >
                            <Download size={16} />
                            Export CSV
                        </motion.button>
                    </div>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card-modern overflow-x-auto"
                >
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Business Name</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Website</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map((n) => (
                                        <motion.tr key={n} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            {[1, 2, 3, 4, 5, 6].map((c) => (
                                                <td key={c} className="px-6 py-4">
                                                    <span className="skeleton h-4 w-20 inline-block" />
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))
                                ) : filteredLeads.length === 0 ? (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                                    <Database className="text-slate-600" size={32} />
                                                </div>
                                                <p className="text-slate-500">No leads found. Run a Google Maps scrape to populate this.</p>
                                                <motion.a
                                                    href="/scraper/google-maps"
                                                    whileHover={{ scale: 1.05 }}
                                                    className="px-4 py-2 btn-primary rounded-lg text-sm"
                                                >
                                                    Start Scraping
                                                </motion.a>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    filteredLeads.map((lead, i) => (
                                        <motion.tr
                                            key={lead.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="table-row-hover group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                                                    {lead.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-2 text-slate-400">
                                                    <Phone size={14} className="text-emerald-400" />
                                                    {lead.phone || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.website ? (
                                                    <a
                                                        href={`https://${lead.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                                    >
                                                        <Globe size={14} /> {lead.website}
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-600">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.rating ? (
                                                    <span className="flex items-center gap-1 text-amber-400">
                                                        <Star size={14} fill="currentColor" /> {lead.rating}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-2 text-slate-400">
                                                    <MapPin size={14} className="text-rose-400" />
                                                    <span className="truncate max-w-[200px]">{lead.address || 'N/A'}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setSelectedLead(lead)}
                                                        className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"
                                                        title="Generate AI Email"
                                                    >
                                                        <Wand2 size={16} />
                                                    </motion.button>
                                                    <a
                                                        href={lead.gmapsUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-all"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </motion.div>

                {/* AI Email Generation Modal */}
                <AnimatePresence>
                    {selectedLead && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                                            <Wand2 className="text-indigo-400" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Generate Outreach Email</h2>
                                            <p className="text-sm text-slate-400">For {selectedLead.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                    {!generatedEmail ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">My Offering (Context)</label>
                                                <textarea
                                                    value={userContext}
                                                    onChange={(e) => setUserContext(e.target.value)}
                                                    placeholder="Describe what you are selling or offering..."
                                                    className="w-full input-modern p-4 text-white min-h-[100px]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Tone</label>
                                                <div className="flex gap-2">
                                                    {['professional', 'casual', 'friendly', 'urgent'].map((t) => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setTone(t)}
                                                            className={`px-4 py-2 rounded-lg text-sm border capitalize ${tone === t
                                                                ? 'bg-indigo-500 border-indigo-500 text-white'
                                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                                }`}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleGenerateEmail}
                                                disabled={isGenerating || !userContext}
                                                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 font-bold"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <Loader2 className="animate-spin" /> Generating Magic...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 size={18} /> Generate Email
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                                                <input
                                                    value={generatedEmail.subject}
                                                    readOnly
                                                    className="w-full input-modern p-3 text-white font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Body</label>
                                                <textarea
                                                    value={generatedEmail.body}
                                                    readOnly
                                                    className="w-full input-modern p-4 text-white min-h-[300px] font-mono text-sm leading-relaxed"
                                                />
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={copyToClipboard}
                                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    {copied ? <Check className="text-emerald-400" /> : <Copy size={18} />}
                                                    {copied ? 'Copied!' : 'Copy to Clipboard'}
                                                </button>
                                                <button
                                                    onClick={() => setGeneratedEmail(null)}
                                                    className="px-6 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
                                                >
                                                    Try Again
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
