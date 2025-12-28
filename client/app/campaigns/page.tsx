'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Mail, Send, Clock, CheckCircle, Pause, Play,
    Plus, Target, Users, BarChart3, ArrowRight, Loader2
} from 'lucide-react';

interface Campaign {
    id: number;
    name: string;
    status: string;
    emailsSent: number;
    repliesCount: number;
    createdAt: string;
    emailLogs: any[];
}

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/campaigns');
            const data = await res.json();
            if (data.status === 'success') {
                setCampaigns(data.campaigns);
            }
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return <span className="badge-success px-3 py-1 rounded-full text-xs flex items-center gap-1"><Play size={10} /> Active</span>;
            case 'paused':
                return <span className="badge-warning px-3 py-1 rounded-full text-xs flex items-center gap-1"><Pause size={10} /> Paused</span>;
            case 'completed':
                return <span className="px-3 py-1 rounded-full text-xs bg-blue-900/30 text-blue-400 border border-blue-500/30 flex items-center gap-1"><CheckCircle size={10} /> Completed</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs glass flex items-center gap-1"><Clock size={10} /> Draft</span>;
        }
    };

    const totalSent = campaigns.reduce((a, c) => a + c.emailsSent, 0);
    const totalOpened = campaigns.reduce((a, c) => a + c.emailLogs.filter(l => l.opened).length, 0);
    const totalReplied = campaigns.reduce((a, c) => a + c.repliesCount, 0);

    const stats = [
        { label: 'Total Campaigns', value: campaigns.length, icon: Mail, color: 'from-indigo-500 to-purple-500' },
        { label: 'Emails Sent', value: totalSent, icon: Send, color: 'from-blue-500 to-cyan-500' },
        { label: 'Open Rate', value: totalSent > 0 ? `${Math.round(totalOpened / totalSent * 100)}%` : '0%', icon: BarChart3, color: 'from-emerald-500 to-green-500' },
        { label: 'Reply Rate', value: totalSent > 0 ? `${Math.round(totalReplied / totalSent * 100)}%` : '0%', icon: CheckCircle, color: 'from-amber-500 to-orange-500' },
    ];

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="orb orb-1" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
                <div className="orb orb-2" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 p-8">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3"
                            >
                                <Mail className="text-indigo-400" size={32} /> Email Campaigns
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-slate-400"
                            >
                                Create and manage your cold email outreach campaigns.
                            </motion.p>
                        </div>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push('/campaigns/new')}
                            className="flex items-center gap-2 px-5 py-3 btn-primary rounded-xl font-medium"
                        >
                            <Plus size={18} />
                            New Campaign
                        </motion.button>
                    </div>
                </header>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="card-modern p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="text-white" size={22} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Campaigns List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Target className="text-indigo-400" size={20} />
                        All Campaigns
                    </h2>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-indigo-400" size={32} />
                        </div>
                    ) : campaigns.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="card-modern p-12 text-center"
                        >
                            <Mail className="mx-auto text-slate-600 mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-white mb-2">No campaigns yet</h3>
                            <p className="text-slate-400 mb-6">Create your first campaign to start sending personalized emails.</p>
                            <button
                                onClick={() => router.push('/campaigns/new')}
                                className="px-6 py-3 btn-primary rounded-xl inline-flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Create Campaign
                            </button>
                        </motion.div>
                    ) : (
                        campaigns.map((campaign, i) => (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.05 }}
                                whileHover={{ x: 4 }}
                                onClick={() => router.push(`/campaigns/${campaign.id}`)}
                                className="card-modern p-6 group cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${campaign.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                                            campaign.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-slate-800 text-slate-400'
                                            }`}>
                                            <Mail size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                                {campaign.name}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Users size={12} /> Status: {campaign.status}
                                                </span>
                                                <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="text-white font-semibold">{campaign.emailsSent}</p>
                                                <p className="text-slate-500 text-xs">Sent</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-emerald-400 font-semibold">{campaign.emailLogs.filter(l => l.opened).length}</p>
                                                <p className="text-slate-500 text-xs">Opened</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-blue-400 font-semibold">{campaign.repliesCount}</p>
                                                <p className="text-slate-500 text-xs">Replied</p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {getStatusBadge(campaign.status)}

                                        {/* Arrow */}
                                        <ArrowRight className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    );
}
