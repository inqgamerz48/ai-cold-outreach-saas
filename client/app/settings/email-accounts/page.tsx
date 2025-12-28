'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Plus, Trash2, CheckCircle, XCircle, Loader2,
    Server, Lock, ArrowLeft, RefreshCw, Zap
} from 'lucide-react';
import Link from 'next/link';

interface EmailAccount {
    id: number;
    email: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    dailyLimit: number;
    sentToday: number;
    isActive: boolean;
    createdAt: string;
}

export default function EmailAccountsPage() {
    const [accounts, setAccounts] = useState<EmailAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [verifying, setVerifying] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
        dailyLimit: '50'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchAccounts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/email-accounts');
            const data = await res.json();
            if (data.accounts) {
                setAccounts(data.accounts);
            }
        } catch (err) {
            console.error('Failed to fetch accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const res = await fetch('http://localhost:3001/api/email-accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.status === 'success') {
                setSuccess('Email account added successfully!');
                setShowForm(false);
                setFormData({
                    email: '',
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: '587',
                    smtpUser: '',
                    smtpPass: '',
                    dailyLimit: '50'
                });
                fetchAccounts();
            } else {
                setError(data.error || 'Failed to add account');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const verifyAccount = async (id: number) => {
        setVerifying(id);
        try {
            const res = await fetch(`http://localhost:3001/api/email-accounts/${id}/verify`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.verified) {
                setSuccess('Connection verified successfully!');
            } else {
                setError('Connection failed - check credentials');
            }
            fetchAccounts();
        } catch (err) {
            setError('Verification failed');
        } finally {
            setVerifying(null);
        }
    };

    const deleteAccount = async (id: number) => {
        if (!confirm('Delete this email account?')) return;

        try {
            await fetch(`http://localhost:3001/api/email-accounts/${id}`, {
                method: 'DELETE'
            });
            fetchAccounts();
        } catch (err) {
            setError('Failed to delete account');
        }
    };

    const presets = [
        { name: 'Gmail', host: 'smtp.gmail.com', port: '587' },
        { name: 'Outlook', host: 'smtp.office365.com', port: '587' },
        { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: '465' },
    ];

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="orb orb-1" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
                <div className="orb orb-2" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10 p-8">
                {/* Header */}
                <header className="mb-8">
                    <Link href="/settings" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                        <ArrowLeft size={18} /> Back to Settings
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3"
                    >
                        <Mail className="text-indigo-400" size={32} /> Email Accounts
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400"
                    >
                        Configure SMTP accounts for sending campaign emails.
                    </motion.p>
                </header>

                {/* Messages */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2"
                        >
                            <XCircle size={18} /> {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2"
                        >
                            <CheckCircle size={18} /> {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add Account Button */}
                <motion.button
                    onClick={() => setShowForm(!showForm)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mb-6 flex items-center gap-2 px-6 py-3 btn-primary rounded-xl"
                >
                    <Plus size={18} /> Add Email Account
                </motion.button>

                {/* Add Account Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <form onSubmit={handleSubmit} className="card-modern p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-white mb-4">New SMTP Account</h3>

                                {/* Presets */}
                                <div className="flex gap-2 mb-4">
                                    {presets.map(preset => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, smtpHost: preset.host, smtpPort: preset.port })}
                                            className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white transition-colors"
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full input-modern py-3 px-4 text-white"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">SMTP Username</label>
                                        <input
                                            type="text"
                                            value={formData.smtpUser}
                                            onChange={e => setFormData({ ...formData, smtpUser: e.target.value })}
                                            className="w-full input-modern py-3 px-4 text-white"
                                            placeholder="Usually your email"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">SMTP Host</label>
                                        <div className="relative">
                                            <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input
                                                type="text"
                                                value={formData.smtpHost}
                                                onChange={e => setFormData({ ...formData, smtpHost: e.target.value })}
                                                className="w-full input-modern py-3 pl-10 pr-4 text-white"
                                                placeholder="smtp.gmail.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">SMTP Port</label>
                                        <input
                                            type="number"
                                            value={formData.smtpPort}
                                            onChange={e => setFormData({ ...formData, smtpPort: e.target.value })}
                                            className="w-full input-modern py-3 px-4 text-white"
                                            placeholder="587"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Password / App Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input
                                                type="password"
                                                value={formData.smtpPass}
                                                onChange={e => setFormData({ ...formData, smtpPass: e.target.value })}
                                                className="w-full input-modern py-3 pl-10 pr-4 text-white"
                                                placeholder="••••••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Daily Send Limit</label>
                                        <input
                                            type="number"
                                            value={formData.dailyLimit}
                                            onChange={e => setFormData({ ...formData, dailyLimit: e.target.value })}
                                            className="w-full input-modern py-3 px-4 text-white"
                                            placeholder="50"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="submit" className="flex items-center gap-2 px-6 py-3 btn-primary rounded-xl">
                                        <Zap size={16} /> Add Account
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Accounts List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-indigo-400" size={40} />
                    </div>
                ) : accounts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card-modern p-16 text-center"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                                <Mail className="text-slate-600" size={40} />
                            </div>
                            <p className="text-slate-500">No email accounts configured yet.</p>
                            <p className="text-sm text-slate-600">Add an SMTP account to start sending campaign emails.</p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        {accounts.map((account, i) => (
                            <motion.div
                                key={account.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="card-modern p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${account.isActive ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                                            <Mail className={account.isActive ? 'text-emerald-400' : 'text-slate-500'} size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{account.email}</h3>
                                            <p className="text-sm text-slate-500">
                                                {account.smtpHost}:{account.smtpPort}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Status */}
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">Status</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${account.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                                {account.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {account.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {/* Sent Today */}
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">Sent Today</p>
                                            <p className="text-white font-semibold">{account.sentToday} / {account.dailyLimit}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => verifyAccount(account.id)}
                                                disabled={verifying === account.id}
                                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                                title="Verify Connection"
                                            >
                                                {verifying === account.id ? (
                                                    <Loader2 className="animate-spin" size={18} />
                                                ) : (
                                                    <RefreshCw size={18} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => deleteAccount(account.id)}
                                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete Account"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
