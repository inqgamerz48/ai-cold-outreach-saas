'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Send, Sparkles, Loader2, Mail, Copy, Check, User, Building,
    BriefcaseBusiness, X, RefreshCw
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Lead {
    id: number;
    name: string;
    email: string;
    company: string;
    description?: string;
}

interface EmailComposerProps {
    lead: Lead;
    onClose: () => void;
    onSend?: (subject: string, body: string) => void;
}

export default function EmailComposer({ lead, onClose, onSend }: EmailComposerProps) {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [copied, setCopied] = useState(false);
    const [context, setContext] = useState('');
    const [tone, setTone] = useState<'professional' | 'casual' | 'friendly'>('professional');
    const [showContextForm, setShowContextForm] = useState(true);

    const generateEmail = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`${API_URL}/api/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadName: lead.name,
                    leadCompany: lead.company,
                    leadRole: '',
                    userContext: context,
                    tone
                })
            });

            const data = await res.json();
            if (data.status === 'success' && data.email) {
                setSubject(data.email.subject || `Quick question about ${lead.company}`);
                setBody(data.email.body || data.email);
                setShowContextForm(false);
            } else {
                alert('Failed to generate email. Check if AI Engine is running.');
            }
        } catch (error) {
            console.error('Failed to generate email:', error);
            alert('Failed to connect to AI Engine. Make sure it\'s running on port 8000.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSend = async () => {
        if (!subject || !body) {
            alert('Please generate or write an email first');
            return;
        }

        setSending(true);
        try {
            // For now, just copy to clipboard as actual sending requires SMTP setup
            navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);

            if (onSend) {
                onSend(subject, body);
            }

            alert('Email copied to clipboard! (SMTP sending coming soon)');
            onClose();
        } catch (error) {
            console.error('Failed:', error);
        } finally {
            setSending(false);
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const regenerate = () => {
        setShowContextForm(true);
        setSubject('');
        setBody('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700"
            >
                {/* Header */}
                <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Email Composer</h2>
                            <p className="text-sm text-gray-400">To: {lead.name} ({lead.email})</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Lead Info */}
                    <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                                <User size={16} className="text-gray-500" />
                                <span>{lead.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Building size={16} className="text-gray-500" />
                                <span>{lead.company || 'Unknown Company'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Mail size={16} className="text-gray-500" />
                                <span>{lead.email}</span>
                            </div>
                        </div>
                    </div>

                    {showContextForm ? (
                        /* Context Form for AI Generation */
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    What do you offer? (Context for AI)
                                </label>
                                <textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none resize-none"
                                    placeholder="e.g., We help SaaS companies increase their MRR by 30% through automated cold outreach..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Tone
                                </label>
                                <div className="flex gap-3">
                                    {(['professional', 'friendly', 'casual'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`px-4 py-2 rounded-lg capitalize transition-colors ${tone === t
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={generateEmail}
                                disabled={generating || !context.trim()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium disabled:opacity-50"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Generating with AI...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Generate Email with AI
                                    </>
                                )}
                            </motion.button>

                            <div className="text-center text-gray-500 text-sm">
                                Or write your own email below
                            </div>
                        </div>
                    ) : (
                        /* Regenerate button */
                        <div className="mb-4 flex justify-end">
                            <button
                                onClick={regenerate}
                                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                <RefreshCw size={16} />
                                Regenerate
                            </button>
                        </div>
                    )}

                    {/* Email Editor */}
                    <div className="space-y-4 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                placeholder="Email subject..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Body
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={10}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none resize-none font-mono text-sm"
                                placeholder="Write your email..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                        <button
                            onClick={copyToClipboard}
                            disabled={!subject && !body}
                            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
                        >
                            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={sending || !subject || !body}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium disabled:opacity-50"
                            >
                                {sending ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <Send size={18} />
                                )}
                                Send Email
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
