'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Mail, ArrowRight, ArrowLeft, Check, Loader2, Sparkles
} from 'lucide-react';

export default function NewCampaignPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [creating, setCreating] = useState(false);

    // Form state
    const [name, setName] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) {
            alert('Please enter a campaign name');
            return;
        }

        setCreating(true);

        try {
            const res = await fetch('http://localhost:3001/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
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

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
            </div>

            <div className="relative z-10 p-8 max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold gradient-text mb-2 flex items-center gap-3"
                    >
                        <Sparkles className="text-indigo-400" size={32} /> New Campaign
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400"
                    >
                        Create a new email outreach campaign in a few simple steps.
                    </motion.p>
                </header>

                {/* Progress Steps */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between mb-12 px-8"
                >
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${s <= step ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-slate-800 text-slate-600'
                                }`}>
                                {s < step ? <Check size={20} /> : s}
                            </div>
                            <span className={`text-sm font-medium ${s <= step ? 'text-white' : 'text-slate-600'}`}>
                                {s === 1 ? 'Basics' : s === 2 ? 'Audience' : 'Compose'}
                            </span>
                            {s < 3 && <div className={`w-24 h-0.5 ${s < step ? 'bg-indigo-500' : 'bg-slate-800'}`} />}
                        </div>
                    ))}
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card-modern p-8"
                >
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Campaign Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., SaaS Founders Outreach Q1"
                                    className="w-full input-modern p-4 text-white"
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

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="p-6 bg-amber-900/20 rounded-xl border border-amber-500/30 text-center">
                                <Sparkles className="mx-auto text-amber-400 mb-3" size={32} />
                                <h3 className="text-lg font-semibold text-white mb-2">Audience Selection - Coming Soon!</h3>
                                <p className="text-slate-400 text-sm">
                                    Lead filtering and targeting will be available in the next update. For now, you can send to all leads.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="p-6 bg-amber-900/20 rounded-xl border border-amber-500/30 text-center">
                                <Mail className="mx-auto text-amber-400 mb-3" size={32} />
                                <h3 className="text-lg font-semibold text-white mb-2">Email Composer - Coming Soon!</h3>
                                <p className="text-slate-400 text-sm">
                                    Template editor and variable mapping will be available soon. Use the AI Email Generator on the Leads page for now.
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={() => step === 1 ? router.push('/campaigns') : setStep(step - 1)}
                        className="flex items-center gap-2 px-6 py-3 glass rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <button
                        onClick={() => step === 3 ? handleCreate() : setStep(step + 1)}
                        disabled={creating || (step === 1 && !name.trim())}
                        className="flex items-center gap-2 px-6 py-3 btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {creating ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creating...
                            </>
                        ) : step === 3 ? (
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
