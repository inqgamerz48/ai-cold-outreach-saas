'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Search, Database, Settings, Linkedin, Hash,
    MapPin, Users, Zap, Mail, BarChart3, ChevronRight
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/scraper', label: 'Multi-Scraper', icon: Search },
        { href: '/leads', label: 'Leads Database', icon: Database },
        { href: '/personas', label: 'Personas', icon: Users },
        { href: '/jobs', label: 'Job History', icon: BarChart3 },
        { href: '/campaigns', label: 'Campaigns', icon: Mail },
        { href: '/templates', label: 'Templates', icon: Mail },
        { href: '/email-accounts', label: 'Email Accounts', icon: Mail },
        { href: '/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    const scraperLinks = [
        { href: '/scraper/google-maps', label: 'Google Maps', icon: MapPin, color: 'text-blue-400' },
        { href: '/scraper/linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-indigo-400' },
        { href: '/scraper/reddit', label: 'Reddit', icon: Hash, color: 'text-orange-400' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-slate-800/50 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800/50">
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div
                        className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg glow"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Zap className="text-white" size={22} />
                    </motion.div>
                    <div>
                        <h1 className="text-lg font-bold gradient-text group-hover:text-indigo-300 transition-colors">LeadGen Pro</h1>
                        <p className="text-xs text-slate-500">v3.0 - Universal Engine</p>
                    </div>
                </Link>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="text-xs text-slate-600 uppercase tracking-wider mb-3 px-3 font-medium">Main Menu</p>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-1"
                >
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <motion.div key={item.href} variants={itemVariants}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                        ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon
                                            size={18}
                                            className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'}
                                        />
                                        <span>{item.label}</span>
                                    </div>
                                    {isActive && (
                                        <ChevronRight size={14} className="text-indigo-400" />
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <div className="pt-4">
                    <p className="text-xs text-slate-600 uppercase tracking-wider mb-3 px-3 font-medium">Quick Scrapers</p>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-1"
                    >
                        {scraperLinks.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <motion.div key={item.href} variants={itemVariants}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                            ? 'bg-gradient-to-r from-emerald-600/20 to-cyan-600/10 text-emerald-400 border border-emerald-500/30'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <item.icon
                                            size={18}
                                            className={isActive ? 'text-emerald-400' : `${item.color} opacity-60 group-hover:opacity-100 transition-opacity`}
                                        />
                                        {item.label}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800/50">
                <motion.div
                    className="glass rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">System Status</p>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm text-emerald-400 font-medium">All Systems Operational</span>
                    </div>
                </motion.div>

                {/* Version Info */}
                <div className="mt-3 px-2 text-center">
                    <p className="text-[10px] text-slate-600">
                        © 2024 LeadGen Pro
                    </p>
                </div>
            </div>
        </aside>
    );
}
