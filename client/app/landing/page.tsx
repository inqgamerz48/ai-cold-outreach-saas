'use client';

import { motion } from 'framer-motion';
import {
    Zap, Mail, Search, BarChart3, Shield, Sparkles, ArrowRight,
    Check, MessageSquare, Target, Users, Bot, Globe
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Zap size={24} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">ColdReach AI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/scraper" className="text-gray-400 hover:text-white transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/campaigns" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-medium text-white hover:opacity-90 transition-opacity">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-400 text-sm font-medium mb-6">
                            <Sparkles size={16} />
                            AI-Powered Cold Outreach
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                                Turn Cold Leads Into
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Hot Conversations
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            Discover leads, enrich contacts, and send AI-personalized emails at scale.
                            The complete outreach platform for modern sales teams.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/scraper" className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity">
                                Start Free <ArrowRight size={20} />
                            </Link>
                            <Link href="/campaigns" className="flex items-center gap-2 px-8 py-4 bg-gray-800 rounded-xl font-semibold text-lg text-gray-300 hover:bg-gray-700 transition-colors">
                                View Dashboard
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 border-y border-gray-800">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className="text-gray-400 mt-1">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Everything You Need for Outreach
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            From lead discovery to reply tracking, we've got your entire outreach workflow covered.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-indigo-500/50 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                                    <feature.icon className="text-indigo-400" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6 bg-gray-800/30">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-gray-400">Three simple steps to start generating leads</p>
                    </div>

                    <div className="space-y-8">
                        {[
                            { step: 1, title: 'Find Leads', desc: 'Search Google Maps, LinkedIn, or Reddit for your ideal customers' },
                            { step: 2, title: 'Enrich & Personalize', desc: 'We find emails and AI generates personalized outreach messages' },
                            { step: 3, title: 'Send & Track', desc: 'Launch campaigns, monitor replies, and close deals' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 * i }}
                                className="flex items-start gap-6"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                                    <p className="text-gray-400">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-12 rounded-2xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to 10x Your Outreach?
                        </h2>
                        <p className="text-gray-300 mb-8">
                            Join thousands of sales teams using ColdReach AI to book more meetings.
                        </p>
                        <Link href="/scraper" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors">
                            Get Started Free <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-gray-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Zap size={18} className="text-white" />
                        </div>
                        <span className="font-semibold text-white">ColdReach AI</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        © 2025 ColdReach AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
