'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Mail, Eye, MessageSquare, Users, Target, Activity } from 'lucide-react';

const API_URL = 'http://localhost:3001';

interface Analytics {
    totalCampaigns: number;
    totalSent: number;
    totalOpened: number;
    totalReplied: number;
    openRate: number;
    replyRate: number;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    intentBreakdown: { interested: number; notInterested: number; question: number; unknown: number };
    campaignPerformance: Array<{
        id: number;
        name: string;
        sent: number;
        opened: number;
        replied: number;
        openRate: number;
        replyRate: number;
    }>;
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`${API_URL}/api/analytics`);
            const data = await res.json();
            setAnalytics(data.analytics);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#10B981', '#6B7280', '#EF4444'];
    const INTENT_COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#6B7280'];

    const sentimentData = analytics ? [
        { name: 'Positive', value: analytics.sentimentBreakdown.positive },
        { name: 'Neutral', value: analytics.sentimentBreakdown.neutral },
        { name: 'Negative', value: analytics.sentimentBreakdown.negative }
    ] : [];

    const intentData = analytics ? [
        { name: 'Interested', value: analytics.intentBreakdown.interested },
        { name: 'Not Interested', value: analytics.intentBreakdown.notInterested },
        { name: 'Question', value: analytics.intentBreakdown.question },
        { name: 'Unknown', value: analytics.intentBreakdown.unknown }
    ] : [];

    const StatCard = ({ icon: Icon, label, value, subtext, color }: {
        icon: React.ElementType; label: string; value: string | number; subtext?: string; color: string;
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-gray-800/50 border border-gray-700"
        >
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon size={20} className="text-white" />
                </div>
                <span className="text-gray-400">{label}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 flex items-center justify-center">
                <div className="text-gray-400">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        Campaign Analytics
                    </h1>
                    <p className="text-gray-400 mt-1">Track performance across all your outreach campaigns</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={Target}
                        label="Total Campaigns"
                        value={analytics?.totalCampaigns || 0}
                        color="bg-purple-600"
                    />
                    <StatCard
                        icon={Mail}
                        label="Emails Sent"
                        value={analytics?.totalSent || 0}
                        color="bg-blue-600"
                    />
                    <StatCard
                        icon={Eye}
                        label="Open Rate"
                        value={`${analytics?.openRate || 0}%`}
                        subtext={`${analytics?.totalOpened || 0} opened`}
                        color="bg-green-600"
                    />
                    <StatCard
                        icon={MessageSquare}
                        label="Reply Rate"
                        value={`${analytics?.replyRate || 0}%`}
                        subtext={`${analytics?.totalReplied || 0} replies`}
                        color="bg-orange-600"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Sentiment Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-xl bg-gray-800/50 border border-gray-700"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-green-400" />
                            Reply Sentiment
                        </h3>
                        {sentimentData.some(d => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {sentimentData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                No reply data yet
                            </div>
                        )}
                    </motion.div>

                    {/* Intent Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-xl bg-gray-800/50 border border-gray-700"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Users size={20} className="text-blue-400" />
                            Reply Intent
                        </h3>
                        {intentData.some(d => d.value > 0) ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={intentData}>
                                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#9CA3AF' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                                        {intentData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={INTENT_COLORS[index]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                No reply data yet
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Campaign Performance Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-gray-800/50 border border-gray-700"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-purple-400" />
                        Campaign Performance
                    </h3>

                    {analytics?.campaignPerformance && analytics.campaignPerformance.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-400 border-b border-gray-700">
                                        <th className="pb-3 font-medium">Campaign</th>
                                        <th className="pb-3 font-medium text-center">Sent</th>
                                        <th className="pb-3 font-medium text-center">Opened</th>
                                        <th className="pb-3 font-medium text-center">Replied</th>
                                        <th className="pb-3 font-medium text-center">Open Rate</th>
                                        <th className="pb-3 font-medium text-center">Reply Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.campaignPerformance.map((campaign) => (
                                        <tr key={campaign.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                            <td className="py-4 text-white font-medium">{campaign.name}</td>
                                            <td className="py-4 text-center text-gray-300">{campaign.sent}</td>
                                            <td className="py-4 text-center text-gray-300">{campaign.opened}</td>
                                            <td className="py-4 text-center text-gray-300">{campaign.replied}</td>
                                            <td className="py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-sm ${campaign.openRate >= 50 ? 'bg-green-500/20 text-green-400' :
                                                        campaign.openRate >= 25 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {campaign.openRate}%
                                                </span>
                                            </td>
                                            <td className="py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-sm ${campaign.replyRate >= 10 ? 'bg-green-500/20 text-green-400' :
                                                        campaign.replyRate >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {campaign.replyRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No campaigns yet. Create your first campaign to see analytics!
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
