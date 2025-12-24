import React, { useState } from 'react';
import { ChevronLeft, Bell, Shield, Lock, Eye, Globe, Moon, Smartphone } from 'lucide-react';

interface DriverSettingsViewProps {
    onBack: () => void;
}

export const DriverSettingsView: React.FC<DriverSettingsViewProps> = ({ onBack }) => {
    const [settings, setSettings] = useState({
        pushNotifications: true,
        emailNotifications: false,
        safetyMonitoring: true,
        highEarningsAlerts: true,
        automaticNightMode: false,
        locationSharing: true
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-[60] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        <ChevronLeft className="h-6 w-6" /> Back
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Settings</h1>
                    <div className="w-12"></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {/* Notifications Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-4">Notifications</h3>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-gray-700">Push Notifications</span>
                            </div>
                            <Switch enabled={settings.pushNotifications} onToggle={() => toggle('pushNotifications')} />
                        </div>
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                                    <Smartphone className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-gray-700">Earnings Alerts</span>
                            </div>
                            <Switch enabled={settings.highEarningsAlerts} onToggle={() => toggle('highEarningsAlerts')} />
                        </div>
                    </div>
                </div>

                {/* Safety & Privacy Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-4">Safety & Privacy</h3>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-gray-700">Safety Monitoring</span>
                            </div>
                            <Switch enabled={settings.safetyMonitoring} onToggle={() => toggle('safetyMonitoring')} />
                        </div>
                        <div className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-gray-700">Change Password</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* App Display Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-4">Preferences</h3>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-gray-700">Language</span>
                            </div>
                            <span className="text-sm text-gray-400 font-bold">English (UK)</span>
                        </div>
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-brand-purple/10 text-brand-purple rounded-full flex items-center justify-center">
                                    <Moon className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-gray-700">Automatic Night Mode</span>
                            </div>
                            <Switch enabled={settings.automaticNightMode} onToggle={() => toggle('automaticNightMode')} />
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8">
                    <button className="text-red-500 font-bold text-sm hover:underline">Deactivate my account</button>
                    <p className="text-xs text-gray-400 mt-4 leading-relaxed px-12">
                        Ladies Drive values your privacy. Some changes may take up to 24 hours to propagate across our secure network.
                    </p>
                </div>
            </div>
            <div className="h-12"></div>
        </div>
    );
};

const Switch: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-brand-purple' : 'bg-gray-200'}`}
    >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
    </button>
);
