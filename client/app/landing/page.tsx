'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Mail, Search, BarChart3, Shield, Sparkles, ArrowRight,
    Check, MessageSquare, Target, Users, Bot, Globe,
    Eye, Flame, Scissors
} from 'lucide-react';
import Link from 'next/link';
import { GojoVoid, SukunaShrine, SukunaSlash, DomainExpansion } from '../components/JujutsuAnimations';

export default function LandingPage() {
    const [theme, setTheme] = useState<'gojo' | 'sukuna'>('gojo');
    const [slashAction, setSlashAction] = useState(false);

    const triggerSlash = () => {
        setSlashAction(true);
        setTimeout(() => setSlashAction(false), 800);
    };

    const features = [
        {
            icon: Search,
            title: 'Multi-Source Lead Discovery',
            description: 'Find leads from Google Maps, LinkedIn, Reddit, and Twitter in one unified platform.'
        },
        {
            icon: Mail,
            title: 'Email Enrichment',
            description: 'Automatically find email addresses using Hunter.io integration.'
        },
        {
            icon: Bot,
            title: 'AI-Powered Personalization',
            description: 'Generate personalized emails with GPT-4 that actually convert.'
        },
        {
            icon: MessageSquare,
            title: 'Smart Reply Classification',
            description: 'AI automatically categorizes replies as interested, not interested, or questions.'
        },
        {
            icon: Target,
            title: 'Campaign Management',
            description: 'Create, schedule, and track email campaigns with daily limits.'
        },
        {
            icon: BarChart3,
            title: 'Real-Time Analytics',
            description: 'Track open rates, reply rates, and sentiment across all campaigns.'
        }
    ];

    const stats = [
        { value: '10x', label: 'Faster than manual outreach' },
        { value: '85%', label: 'Email deliverability rate' },
        { value: '3x', label: 'More replies with AI personalization' }
    ];

    return (
        <DomainExpansion theme={theme}>
            <div className={`min-h-screen transition-colors duration-1000 ${theme === 'gojo' ? 'text-white' : 'text-red-50'}`}>
                <SukunaSlash trigger={slashAction} />

                {/* Theme Toggle / Domain Switcher */}
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                    <button
                        onClick={() => setTheme('gojo')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-500 ${theme === 'gojo' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Eye size={18} /> <span className="text-sm font-bold uppercase tracking-widest">Infinity</span>
                    </button>
                    <button
                        onClick={() => setTheme('sukuna')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-500 ${theme === 'sukuna' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'text-gray-400 hover:text-red-400'}`}
                    >
                        <Flame size={18} /> <span className="text-sm font-bold uppercase tracking-widest">Shrine</span>
                    </button>
                    <button
                        onClick={triggerSlash}
                        className="p-2.5 text-white/40 hover:text-white transition-colors"
                        title="Dismantle"
                    >
                        <Scissors size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b transition-colors duration-500 ${theme === 'gojo' ? 'bg-gray-900/60 border-gray-800' : 'bg-red-950/40 border-red-900/30'}`}>
                    <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${theme === 'gojo' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-red-600 to-black'}`}
                            >
                                <Zap size={24} className="text-white" />
                            </motion.div>
                            <span className="text-xl font-bold">ColdReach AI</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/scraper" className="text-gray-400 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <Link href="/campaigns" className={`px-4 py-2 rounded-lg font-medium text-white transition-all duration-500 ${theme === 'gojo' ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.3)]' : 'bg-red-700 shadow-[0_0_15px_rgba(185,28,28,0.3)]'} hover:opacity-90`}>
                                Get Started
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-40 pb-20 px-6 relative">
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 transition-colors duration-500 ${theme === 'gojo' ? 'bg-indigo-900/30 border-indigo-500/30 text-indigo-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}>
                                <Sparkles size={16} />
                                {theme === 'gojo' ? 'Through the Six Eyes Outreach' : 'Cursed Spirit Lead Discovery'}
                            </span>

                            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
                                <span className={`bg-gradient-to-r bg-clip-text text-transparent transition-all duration-1000 ${theme === 'gojo' ? 'from-white via-blue-200 to-indigo-400' : 'from-red-500 via-orange-600 to-black'}`}>
                                    {theme === 'gojo' ? 'Unlimited' : 'Malevolent'}
                                </span>
                                <br />
                                <span className={`bg-gradient-to-r bg-clip-text text-transparent transition-all duration-1000 ${theme === 'gojo' ? 'from-indigo-400 via-purple-400 to-white' : 'from-black via-red-900 to-red-600'}`}>
                                    {theme === 'gojo' ? 'Expansion' : 'Shrine'}
                                </span>
                            </h1>

                            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-medium">
                                {theme === 'gojo' ? 'Achieve infinite reach with AI that learns and adapts. The absolute peak of cold outreach automation.' : 'Dismantle your competition. Cleave through data to find the hottest leads in the industry.'}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link
                                    href="/scraper"
                                    onClick={triggerSlash}
                                    className={`group flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-500 ${theme === 'gojo' ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)]' : 'bg-red-700 text-white shadow-[0_0_30px_rgba(185,28,28,0.4)] hover:shadow-[0_0_50px_rgba(185,28,28,0.6)]'}`}
                                >
                                    Activate System <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="/campaigns" className="flex items-center gap-2 px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl font-bold text-xl text-gray-300 hover:bg-white/10 transition-all">
                                    Analyze Data
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats */}
                <section className={`py-16 border-y transition-colors duration-500 ${theme === 'gojo' ? 'border-gray-800 bg-gray-900/20' : 'border-red-900/30 bg-red-950/10'}`}>
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2 }}
                                    className="text-center"
                                >
                                    <div className={`text-5xl font-black mb-2 bg-gradient-to-r bg-clip-text text-transparent ${theme === 'gojo' ? 'from-blue-400 to-indigo-500' : 'from-red-600 to-red-400'}`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-400 font-bold tracking-widest uppercase text-xs">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="max-w-6xl mx-auto relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-black mb-6">
                                Cursed Technical Arsenal
                            </h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                                Master the arts of lead discovery and AI outreach with our specialized tools.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 * i }}
                                    whileHover={{ y: -10 }}
                                    className={`p-10 rounded-3xl border backdrop-blur-md transition-all duration-500 ${theme === 'gojo' ? 'bg-gray-800/40 border-gray-700 hover:border-indigo-500' : 'bg-red-950/20 border-red-900/40 hover:border-red-500'}`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-colors duration-500 ${theme === 'gojo' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-500'}`}>
                                        <feature.icon size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className={`py-16 px-6 border-t transition-colors duration-500 ${theme === 'gojo' ? 'border-gray-800' : 'border-red-900/30'}`}>
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'gojo' ? 'bg-indigo-600' : 'bg-red-700'}`}>
                                <Zap size={22} className="text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">ColdReach AI</span>
                        </div>
                        <div className="text-gray-500 font-medium">
                            © 2025 The Peak of Cold Outreach. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </DomainExpansion>
    );
}
