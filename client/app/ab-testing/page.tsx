'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FlaskConical, Plus, Check, X, BarChart3, Mail, Loader2,
    ChevronRight, TrendingUp, TrendingDown
} from 'lucide-react';

const API_URL = 'http://localhost:3001';

interface ABTest {
    id: number;
    name: string;
    campaignId: number;
    variantA: { subject: string; body: string; sent: number; opened: number; replied: number };
    variantB: { subject: string; body: string; sent: number; opened: number; replied: number };
    status: 'ACTIVE' | 'COMPLETED';
    winner: 'A' | 'B' | null;
}

export default function ABTestingPage() {
    const [tests, setTests] = useState<ABTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: '',
        subjectA: '',
        subjectB: '',
        bodyA: '',
        bodyB: ''
    });

    useEffect(() => {
        // Mock data for demo
        setTests([
            {
                id: 1,
                name: 'Subject Line Test - Q1 Campaign',
                campaignId: 1,
                variantA: {
                    subject: 'Quick question about {{company}}',
                    body: 'Hi {{name}}...',
                    sent: 50, opened: 25, replied: 8
                },
                variantB: {
                    subject: '{{name}}, got a minute?',
                    body: 'Hi {{name}}...',
                    sent: 50, opened: 30, replied: 12
                },
                status: 'COMPLETED',
                winner: 'B'
            }
        ]);
        setLoading(false);
    }, []);

    const createTest = () => {
        const newTest: ABTest = {
            id: tests.length + 1,
            name: form.name || 'New A/B Test',
            campaignId: 1,
            variantA: { subject: form.subjectA, body: form.bodyA, sent: 0, opened: 0, replied: 0 },
            variantB: { subject: form.subjectB, body: form.bodyB, sent: 0, opened: 0, replied: 0 },
            status: 'ACTIVE',
            winner: null
        };
        setTests([...tests, newTest]);
        setShowModal(false);
        setForm({ name: '', subjectA: '', subjectB: '', bodyA: '', bodyB: '' });
    };

    const getWinRate = (variant: ABTest['variantA']) => {
        if (variant.sent === 0) return 0;
        return Math.round((variant.replied / variant.sent) * 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-3">
                            <FlaskConical size={32} /> A/B Testing
                        </h1>
                        <p className="text-gray-400 mt-1">Test different subject lines and email content</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium"
                    >
                        <Plus size={20} /> New Test
                    </motion.button>
                </div>

                {/* Info Banner */}
                <div className="mb-6 p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
                    <h3 className="font-medium text-purple-300 mb-1">How A/B Testing Works</h3>
                    <p className="text-sm text-gray-400">
                        Create two variants of your email. We'll split your recipients 50/50 and track which version gets more replies.
                        After enough data, we'll declare a winner!
                    </p>
                </div>

                {/* Tests List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading tests...</div>
                ) : tests.length > 0 ? (
                    <div className="space-y-4">
                        {tests.map(test => (
                            <motion.div
                                key={test.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-xl bg-gray-800/50 border border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{test.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded ${test.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {test.status}
                                        </span>
                                    </div>
                                    {test.winner && (
                                        <div className="flex items-center gap-2 text-green-400">
                                            <TrendingUp size={18} />
                                            <span className="font-medium">Variant {test.winner} Wins!</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Variant A */}
                                    <div className={`p-4 rounded-lg border ${test.winner === 'A' ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-700/50 border-gray-600'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-white">Variant A</span>
                                            <span className="text-2xl font-bold text-white">{getWinRate(test.variantA)}%</span>
                                        </div>
                                        <p className="text-sm text-gray-400 truncate">{test.variantA.subject}</p>
                                        <div className="mt-3 flex gap-4 text-xs text-gray-500">
                                            <span>Sent: {test.variantA.sent}</span>
                                            <span>Opened: {test.variantA.opened}</span>
                                            <span>Replied: {test.variantA.replied}</span>
                                        </div>
                                    </div>

                                    {/* Variant B */}
                                    <div className={`p-4 rounded-lg border ${test.winner === 'B' ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-700/50 border-gray-600'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-white">Variant B</span>
                                            <span className="text-2xl font-bold text-white">{getWinRate(test.variantB)}%</span>
                                        </div>
                                        <p className="text-sm text-gray-400 truncate">{test.variantB.subject}</p>
                                        <div className="mt-3 flex gap-4 text-xs text-gray-500">
                                            <span>Sent: {test.variantB.sent}</span>
                                            <span>Opened: {test.variantB.opened}</span>
                                            <span>Replied: {test.variantB.replied}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <FlaskConical size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No A/B tests yet</p>
                        <p className="text-sm mt-2">Create your first test to optimize your emails</p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-gray-700"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Create A/B Test</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Test Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        placeholder="e.g., Subject Line Test"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-purple-400 mb-1">Variant A Subject</label>
                                        <input
                                            type="text"
                                            value={form.subjectA}
                                            onChange={(e) => setForm({ ...form, subjectA: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-pink-400 mb-1">Variant B Subject</label>
                                        <input
                                            type="text"
                                            value={form.subjectB}
                                            onChange={(e) => setForm({ ...form, subjectB: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-purple-400 mb-1">Variant A Body</label>
                                        <textarea
                                            value={form.bodyA}
                                            onChange={(e) => setForm({ ...form, bodyA: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-pink-400 mb-1">Variant B Body</label>
                                        <textarea
                                            value={form.bodyB}
                                            onChange={(e) => setForm({ ...form, bodyB: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400">
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={createTest}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium"
                                >
                                    <FlaskConical size={18} /> Create Test
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
