'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Server, Bell, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface ApiKeyConfig {
    apifyToken: string;
    hunterKey: string;
}

interface ApiStatus {
    apify: 'unconfigured' | 'valid' | 'invalid' | 'checking';
    hunter: 'unconfigured' | 'valid' | 'invalid' | 'checking';
}

export default function SettingsPage() {
    const [apiKeys, setApiKeys] = useState<ApiKeyConfig>({
        apifyToken: '',
        hunterKey: ''
    });
    const [status, setStatus] = useState<ApiStatus>({
        apify: 'unconfigured',
        hunter: 'unconfigured'
    });
    const [showApifyKey, setShowApifyKey] = useState(false);
    const [showHunterKey, setShowHunterKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Load current settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/settings');
            if (res.ok) {
                const data = await res.json();
                setApiKeys({
                    apifyToken: data.apifyToken || '',
                    hunterKey: data.hunterKey || ''
                });
                setStatus({
                    apify: data.apifyConfigured ? 'valid' : 'unconfigured',
                    hunter: data.hunterConfigured ? 'valid' : 'unconfigured'
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage(null);

        try {
            const res = await fetch('http://localhost:3001/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiKeys)
            });

            const data = await res.json();

            if (res.ok) {
                setSaveMessage({ type: 'success', text: 'Settings saved successfully! Server will use new keys.' });
                setStatus({
                    apify: data.apifyValid ? 'valid' : apiKeys.apifyToken ? 'invalid' : 'unconfigured',
                    hunter: data.hunterValid ? 'valid' : apiKeys.hunterKey ? 'invalid' : 'unconfigured'
                });
            } else {
                setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' });
            }
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'Connection failed. Is the server running?' });
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'valid':
                return <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle size={12} /> Connected</span>;
            case 'invalid':
                return <span className="flex items-center gap-1 text-xs text-red-400"><AlertCircle size={12} /> Invalid Key</span>;
            case 'checking':
                return <span className="flex items-center gap-1 text-xs text-amber-400"><Loader2 size={12} className="animate-spin" /> Checking...</span>;
            default:
                return <span className="flex items-center gap-1 text-xs text-slate-500"><AlertCircle size={12} /> Not Configured</span>;
        }
    };

    return (
        <div className="p-8 max-w-3xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <SettingsIcon className="text-slate-400" /> Settings
                </h1>
                <p className="text-slate-400">Configure your API keys for LinkedIn scraping and email enrichment.</p>
            </header>

            <div className="space-y-6">
                {/* Email Accounts Quick Link */}
                <section className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <Server size={24} className="text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Email Accounts</h2>
                                <p className="text-sm text-slate-400">Configure SMTP accounts for sending campaigns.</p>
                            </div>
                        </div>
                        <a
                            href="/settings/email-accounts"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            Manage <ExternalLink size={14} />
                        </a>
                    </div>
                </section>

                {/* API Keys Section */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Key size={18} className="text-amber-400" /> API Keys
                    </h2>

                    <div className="space-y-6">
                        {/* Apify Token */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm text-slate-400">Apify API Token</label>
                                {getStatusBadge(status.apify)}
                            </div>
                            <div className="relative">
                                <input
                                    type={showApifyKey ? 'text' : 'password'}
                                    value={apiKeys.apifyToken}
                                    onChange={(e) => setApiKeys({ ...apiKeys, apifyToken: e.target.value })}
                                    placeholder="apify_api_xxxxxxxxxxxx"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowApifyKey(!showApifyKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                >
                                    {showApifyKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                                For LinkedIn & Reddit scraping.
                                <a href="https://console.apify.com/account/integrations" target="_blank" className="text-indigo-400 hover:underline flex items-center gap-1">
                                    Get your token <ExternalLink size={10} />
                                </a>
                            </p>
                        </div>

                        {/* Hunter.io Key */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm text-slate-400">Hunter.io API Key</label>
                                {getStatusBadge(status.hunter)}
                            </div>
                            <div className="relative">
                                <input
                                    type={showHunterKey ? 'text' : 'password'}
                                    value={apiKeys.hunterKey}
                                    onChange={(e) => setApiKeys({ ...apiKeys, hunterKey: e.target.value })}
                                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowHunterKey(!showHunterKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                >
                                    {showHunterKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                                For email finding (25 free/month).
                                <a href="https://hunter.io/api-keys" target="_blank" className="text-indigo-400 hover:underline flex items-center gap-1">
                                    Get your key <ExternalLink size={10} />
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <p className="text-sm text-slate-400">
                            <strong className="text-white">Note:</strong> Without API keys, the system uses mock data for LinkedIn/Reddit and pattern-based email generation. Configure keys for real data.
                        </p>
                    </div>
                </section>

                {/* Server Config */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Server size={18} className="text-blue-400" /> Server Status
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase mb-1">Backend API</p>
                            <p className="text-emerald-400 font-medium flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                http://localhost:3001
                            </p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase mb-1">Queue Worker</p>
                            <p className="text-emerald-400 font-medium flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                Active
                            </p>
                        </div>
                    </div>
                </section>

                {/* Notifications */}
                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Bell size={18} className="text-emerald-400" /> Notifications
                    </h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Job Completion Alerts</p>
                            <p className="text-xs text-slate-500">Get notified when scraping jobs complete.</p>
                        </div>
                        <button className="w-12 h-6 bg-emerald-600 rounded-full relative">
                            <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                        </button>
                    </div>
                </section>

                {/* Save Message */}
                {saveMessage && (
                    <div className={`p-4 rounded-lg ${saveMessage.type === 'success' ? 'bg-emerald-900/50 border border-emerald-500/30 text-emerald-400' : 'bg-red-900/50 border border-red-500/30 text-red-400'}`}>
                        {saveMessage.text}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : null}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
