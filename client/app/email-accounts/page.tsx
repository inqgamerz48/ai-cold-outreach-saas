'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Mail, Plus, Trash2, Check, X, Loader2, Shield, AlertCircle,
    Server, Key, RefreshCw
} from 'lucide-react';

const API_URL = 'http://localhost:3001';

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
    const [showModal, setShowModal] = useState(false);
    const [verifying, setVerifying] = useState<number | null>(null);
    const [form, setForm] = useState({
        email: '',
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
        dailyLimit: '50'
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/email-accounts`);
            const data = await res.json();
            setAccounts(data.accounts || []);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const createAccount = async () => {
        try {
            await fetch(`${API_URL}/api/email-accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            setShowModal(false);
            setForm({
                email: '',
                smtpHost: 'smtp.gmail.com',
                smtpPort: '587',
                smtpUser: '',
                smtpPass: '',
                dailyLimit: '50'
            });
            fetchAccounts();
        } catch (error) {
            console.error('Failed to create account:', error);
        }
    };

    const verifyAccount = async (id: number) => {
        setVerifying(id);
        try {
            const res = await fetch(`${API_URL}/api/email-accounts/${id}/verify`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.verified) {
                alert('✅ Connection verified successfully!');
            } else {
                alert('❌ Connection failed. Check your credentials.');
            }
            fetchAccounts();
        } catch (error) {
            console.error('Failed to verify account:', error);
            alert('Failed to verify connection');
        } finally {
            setVerifying(null);
        }
    };

    const deleteAccount = async (id: number) => {
        if (!confirm('Delete this email account?')) return;
        try {
            await fetch(`${API_URL}/api/email-accounts/${id}`, { method: 'DELETE' });
            fetchAccounts();
        } catch (error) {
            console.error('Failed to delete account:', error);
        }
    };

    const presets = [
        { name: 'Gmail', host: 'smtp.gmail.com', port: '587' },
        { name: 'Outlook', host: 'smtp.office365.com', port: '587' },
        { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: '587' },
        { name: 'SendGrid', host: 'smtp.sendgrid.net', port: '587' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                            Email Accounts
                        </h1>
                        <p className="text-gray-400 mt-1">Manage SMTP accounts for sending emails</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-medium"
                    >
                        <Plus size={20} /> Add Account
                    </motion.button>
                </div>

                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-900/20 rounded-xl border border-blue-500/30 flex items-start gap-3">
                    <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-medium text-blue-300">Gmail Users</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Use an <strong>App Password</strong> instead of your regular password.
                            Go to Google Account → Security → 2-Step Verification → App passwords.
                        </p>
                    </div>
                </div>

                {/* Accounts List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading accounts...</div>
                ) : accounts.length > 0 ? (
                    <div className="space-y-4">
                        {accounts.map((account) => (
                            <motion.div
                                key={account.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-xl bg-gray-800/50 border border-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${account.isActive ? 'bg-green-500/20' : 'bg-gray-700'
                                            }`}>
                                            <Mail className={account.isActive ? 'text-green-400' : 'text-gray-500'} size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{account.email}</h3>
                                            <p className="text-sm text-gray-400">
                                                {account.smtpHost}:{account.smtpPort}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Status */}
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${account.isActive
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-700 text-gray-400'
                                            }`}>
                                            {account.isActive ? 'Verified' : 'Not Verified'}
                                        </div>

                                        {/* Daily Usage */}
                                        <div className="text-sm text-gray-400">
                                            {account.sentToday}/{account.dailyLimit} today
                                        </div>

                                        {/* Actions */}
                                        <button
                                            onClick={() => verifyAccount(account.id)}
                                            disabled={verifying === account.id}
                                            className="p-2 text-gray-400 hover:text-blue-400 disabled:opacity-50"
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
                                            className="p-2 text-gray-400 hover:text-red-400"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <Mail size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No email accounts configured</p>
                        <p className="text-sm mt-2">Add an account to start sending emails</p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 border border-gray-700"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Add Email Account</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Presets */}
                            <div className="flex gap-2 mb-4">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => setForm({ ...form, smtpHost: preset.host, smtpPort: preset.port })}
                                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${form.smtpHost === preset.host
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">SMTP Host</label>
                                        <input
                                            type="text"
                                            value={form.smtpHost}
                                            onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Port</label>
                                        <input
                                            type="text"
                                            value={form.smtpPort}
                                            onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">SMTP Username</label>
                                    <input
                                        type="text"
                                        value={form.smtpUser}
                                        onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="Usually your email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">SMTP Password / App Password</label>
                                    <input
                                        type="password"
                                        value={form.smtpPass}
                                        onChange={(e) => setForm({ ...form, smtpPass: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="••••••••••••"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Daily Send Limit</label>
                                    <input
                                        type="number"
                                        value={form.dailyLimit}
                                        onChange={(e) => setForm({ ...form, dailyLimit: e.target.value })}
                                        className="w-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={createAccount}
                                    disabled={!form.email || !form.smtpPass}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-medium disabled:opacity-50"
                                >
                                    <Check size={18} /> Add Account
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
