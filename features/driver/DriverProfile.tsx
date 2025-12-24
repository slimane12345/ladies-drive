import React from 'react';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { User as UserIcon, Car, Award, FileText, LogOut, ChevronRight, Star, Shield, CreditCard, Settings, HelpCircle, GraduationCap, Edit3 } from 'lucide-react';
import { TrainingCenterView } from './profile_views/TrainingCenterView';
import { DriverDocumentsView } from './profile_views/DriverDocumentsView';
import { EditVehicleView } from './profile_views/EditVehicleView';
import { DriverSettingsView } from './profile_views/DriverSettingsView';
import { HelpSupportView } from './profile_views/HelpSupportView';
import { DriverPaymentsView } from './profile_views/DriverPaymentsView';

interface DriverProfileProps {
    user: User;
    onClose: () => void;
    onLogout: () => void;
    onUpdateUser?: (user: User) => void;
}

type ProfileSubView = 'MAIN' | 'DOCUMENTS' | 'PAYMENTS' | 'TRAINING' | 'SETTINGS' | 'SUPPORT' | 'VEHICLE';

export const DriverProfile: React.FC<DriverProfileProps> = ({ user, onClose, onLogout, onUpdateUser }) => {
    const [view, setView] = React.useState<ProfileSubView>('MAIN');

    if (!user) return null;

    if (view === 'TRAINING') return <TrainingCenterView onBack={() => setView('MAIN')} />;
    if (view === 'DOCUMENTS') return <DriverDocumentsView user={user} documents={user.documents || {}} onBack={() => setView('MAIN')} onUpdateUser={onUpdateUser} />;
    if (view === 'VEHICLE') return <EditVehicleView user={user} onBack={() => setView('MAIN')} onUpdate={(u) => onUpdateUser?.(u)} />;
    if (view === 'SETTINGS') return <DriverSettingsView onBack={() => setView('MAIN')} />;
    if (view === 'SUPPORT') return <HelpSupportView onBack={() => setView('MAIN')} />;
    if (view === 'PAYMENTS') return <DriverPaymentsView onBack={() => setView('MAIN')} />;
    return (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        <ChevronRight className="h-5 w-5 rotate-180" /> Back
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
                    <div className="w-16"></div> {/* Spacer for centering */}
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {/* Identity Card */}
                <div className="bg-white rounded-3xl shadow-sm p-6 flex items-center gap-6 border border-gray-100">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple overflow-hidden border-4 border-white shadow-lg">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <UserIcon className="h-10 w-10" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 h-8 w-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                            <Shield className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-bold text-gray-800">
                                {typeof user.rating === 'number' ? user.rating.toFixed(1) : '4.9'}
                            </span>
                            <span className="text-gray-400 text-sm">• {user.completedTrips && user.completedTrips > 100 ? 'Gold' : 'Silver'} Member</span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">{user.phoneNumber}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-brand-purple mb-3">
                            <Car className="h-5 w-5" />
                        </div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Rides</p>
                        <p className="text-2xl font-bold text-gray-900">{user.completedTrips || 0}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-3">
                            <Award className="h-5 w-5" />
                        </div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Rating</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {typeof user.rating === 'number' ? user.rating.toFixed(2) : '4.90'}
                        </p>
                    </div>
                </div>

                {/* Vehicle Section */}
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Vehicle Details</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 text-[10px] items-center gap-1 flex font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase">
                                <Shield size={10} /> Verified
                            </span>
                            <button
                                onClick={() => setView('VEHICLE')}
                                className="text-brand-purple hover:bg-purple-50 p-1.5 rounded-lg transition-colors"
                            >
                                <Edit3 size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                <Car className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900">{user.vehicle?.year} {user.vehicle?.make} {user.vehicle?.model}</h4>
                                <p className="text-gray-500">{user.vehicle?.color} • {user.vehicle?.plateNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Options */}
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 divide-y divide-gray-50">
                    <button
                        onClick={() => setView('DOCUMENTS')}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-gray-700">Documents</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                    </button>

                    <button
                        onClick={() => setView('PAYMENTS')}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-gray-700">Payment Methods</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                    </button>

                    <button
                        onClick={() => setView('TRAINING')}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-700">Training Center</span>
                                <span className="text-xs text-orange-500 font-bold">● New Course Available</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                    </button>

                    <button
                        onClick={() => setView('SETTINGS')}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Settings className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-gray-700">Settings</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                    </button>

                    <button
                        onClick={() => setView('SUPPORT')}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-gray-700">Help & Support</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                    </button>
                </div>

                <Button
                    variant="outline"
                    fullWidth
                    className="border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 mt-8 h-12"
                    onClick={onLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" /> Log Out
                </Button>

                <p className="text-center text-xs text-gray-400 pb-6">Version 1.2.0 • Build 4829</p>
            </div>
        </div>
    );
};
