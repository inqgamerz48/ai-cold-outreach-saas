'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Copy, Save, X, Mail } from 'lucide-react';

const API_URL = 'http://localhost:3001';

interface Template {
    id: number;
    name: string;
    subject: string;
    body: string;
    createdAt: string;
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Template | null>(null);
    const [form, setForm] = useState({ name: '', subject: '', body: '' });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch(`${API_URL}/api/templates`);
            const data = await res.json();
            setTemplates(data.templates || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveTemplate = async () => {
        try {
            const method = editing ? 'PUT' : 'POST';
            const url = editing
                ? `${API_URL}/api/templates/${editing.id}`
                : `${API_URL}/api/templates`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            setShowModal(false);
            setEditing(null);
            setForm({ name: '', subject: '', body: '' });
            fetchTemplates();
        } catch (error) {
            console.error('Failed to save template:', error);
        }
    };

    const deleteTemplate = async (id: number) => {
        if (!confirm('Delete this template?')) return;
        try {
            await fetch(`${API_URL}/api/templates/${id}`, { method: 'DELETE' });
            fetchTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
    };

    const openEdit = (template: Template) => {
        setEditing(template);
        setForm({ name: template.name, subject: template.subject, body: template.body });
        setShowModal(true);
    };

    const openNew = () => {
        setEditing(null);
        setForm({ name: '', subject: '', body: '' });
        setShowModal(true);
    };

    const copyTemplate = (template: Template) => {
        setEditing(null);
        setForm({
            name: `${template.name} (Copy)`,
            subject: template.subject,
            body: template.body
        });
        setShowModal(true);
    };

    // Default templates
    const defaultTemplates = [
        {
            name: 'Cold Intro',
            subject: 'Quick question about {{company}}',
            body: `Hi {{name}},

I noticed {{company}} is doing great work in the industry. I wanted to reach out because we help companies like yours [value proposition].

Would you be open to a quick 15-minute call this week?

Best,
[Your Name]`
        },
        {
            name: 'Follow Up',
            subject: 'Following up - {{company}}',
            body: `Hi {{name}},

I wanted to follow up on my previous email. I understand you're busy, but I truly believe we could help {{company}} [specific benefit].

Is there a better time to connect?

Best,
[Your Name]`
        },
        {
            name: 'Value Proposition',
            subject: 'Helping {{company}} achieve [goal]',
            body: `Hi {{name}},

Companies like {{company}} are seeing incredible results with our solution:
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]

Would love to share how we could help you achieve similar results.

Interested in learning more?

Best,
[Your Name]`
        }
    ];

    const addDefaultTemplate = async (template: typeof defaultTemplates[0]) => {
        try {
            await fetch(`${API_URL}/api/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
            });
            fetchTemplates();
        } catch (error) {
            console.error('Failed to add template:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Email Templates
                        </h1>
                        <p className="text-gray-400 mt-1">Create and manage email templates with variables</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openNew}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium"
                    >
                        <Plus size={20} /> New Template
                    </motion.button>
                </div>

                {/* Default Templates Section */}
                {templates.length === 0 && !loading && (
                    <div className="mb-8 p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                        <h3 className="text-lg font-semibold mb-4 text-gray-200">Quick Start Templates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {defaultTemplates.map((t, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 rounded-lg bg-gray-700/50 border border-gray-600 cursor-pointer"
                                    onClick={() => addDefaultTemplate(t)}
                                >
                                    <h4 className="font-medium text-blue-400">{t.name}</h4>
                                    <p className="text-sm text-gray-400 mt-1 truncate">{t.subject}</p>
                                    <p className="text-xs text-gray-500 mt-2">Click to add</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Templates Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading templates...</div>
                ) : templates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-blue-500/50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => copyTemplate(template)} className="text-gray-400 hover:text-blue-400">
                                            <Copy size={16} />
                                        </button>
                                        <button onClick={() => openEdit(template)} className="text-gray-400 hover:text-yellow-400">
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => deleteTemplate(template.id)} className="text-gray-400 hover:text-red-400">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-blue-400 mb-2">
                                    <Mail size={14} />
                                    <span className="truncate">{template.subject}</span>
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-3">{template.body}</p>
                                <div className="mt-4 text-xs text-gray-500">
                                    Supports: {'{{name}}, {{company}}, {{role}}'}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : null}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl mx-4 border border-gray-700"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editing ? 'Edit Template' : 'New Template'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Template Name</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., Cold Intro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Subject Line</label>
                                    <input
                                        type="text"
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., Quick question about {{company}}"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email Body</label>
                                    <textarea
                                        value={form.body}
                                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                                        rows={8}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                                        placeholder="Use {{name}}, {{company}}, {{role}} as variables..."
                                    />
                                </div>

                                <div className="bg-gray-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-400">
                                        <strong>Available Variables:</strong> {'{{name}}'} - Lead name, {'{{company}}'} - Company name, {'{{role}}'} - Lead role
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={saveTemplate}
                                    disabled={!form.name || !form.subject || !form.body}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium disabled:opacity-50"
                                >
                                    <Save size={18} /> Save Template
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
