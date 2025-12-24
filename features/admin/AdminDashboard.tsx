import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Car, TrendingUp, AlertCircle, DollarSign, Bell } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { PassengerList } from './passengers/PassengerList';
import { PassengerDetails } from './passengers/PassengerDetails';
import { DriverList } from './drivers/DriverList';
import { DriverDetails } from './drivers/DriverDetails';
import { AdminUser } from './passengers/mockData';
import { AdminDriver } from './drivers/mockDriverData';

const data = [
    { name: 'Mon', trips: 400, rev: 2400 },
    { name: 'Tue', trips: 300, rev: 1398 },
    { name: 'Wed', trips: 550, rev: 3800 },
    { name: 'Thu', trips: 480, rev: 3000 },
    { name: 'Fri', trips: 700, rev: 4800 },
    { name: 'Sat', trips: 850, rev: 5600 },
    { name: 'Sun', trips: 790, rev: 5100 },
];

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<AdminDriver | null>(null);

    const handleViewUser = (user: AdminUser) => setSelectedUser(user);
    const handleBackToUsers = () => setSelectedUser(null);

    const handleViewDriver = (driver: AdminDriver) => setSelectedDriver(driver);
    const handleBackToDrivers = () => setSelectedDriver(null);

    const renderContent = () => {
        if (activeTab === 'Users') {
            if (selectedUser) return <PassengerDetails user={selectedUser} onBack={handleBackToUsers} />;
            return <PassengerList onViewDetails={handleViewUser} />;
        }

        if (activeTab === 'Drivers') {
            if (selectedDriver) return <DriverDetails driver={selectedDriver} onBack={handleBackToDrivers} />;
            return <DriverList onViewDetails={handleViewDriver} />;
        }

        // Default Dashboard
        return (
            <>
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
                        <p className="text-gray-500">Welcome back, Admin.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline">Export Reports</Button>
                        <Button>Add New Admin</Button>
                    </div>
                </header>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Revenue', val: '$45,231', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Active Trips', val: '142', icon: Car, color: 'text-brand-purple', bg: 'bg-purple-50' },
                        { label: 'New Users', val: '+240', icon: Users, color: 'text-brand-pink', bg: 'bg-pink-50' },
                        { label: 'Pending Drivers', val: '12', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.val}</h3>
                            </div>
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-6">Revenue Analytics</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8A4FFF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8A4FFF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} prefix="$" />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="rev" stroke="#8A4FFF" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-6">Weekly Trips</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Bar dataKey="trips" fill="#FF6B9D" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
                        Ladies Drive
                    </h1>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Admin Panel</p>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {['Dashboard', 'Users', 'Drivers', 'Trips', 'Financials', 'Settings'].map((item) => (
                        <button
                            key={item}
                            onClick={() => { setActiveTab(item); setSelectedUser(null); setSelectedDriver(null); }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {item}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};