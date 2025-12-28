'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Mail, Users, Target, ArrowRight, Check, Zap,
    Settings, X, Database, Key
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OnboardingStep {
    title: string;
    description: string;
    icon: React.ElementType;
    action?: string;
    actionHref?: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [completed, setCompleted] = useState<number[]>([]);
    const [showApiModal, setShowApiModal] = useState(false);
    const [apiKeys, setApiKeys] = useState({ apify: '', hunter: '' });
    const [saving, setSaving] = useState(false);

    const steps: OnboardingStep[] = [
        {
            title: 'Welcome to ColdReach AI',
            description: 'Your AI-powered cold outreach platform. Let\'s set you up in under 2 minutes.',
            icon: Sparkles
        },
        {
            title: 'Configure API Keys',
            description: 'Add your Apify and Hunter.io keys for lead discovery and email enrichment.',
            icon: Key,
            action: 'Configure Keys'
        },
        {
            title: 'Find Your First Leads',
            description: 'Use our scrapers to discover business leads from Google Maps, LinkedIn, or Reddit.',
            icon: Users,
            action: 'Go to Scraper',
            actionHref: '/scraper'
        },
        {
            title: 'Create Email Templates',
            description: 'Set up reusable email templates with variables like {{name}} and {{company}}.',
            icon: Mail,
            action: 'Create Template',
            actionHref: '/templates'
        },
        {
            title: 'Launch Your Campaign',
            description: 'Combine leads and templates to start your automated outreach.',
            icon: Target,
            action: 'Create Campaign',
            actionHref: '/campaigns/new'
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCompleted([...completed, currentStep]);
            setCurrentStep(currentStep + 1);
        }
    };

    const handleSkip = () => {
        setCompleted([...completed, currentStep]);
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishOnboarding();
        }
    };

    const finishOnboarding = () => {
        localStorage.setItem('onboarding_complete', 'true');
        router.push('/');
    };

    const handleActionClick = () => {
        const step = steps[currentStep];
        if (step.title.includes('API Keys')) {
            setShowApiModal(true);
        } else if (step.actionHref) {
            localStorage.setItem('onboarding_complete', 'true');
            router.push(step.actionHref);
        }
    };

    const saveApiKeys = async () => {
        setSaving(true);
        try {
            await fetch('http://localhost:3001/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apifyToken: apiKeys.apify,
                    hunterKey: apiKeys.hunter
                })
            });
            setShowApiModal(false);
            handleNext();
        } catch (error) {
            console.error('Failed to save keys:', error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        // Check if onboarding is already complete
        if (localStorage.getItem('onboarding_complete')) {
            router.push('/');
        }
    }, [router]);

    const CurrentIcon = steps[currentStep].icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full"
            >
                {/* Progress indicators */}
                <div className="flex justify-center gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentStep
                                    ? 'w-8 bg-indigo-500'
                                    : completed.includes(i)
                                        ? 'bg-green-500'
                                        : 'bg-gray-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Main card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-gray-800/50 rounded-2xl border border-gray-700 p-12 text-center"
                    >
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                            <CurrentIcon className="text-indigo-400" size={40} />
                        </div>

                        {/* Content */}
                        <h1 className="text-2xl font-bold text-white mb-4">
                            {steps[currentStep].title}
                        </h1>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            {steps[currentStep].description}
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {steps[currentStep].action && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleActionClick}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium"
                                >
                                    {steps[currentStep].action} <ArrowRight size={18} />
                                </motion.button>
                            )}

                            {currentStep === 0 ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium"
                                >
                                    Get Started <ArrowRight size={18} />
                                </motion.button>
                            ) : currentStep < steps.length - 1 ? (
                                <button
                                    onClick={handleSkip}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Skip for now
                                </button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={finishOnboarding}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-xl font-medium"
                                >
                                    <Check size={18} /> Finish Setup
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Skip all */}
                {currentStep > 0 && currentStep < steps.length - 1 && (
                    <div className="text-center mt-6">
                        <button
                            onClick={finishOnboarding}
                            className="text-sm text-gray-500 hover:text-gray-400"
                        >
                            Skip onboarding and go to dashboard
                        </button>
                    </div>
                )}
            </motion.div>

            {/* API Keys Modal */}
            {showApiModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Key size={20} className="text-indigo-400" />
                                Configure API Keys
                            </h2>
                            <button onClick={() => setShowApiModal(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Apify Token
                                </label>
                                <input
                                    type="password"
                                    value={apiKeys.apify}
                                    onChange={(e) => setApiKeys({ ...apiKeys, apify: e.target.value })}
                                    placeholder="apify_api_xxxxx"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Get from <a href="https://console.apify.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400">console.apify.com</a>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Hunter.io Key
                                </label>
                                <input
                                    type="password"
                                    value={apiKeys.hunter}
                                    onChange={(e) => setApiKeys({ ...apiKeys, hunter: e.target.value })}
                                    placeholder="xxxxx"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Get from <a href="https://hunter.io/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-400">hunter.io</a>
                                </p>
                            </div>

                            <div className="bg-gray-700/50 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">
                                    💡 These keys are optional. You can use Google Maps scraping without them.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => { setShowApiModal(false); handleNext(); }}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Skip
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={saveApiKeys}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium"
                            >
                                {saving ? 'Saving...' : 'Save Keys'}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
