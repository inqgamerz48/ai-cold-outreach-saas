'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, Mail, Users, Play, Pause, Send, CheckCircle,
    XCircle, Loader2, Settings, ChevronDown, Zap, BarChart3
} from 'lucide-react';

interface Lead {
    id: number;
    name: string;
    email: string | null;
    company: string | null;
    phone: string | null;
}

interface EmailAccount {
    id: number;
    email: string;
    isActive: boolean;
    sentToday: number;
    dailyLimit: number;
}

interface Campaign {
    id: number;
    name: string;
    status: string;
    emailsSent: number;
    repliesCount: number;
}

export default function CampaignDetailPage() {
    const params = useParams();
    const campaignId = parseInt(params.id as string);

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
    const [subject, setSubject] = useState('Quick question about {{company}}');
    const [body, setBody] = useState(`Hi {{name}},

I noticed your work at {{company}} and wanted to reach out.

I'd love to connect and learn more about how we might be able to help.

Best regards`);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [result, setResult] = useState<{ sent: number; errors: string[] } | null>(null);

    useEffect(() => {
        fetchData();
    }, [campaignId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch campaign
            const campRes = await fetch(`http://localhost:3001/api/campaigns/${campaignId}`);
            const campData = await campRes.json();
            if (campData.status === 'success') {
                setCampaign(campData.campaign);
            }

            // Fetch available leads
            const leadsRes = await fetch(`http://localhost:3001/api/campaigns/${campaignId}/available-leads`);
            const leadsData = await leadsRes.json();
            if (leadsData.status === 'success') {
                setLeads(leadsData.leads || []);
            }

            // Fetch email accounts
            const accountsRes = await fetch('http://localhost:3001/api/email-accounts');
            const accountsData = await accountsRes.json();
            if (accountsData.status === 'success') {
                setEmailAccounts(accountsData.accounts || []);
                const activeAccount = accountsData.accounts?.find((a: EmailAccount) => a.isActive);
                if (activeAccount) setSelectedAccount(activeAccount.id);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleLead = (id: number) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(leads.map(l => l.id));
        }
    };

    const startCampaign = async () => {
        try {
            await fetch(`http://localhost:3001/api/campaigns/${campaignId}/start`, { method: 'POST' });
            fetchData();
        } catch (err) {
            console.error('Failed to start campaign:', err);
        }
    };

    const pauseCampaign = async () => {
        try {
            await fetch(`http://localhost:3001/api/campaigns/${campaignId}/pause`, { method: 'POST' });
            fetchData();
        } catch (err) {
            console.error('Failed to pause campaign:', err);
        }
    };

    const executeCampaign = async () => {
        if (!selectedAccount || selectedLeads.length === 0) return;

        setExecuting(true);
        setResult(null);

        try {
            const res = await fetch(`http://localhost:3001/api/campaigns/${campaignId}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadIds: selectedLeads,
                    emailAccountId: selectedAccount,
                    subject,
                    body
                })
            });

            const data = await res.json();
            if (data.status === 'success') {
                setResult({ sent: data.sent, errors: data.errors || [] });
                setSelectedLeads([]);
                fetchData();
            } else {
                setResult({ sent: 0, errors: [data.error] });
            }
        } catch (err: any) {
            setResult({ sent: 0, errors: [err.message] });
        } finally {
            setExecuting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-indigo-400" size={48} />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="p-8">
                <p className="text-red-400">Campaign not found</p>
            </div>
        );
    }

    const activeAccount = emailAccounts.find(a => a.id === selectedAccount);

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="orb orb-1" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 p-8 max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <Link href="/campaigns" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Campaigns
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold gradient-text mb-2">{campaign.name}</h1>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${campaign.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                                        campaign.status === 'PAUSED' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-slate-700 text-slate-400'
                                    }`}>
                                    {campaign.status}
                                </span>
                                <span className="text-slate-500">
                                    {campaign.emailsSent} emails sent
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {campaign.status !== 'ACTIVE' ? (
                                <button onClick={startCampaign} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">
                                    <Play size={16} /> Start
                                </button>
                            ) : (
                                <button onClick={pauseCampaign} className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors">
                                    <Pause size={16} /> Pause
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Result Message */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`mb-6 p-4 rounded-xl ${result.errors.length === 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}
                        >
                            <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                <CheckCircle size={18} />
                                <span>Sent {result.sent} emails successfully!</span>
                            </div>
                            {result.errors.length > 0 && (
                                <div className="text-amber-400 text-sm">
                                    {result.errors.map((e, i) => <p key={i}>{e}</p>)}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-3 gap-6">
                    {/* Lead Selection */}
                    <div className="col-span-2">
                        <div className="card-modern p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Users size={20} className="text-indigo-400" /> Select Leads
                                </h2>
                                <button
                                    onClick={selectAll}
                                    className="text-sm text-indigo-400 hover:text-indigo-300"
                                >
                                    {selectedLeads.length === leads.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            {leads.length === 0 ? (
                                <p className="text-slate-500 py-8 text-center">No leads with emails available. Add leads with email addresses first.</p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {leads.map(lead => (
                                        <div
                                            key={lead.id}
                                            onClick={() => toggleLead(lead.id)}
                                            className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${selectedLeads.includes(lead.id)
                                                    ? 'bg-indigo-600/20 border border-indigo-500/30'
                                                    : 'bg-slate-800/50 border border-transparent hover:border-slate-700'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded flex items-center justify-center ${selectedLeads.includes(lead.id) ? 'bg-indigo-600' : 'bg-slate-700'
                                                }`}>
                                                {selectedLeads.includes(lead.id) && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{lead.name}</p>
                                                <p className="text-sm text-slate-500">{lead.email} • {lead.company}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-sm text-slate-500 mt-4">
                                {selectedLeads.length} leads selected
                            </p>
                        </div>
                    </div>

                    {/* Email Compose */}
                    <div className="space-y-6">
                        {/* Account Selection */}
                        <div className="card-modern p-6">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Settings size={16} className="text-indigo-400" /> Sending Account
                            </h3>
                            {emailAccounts.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-slate-500 text-sm mb-2">No email accounts configured</p>
                                    <Link href="/settings/email-accounts" className="text-indigo-400 text-sm hover:underline">
                                        Add Account →
                                    </Link>
                                </div>
                            ) : (
                                <select
                                    value={selectedAccount || ''}
                                    onChange={e => setSelectedAccount(parseInt(e.target.value))}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                                >
                                    {emailAccounts.map(acc => (
                                        <option key={acc.id} value={acc.id} disabled={!acc.isActive}>
                                            {acc.email} {!acc.isActive && '(Not Verified)'}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {activeAccount && (
                                <p className="text-xs text-slate-500 mt-2">
                                    {activeAccount.sentToday}/{activeAccount.dailyLimit} sent today
                                </p>
                            )}
                        </div>

                        {/* Email Content */}
                        <div className="card-modern p-6">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Mail size={16} className="text-indigo-400" /> Email Content
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm"
                                        placeholder="Email subject..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">Body</label>
                                    <textarea
                                        value={body}
                                        onChange={e => setBody(e.target.value)}
                                        rows={8}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm resize-none"
                                        placeholder="Email body..."
                                    />
                                </div>
                                <p className="text-xs text-slate-600">
                                    Use {'{{name}}'} and {'{{company}}'} for personalization
                                </p>
                            </div>
                        </div>

                        {/* Execute Button */}
                        <button
                            onClick={executeCampaign}
                            disabled={executing || selectedLeads.length === 0 || !selectedAccount || campaign.status !== 'ACTIVE'}
                            className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {executing ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Sending Emails...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send to {selectedLeads.length} Leads
                                </>
                            )}
                        </button>

                        {campaign.status !== 'ACTIVE' && (
                            <p className="text-xs text-amber-400 text-center">
                                Start the campaign first to send emails
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
