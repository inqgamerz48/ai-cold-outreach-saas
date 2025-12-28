'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, PieChart, TrendingUp, Mail, MessageSquare,
    ThumbsUp, ThumbsDown, HelpCircle, Loader2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';

interface Analytics {
    totalCampaigns: number;
    totalSent: number;
    totalOpened: number;
    totalReplied: number;
    openRate: number;
    replyRate: number;
    sentimentBreakdown: {
        positive: number;
        neutral: number;
        negative: number;
    };
    intentBreakdown: {
        interested: number;
        notInterested: number;
        question: number;
        unknown: number;
    };
    campaignPerformance: {
        id: number;
        name: string;
        sent: number;
        opened: number;
        replied: number;
        openRate: number;
        replyRate: number;
    }[];
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/analytics');
            const data = await res.json();
            if (data.status === 'success') {
                setAnalytics(data.analytics);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-indigo-400" size={48} />
            </div>
        );
    }

    const sentimentData = analytics ? [
        { name: 'Positive', value: analytics.sentimentBreakdown.positive, color: '#10b981' },
        { name: 'Neutral', value: analytics.sentimentBreakdown.neutral, color: '#6366f1' },
        { name: 'Negative', value: analytics.sentimentBreakdown.negative, color: '#ef4444' },
    ] : [];

    const intentData = analytics ? [
        { name: 'Interested', value: analytics.intentBreakdown.interested, color: '#10b981' },
        { name: 'Question', value: analytics.intentBreakdown.question, color: '#f59e0b' },
        { name: 'Not Interested', value: analytics.intentBreakdown.notInterested, color: '#ef4444' },
        { name: 'Unknown', value: analytics.intentBreakdown.unknown, color: '#64748b' },
    ] : [];

    const campaignData = analytics?.campaignPerformance || [];

    const stats = analytics ? [
        { label: 'Total Campaigns', value: analytics.totalCampaigns, icon: BarChart3, color: 'from-indigo-500 to-purple-500' },
        { label: 'Emails Sent', value: analytics.totalSent, icon: Mail, color: 'from-blue-500 to-cyan-500' },
        { label: 'Open Rate', value: `${analytics.openRate}%`, icon: TrendingUp, color: 'from-emerald-500 to-green-500' },
        { label: 'Reply Rate', value: `${analytics.replyRate}%`, icon: MessageSquare, color: 'from-amber-500 to-orange-500' },
    ] : [];

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="orb orb-1" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 p-8 max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Dashboard
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3"
                    >
                        <BarChart3 className="text-indigo-400" size={32} /> Analytics
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400"
                    >
                        Campaign performance metrics and insights.
                    </motion.p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card-modern p-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="text-white" size={26} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Campaign Performance Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card-modern p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="text-indigo-400" size={20} /> Campaign Performance
                        </h2>
                        {campaignData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={campaignData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="sent" name="Sent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="replied" name="Replied" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-slate-500">
                                No campaign data yet
                            </div>
                        )}
                    </motion.div>

                    {/* Sentiment Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="card-modern p-6"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <PieChart className="text-indigo-400" size={20} /> Reply Sentiment
                        </h2>
                        {sentimentData.some(d => d.value > 0) ? (
                            <div className="flex items-center">
                                <ResponsiveContainer width="60%" height={250}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={sentimentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            dataKey="value"
                                            label
                                        >
                                            {sentimentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <ThumbsUp className="text-emerald-400" size={16} />
                                        <span className="text-sm text-slate-400">Positive: {analytics?.sentimentBreakdown.positive || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HelpCircle className="text-indigo-400" size={16} />
                                        <span className="text-sm text-slate-400">Neutral: {analytics?.sentimentBreakdown.neutral || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ThumbsDown className="text-red-400" size={16} />
                                        <span className="text-sm text-slate-400">Negative: {analytics?.sentimentBreakdown.negative || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-slate-500">
                                No reply data yet
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Campaign List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card-modern p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Campaign Breakdown</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-slate-500 uppercase border-b border-slate-800">
                                <tr>
                                    <th className="pb-4">Campaign</th>
                                    <th className="pb-4 text-right">Sent</th>
                                    <th className="pb-4 text-right">Opened</th>
                                    <th className="pb-4 text-right">Replied</th>
                                    <th className="pb-4 text-right">Open Rate</th>
                                    <th className="pb-4 text-right">Reply Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {campaignData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            No campaigns yet. Create your first campaign to see analytics.
                                        </td>
                                    </tr>
                                ) : (
                                    campaignData.map(campaign => (
                                        <tr key={campaign.id} className="table-row-hover">
                                            <td className="py-4 font-medium text-white">{campaign.name}</td>
                                            <td className="py-4 text-right text-slate-400">{campaign.sent}</td>
                                            <td className="py-4 text-right text-slate-400">{campaign.opened}</td>
                                            <td className="py-4 text-right text-slate-400">{campaign.replied}</td>
                                            <td className="py-4 text-right">
                                                <span className="text-emerald-400">{campaign.openRate}%</span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className="text-indigo-400">{campaign.replyRate}%</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
