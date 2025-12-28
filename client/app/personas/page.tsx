'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Loader2, Linkedin, Building, Mail, Search,
    RefreshCw, Download, UserCircle, ExternalLink, Briefcase
} from 'lucide-react';

interface Persona {
    id: number;
    name: string;
    role?: string;
    company?: string;
    email?: string;
    linkedinUrl?: string;
    source: string;
    createdAt?: string;
}

export default function PersonasPage() {
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchPersonas = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/personas');
            if (res.ok) {
                const data = await res.json();
                if (data.personas) {
                    setPersonas(data.personas);
                }
            } else {
                setPersonas(getDemoPersonas());
            }
        } catch {
            setPersonas(getDemoPersonas());
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getDemoPersonas = (): Persona[] => [
        { id: 1, name: 'Sarah Chen', role: 'Founder & CEO', company: 'TechStartup Inc', email: 'sarah@techstartup.com', linkedinUrl: '#', source: 'LINKEDIN' },
        { id: 2, name: 'Mike Johnson', role: 'Growth Lead', company: 'SaaS Corp', email: 'mike@saascorp.com', linkedinUrl: '#', source: 'REDDIT' },
        { id: 3, name: 'Emily Davis', role: 'Marketing Director', company: 'Digital Agency', email: 'emily@digitalagency.com', linkedinUrl: '#', source: 'LINKEDIN' },
        { id: 4, name: 'Alex Thompson', role: 'VP of Sales', company: 'Enterprise Solutions', email: 'alex@enterprise.com', linkedinUrl: '#', source: 'LINKEDIN' },
        { id: 5, name: 'Rachel Green', role: 'Product Manager', company: 'Tech Giants', email: 'rachel@techgiants.com', linkedinUrl: '#', source: 'TWITTER' },
    ];

    useEffect(() => {
        fetchPersonas();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPersonas();
    };

    const filteredPersonas = personas.filter(persona =>
        persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Name', 'Role', 'Company', 'Email', 'Source'];
        const csvContent = [
            headers.join(','),
            ...personas.map(p =>
                [p.name, p.role || '', p.company || '', p.email || '', p.source].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'personas_export.csv';
        a.click();
    };

    const getSourceBadge = (source: string) => {
        switch (source) {
            case 'LINKEDIN':
                return <span className="px-3 py-1 text-xs rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/30 flex items-center gap-1"><Linkedin size={12} /> LinkedIn</span>;
            case 'REDDIT':
                return <span className="px-3 py-1 text-xs rounded-full bg-orange-900/30 text-orange-400 border border-orange-500/30">Reddit</span>;
            case 'TWITTER':
                return <span className="px-3 py-1 text-xs rounded-full bg-sky-900/30 text-sky-400 border border-sky-500/30">Twitter</span>;
            default:
                return <span className="px-3 py-1 text-xs rounded-full glass">{source}</span>;
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="orb orb-1" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
                <div className="orb orb-2" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 p-8">
                {/* Header */}
                <header className="mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3"
                    >
                        <Users className="text-purple-400" size={32} /> Personas Database
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400"
                    >
                        Decision-makers and contacts extracted from LinkedIn, Reddit, and Twitter.
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
                            placeholder="Search personas..."
                            className="w-full input-modern py-3 pl-11 pr-4 text-white text-sm"
                        />
                    </div>

                    {/* Stats */}
                    <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="text-slate-500 text-sm">Total:</span>
                        <span className="font-bold text-white">{personas.length}</span>
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
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-3 btn-primary rounded-xl text-sm font-medium"
                        >
                            <Download size={16} />
                            Export CSV
                        </motion.button>
                    </div>
                </motion.div>

                {/* Cards Grid */}
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <motion.div
                                    key={n}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="card-modern p-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="skeleton w-16 h-16 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="skeleton h-5 w-32" />
                                            <div className="skeleton h-4 w-24" />
                                            <div className="skeleton h-4 w-40" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : filteredPersonas.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="card-modern p-16 text-center"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                                    <Users className="text-slate-600" size={40} />
                                </div>
                                <p className="text-slate-500">No personas found. Run a LinkedIn or Reddit scrape to populate this.</p>
                                <motion.a
                                    href="/scraper/linkedin"
                                    whileHover={{ scale: 1.05 }}
                                    className="px-4 py-2 btn-primary rounded-lg text-sm"
                                >
                                    Start LinkedIn Scrape
                                </motion.a>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPersonas.map((persona, i) => (
                                <motion.div
                                    key={persona.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -4 }}
                                    className="card-modern p-6 group"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                            <UserCircle className="text-white" size={32} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                                                {persona.name}
                                            </h3>
                                            {persona.role && (
                                                <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                                    <Briefcase size={12} className="text-indigo-400" />
                                                    {persona.role}
                                                </p>
                                            )}
                                            {persona.company && (
                                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                                    <Building size={12} className="text-slate-600" />
                                                    {persona.company}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-2">
                                        {persona.email && (
                                            <a
                                                href={`mailto:${persona.email}`}
                                                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-colors"
                                            >
                                                <Mail size={14} /> {persona.email}
                                            </a>
                                        )}

                                        <div className="flex items-center justify-between">
                                            {getSourceBadge(persona.source)}

                                            {persona.linkedinUrl && (
                                                <a
                                                    href={persona.linkedinUrl}
                                                    target="_blank"
                                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm transition-colors"
                                                >
                                                    <ExternalLink size={14} /> Profile
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
