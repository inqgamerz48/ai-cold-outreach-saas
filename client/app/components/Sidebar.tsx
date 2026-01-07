'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Search, Database, Settings, Linkedin, Hash,
    MapPin, Users, Zap, Mail, BarChart3, ChevronRight, Terminal, Cpu
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'DASHBOARD', icon: LayoutDashboard },
        { href: '/scraper', label: 'MULTI_SCRAPER', icon: Search },
        { href: '/leads', label: 'LEAD_DATABASE', icon: Database },
        { href: '/personas', label: 'PERSONAS', icon: Users },
        { href: '/jobs', label: 'JOB_HISTORY', icon: BarChart3 },
        { href: '/campaigns', label: 'CAMPAIGNS', icon: Mail },
        { href: '/templates', label: 'TEMPLATES', icon: Mail },
        { href: '/email-accounts', label: 'EMAIL_ACCOUNTS', icon: Mail },
        { href: '/ab-testing', label: 'A/B_TESTING', icon: BarChart3 },
        { href: '/analytics', label: 'ANALYTICS', icon: BarChart3 },
        { href: '/settings', label: 'SETTINGS', icon: Settings },
    ];

    const scraperLinks = [
        { href: '/scraper/google-maps', label: 'MAPS_EXTRACTOR', icon: MapPin },
        { href: '/scraper/linkedin', label: 'LINKEDIN_MINER', icon: Linkedin },
        { href: '/scraper/reddit', label: 'REDDIT_OSINT', icon: Hash },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-panel border-r border-[#222] flex flex-col z-50">
            {/* Logo */}
            <div className="p-8 border-b border-[#222]">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-acid flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                        <Zap className="text-black" size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-xl font-heading text-white tracking-wider group-hover:text-acid transition-colors">NEXUS</h1>
                        <p className="text-[10px] text-[#555] font-mono uppercase tracking-[0.2em]">INTELLIGENCE</p>
                    </div>
                </Link>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 py-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                <div>
                    <p className="px-6 text-[10px] text-[#444] uppercase tracking-widest mb-2 font-mono">Core Modules</p>
                    <div className="flex flex-col">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative pl-6 pr-4 py-3 flex items-center gap-3 text-xs font-mono transition-all duration-200 group border-l-2 ${isActive
                                            ? 'text-acid bg-[#111] border-acid'
                                            : 'text-[#888] hover:text-white hover:bg-[#0f0f0f] border-transparent hover:border-[#333]'
                                        }`}
                                >
                                    <item.icon
                                        size={16}
                                        className={isActive ? 'text-acid' : 'text-[#555] group-hover:text-white transition-colors'}
                                    />
                                    <span className="tracking-wider">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute right-4 w-1.5 h-1.5 bg-acid rounded-full"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <p className="px-6 text-[10px] text-[#444] uppercase tracking-widest mb-2 font-mono">Extraction Units</p>
                    <div className="flex flex-col">
                        {scraperLinks.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative pl-6 pr-4 py-3 flex items-center gap-3 text-xs font-mono transition-all duration-200 group border-l-2 ${isActive
                                            ? 'text-acid bg-[#111] border-acid'
                                            : 'text-[#888] hover:text-white hover:bg-[#0f0f0f] border-transparent hover:border-[#333]'
                                        }`}
                                >
                                    <item.icon
                                        size={16}
                                        className={isActive ? 'text-acid' : 'text-[#555] group-hover:text-white transition-colors'}
                                    />
                                    <span className="tracking-wider">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-[#222] bg-[#080808]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 animate-ping" />
                    </div>
                    <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider">
                        System Online
                    </div>
                </div>

                <div className="flex items-center justify-between text-[#333]">
                    <Cpu size={14} />
                    <span className="text-[10px] font-mono">CPU: 12%</span>
                    <div className="w-16 h-1 bg-[#222] overflow-hidden">
                        <div className="h-full bg-[#333] w-[12%]"></div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
