'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Mail, ArrowRight, ArrowLeft, Check, Loader2, Sparkles, Users, FileText, Clock, Zap
} from 'lucide-react';

const API_URL = 'http://localhost:3001';

interface Template {
    id: number;
    name: string;
    subject: string;
    body: string;
}

interface Lead {
    id: number;
    name: string;
    email: string;
    company: string;
}

export default function NewCampaignPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [creating, setCreating] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [schedule, setSchedule] = useState<'now' | 'later'>('now');
    const [dailyLimit, setDailyLimit] = useState(20);

    useEffect(() => {
        fetchTemplates();
        fetchLeads();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch(`${API_URL}/api/templates`);
            const data = await res.json();
            setTemplates(data.templates || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await fetch(`${API_URL}/api/leads`);
            const data = await res.json();
            setLeads((data.leads || []).filter((l: Lead) => l.email));
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        }
    };

    const toggleLead = (id: number) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
        );
    };

    const selectAllLeads = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(leads.map(l => l.id));
        }
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            alert('Please enter a campaign name');
            return;
        }

        setCreating(true);

        try {
            const res = await fetch(`${API_URL}/api/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    templateId: selectedTemplate,
                    leadIds: selectedLeads,
                    dailyLimit,
                    startNow: schedule === 'now'
                })
            });

            const data = await res.json();

            if (data.status === 'success') {
                router.push('/campaigns');
            } else {
                alert('Failed to create campaign: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to backend');
        } finally {
            setCreating(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return name.trim().length > 0;
        if (step === 2) return selectedLeads.length > 0;
        if (step === 3) return true; // Template is optional
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-2 flex items-center gap-3"
                    >
                        <Sparkles className="text-indigo-400" size={32} /> New Campaign
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400"
                    >
                        Create a new email outreach campaign in 4 simple steps.
                    </motion.p>
                </header>

                {/* Progress Steps */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between mb-12 px-4"
                >
                    {[
                        { num: 1, label: 'Basics', icon: FileText },
                        { num: 2, label: 'Audience', icon: Users },
                        { num: 3, label: 'Template', icon: Mail },
                        { num: 4, label: 'Schedule', icon: Clock }
                    ].map((s, i) => (
                        <div key={s.num} className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${s.num <= step
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                    : 'bg-gray-800 text-gray-600'
                                }`}>
                                {s.num < step ? <Check size={20} /> : <s.icon size={18} />}
                            </div>
                            <span className={`text-sm font-medium hidden md:block ${s.num <= step ? 'text-white' : 'text-gray-600'
                                }`}>
                                {s.label}
                            </span>
                            {i < 3 && <div className={`w-12 lg:w-20 h-0.5 ${s.num < step ? 'bg-indigo-500' : 'bg-gray-800'}`} />}
                        </div>
                    ))}
                </motion.div>

                {/* Form Steps */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 rounded-xl bg-gray-800/50 border border-gray-700"
                >
                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Campaign Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., SaaS Founders Outreach Q1"
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                    autoFocus
                                />
                            </div>
                            <div className="p-4 bg-indigo-900/20 rounded-xl border border-indigo-500/30">
                                <p className="text-sm text-indigo-300">
                                    💡 <strong>Tip:</strong> Choose a descriptive name that clearly identifies your target audience and campaign goal.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Audience Selection */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-white">Select Recipients</h3>
                                <button
                                    onClick={selectAllLeads}
                                    className="text-sm text-indigo-400 hover:text-indigo-300"
                                >
                                    {selectedLeads.length === leads.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div className="text-sm text-gray-400 mb-2">
                                {selectedLeads.length} of {leads.length} leads selected
                            </div>

                            <div className="max-h-80 overflow-y-auto space-y-2">
                                {leads.length > 0 ? leads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        onClick={() => toggleLead(lead.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedLeads.includes(lead.id)
                                                ? 'bg-indigo-900/30 border-indigo-500'
                                                : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedLeads.includes(lead.id)
                                                    ? 'bg-indigo-500 border-indigo-500'
                                                    : 'border-gray-500'
                                                }`}>
                                                {selectedLeads.includes(lead.id) && <Check size={14} />}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{lead.name}</p>
                                                <p className="text-sm text-gray-400">{lead.email} • {lead.company}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No leads with email addresses found. Run a scraper first!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Template Selection */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white">Choose Email Template</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {templates.length > 0 ? templates.map((template) => (
                                    <div
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template.id)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTemplate === template.id
                                                ? 'bg-indigo-900/30 border-indigo-500'
                                                : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                            }`}
                                    >
                                        <h4 className="font-medium text-white">{template.name}</h4>
                                        <p className="text-sm text-gray-400 mt-1">{template.subject}</p>
                                    </div>
                                )) : (
                                    <div className="col-span-2 text-center py-8 text-gray-500">
                                        <p>No templates found.</p>
                                        <a href="/templates" className="text-indigo-400 hover:underline">Create a template first</a>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/30">
                                <p className="text-sm text-blue-300">
                                    📝 Or skip template selection and use AI to generate personalized emails for each lead.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Schedule */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-white">Sending Schedule</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => setSchedule('now')}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${schedule === 'now'
                                            ? 'bg-green-900/30 border-green-500'
                                            : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Zap className="text-green-400" size={24} />
                                        <div>
                                            <h4 className="font-medium text-white">Start Immediately</h4>
                                            <p className="text-sm text-gray-400">Begin sending as soon as campaign is created</p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setSchedule('later')}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${schedule === 'later'
                                            ? 'bg-blue-900/30 border-blue-500'
                                            : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-blue-400" size={24} />
                                        <div>
                                            <h4 className="font-medium text-white">Save as Draft</h4>
                                            <p className="text-sm text-gray-400">Start manually when ready</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Daily Send Limit
                                </label>
                                <input
                                    type="number"
                                    value={dailyLimit}
                                    onChange={(e) => setDailyLimit(parseInt(e.target.value) || 10)}
                                    min={1}
                                    max={100}
                                    className="w-32 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Max emails to send per day (to avoid spam filters)</p>
                            </div>

                            {/* Summary */}
                            <div className="p-4 bg-gray-700/50 rounded-xl">
                                <h4 className="font-medium text-white mb-2">Campaign Summary</h4>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>📛 Name: <span className="text-white">{name}</span></li>
                                    <li>👥 Recipients: <span className="text-white">{selectedLeads.length} leads</span></li>
                                    <li>📧 Template: <span className="text-white">{selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name : 'AI Generated'}</span></li>
                                    <li>⏰ Schedule: <span className="text-white">{schedule === 'now' ? 'Start Immediately' : 'Draft'}</span></li>
                                </ul>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => step === 1 ? router.push('/campaigns') : setStep(step - 1)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-gray-300"
                    >
                        <ArrowLeft size={18} />
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <button
                        onClick={() => step === 4 ? handleCreate() : setStep(step + 1)}
                        disabled={creating || !canProceed()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {creating ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creating...
                            </>
                        ) : step === 4 ? (
                            <>
                                <Check size={18} />
                                Create Campaign
                            </>
                        ) : (
                            <>
                                Next
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
