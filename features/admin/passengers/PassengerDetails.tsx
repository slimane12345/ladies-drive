import React, { useState } from 'react';
import { AdminUser, AccountStatus } from './mockData';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, Shield, CreditCard, Star, Bell, Settings, Ban, CheckCircle, AlertTriangle } from 'lucide-react';

interface PassengerDetailsProps {
    user: AdminUser;
    onBack: () => void;
}

export const PassengerDetails: React.FC<PassengerDetailsProps> = ({ user, onBack }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'trips' | 'payments' | 'settings'>('info');

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header / Breacrumbs */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={onBack} size="sm" className="rounded-full h-8 w-8 p-0 flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">User Profile</h2>
                    <p className="text-sm text-gray-500">Manage user details and settings</p>
                </div>
                <div className="ml-auto flex gap-2">
                    {user.status !== AccountStatus.ACTIVE ? (
                        <Button className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4 mr-2" /> Activate Account</Button>
                    ) : (
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"><Ban className="h-4 w-4 mr-2" /> Suspend User</Button>
                    )}
                    <Button variant="outline"><Bell className="h-4 w-4 mr-2" /> Notify</Button>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                <img src={user.avatarUrl} alt="" className="h-24 w-24 rounded-2xl object-cover bg-gray-100" />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                {user.name}
                                {user.verificationStatus === 'VERIFIED' && <Shield className="h-5 w-5 text-blue-500 fill-current" />}
                            </h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {user.city}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {new Date(user.registrationDate).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-400" /> {user.rating?.toFixed(1)} Rating</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-sm px-3 py-1 rounded-full font-bold inline-block
                                ${user.status === AccountStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {user.status}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">ID: {user.id}</p>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mt-6 border-t border-gray-100 pt-6">
                        <div className="text-center md:text-left">
                            <p className="text-xs text-gray-400 uppercase font-bold">Total Trips</p>
                            <p className="text-xl font-bold text-gray-900">{user.totalTrips}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-xs text-gray-400 uppercase font-bold">Total Spent</p>
                            <p className="text-xl font-bold text-gray-900">${user.totalSpend.toLocaleString()}</p>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-xs text-gray-400 uppercase font-bold">Wallet Balance</p>
                            <p className="text-xl font-bold text-brand-purple">$0.00</p>
                        </div>
                        <div className="text-center md:text-left">
                            <p className="text-xs text-gray-400 uppercase font-bold">Last Active</p>
                            <p className="text-sm font-medium text-gray-700">{new Date(user.lastActive).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                <div className="border-b border-gray-100 px-6 flex gap-8">
                    {['info', 'trips', 'payments', 'settings'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 text-sm font-bold capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-brand-purple text-brand-purple' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Email Address</p>
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Phone Number</p>
                                            <p className="font-medium">{user.phoneNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Default Address</p>
                                            <p className="font-medium">{user.address || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Security & Verification</h3>
                                <div className="p-4 border border-gray-100 rounded-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-700">Identity Verification</span>
                                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${user.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {user.verificationStatus || 'Unverified'}
                                        </span>
                                    </div>
                                    {user.verificationStatus !== 'VERIFIED' && (
                                        <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-700 flex gap-2">
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                            User has pending identity documents or has not submitted them yet.
                                        </div>
                                    )}
                                    {user.idCardUrl && (
                                        <div className="mt-4">
                                            <p className="text-xs text-gray-500 mb-2">Submitted ID</p>
                                            <img src={user.idCardUrl} className="h-32 w-full object-cover rounded-lg border" />
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">Approve</Button>
                                                <Button size="sm" variant="outline" className="w-full text-red-600">Reject</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'trips' && (
                        <div className="text-center py-10 text-gray-500">
                            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Trip History</h3>
                            <p>List of recent trips will appear here.</p>
                            {/* Placeholder for list tables implemented similarly to PassengerList */}
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="text-center py-10 text-gray-500">
                            <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <h3>No payment history found.</h3>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-md">
                            <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
                            <div className="border border-red-100 bg-red-50 rounded-xl p-4">
                                <h4 className="font-bold text-red-800 text-sm">Delete Account</h4>
                                <p className="text-xs text-red-600 mt-1 mb-3">Permanently delete this user and all associated data.</p>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white border-none">Delete User</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
