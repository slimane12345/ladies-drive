import React, { useState, useMemo, useEffect } from 'react';
import { AccountStatus, AdminUser } from './mockData';
import { Search, Filter, Download, Plus, MoreVertical, Star, Eye, Edit, Trash2, Shield, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { db } from '../../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { UserRole } from '../../../types';

interface PassengerListProps {
    onViewDetails: (user: AdminUser) => void;
}

export const PassengerList: React.FC<PassengerListProps> = ({ onViewDetails }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch Users from Firestore
    useEffect(() => {
        const q = query(collection(db, "users"), where("role", "==", UserRole.PASSENGER));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedUsers: AdminUser[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || 'Unknown',
                    role: UserRole.PASSENGER,
                    avatarUrl: data.avatarUrl || 'https://via.placeholder.com/150',
                    email: data.email || '',
                    phoneNumber: data.phoneNumber || '',
                    registrationDate: data.createdAt || new Date().toISOString(),
                    status: data.status || AccountStatus.ACTIVE, // Default to Active if not set
                    rating: data.rating || 5.0,
                    totalTrips: data.totalTrips || 0,
                    totalSpend: data.totalSpend || 0,
                    lastActive: data.lastActive || new Date().toISOString(),
                    paymentMethod: data.paymentMethod || 'Cash',
                    city: data.city || 'Casablanca',
                    verificationStatus: data.verificationStatus || 'UNVERIFIED',
                    address: data.address,
                    birthDate: data.birthDate,
                    emergencyContact: data.emergencyContact,
                    idCardUrl: data.idCardUrl
                } as AdminUser;
            });
            setUsers(fetchedUsers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Stats based on real data
    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === AccountStatus.ACTIVE).length,
        new: users.filter(u => new Date(u.registrationDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        verified: users.filter(u => u.verificationStatus === 'VERIFIED').length,
    }), [users]);

    // Filter & Search
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phoneNumber.includes(searchTerm);
            const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, filterStatus]);

    // Pagination
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-brand-purple h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase font-bold">Total Passengers</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-green-600 text-xs uppercase font-bold">Active Users</p>
                    <h3 className="text-2xl font-bold text-green-700">{stats.active}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-brand-purple text-xs uppercase font-bold">New (7d)</p>
                    <h3 className="text-2xl font-bold text-brand-purple">{stats.new}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-blue-600 text-xs uppercase font-bold">Verified Identity</p>
                    <h3 className="text-2xl font-bold text-blue-700">{stats.verified}</h3>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            {/* We can hardcode options or derive from data, but enum is safer */}
                            {Object.values(AccountStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
                    <Button><Plus className="h-4 w-4 mr-2" /> Add User</Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trips</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Spend</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">City</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No passengers found.
                                    </td>
                                </tr>
                            ) : paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-purple-50/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 relative">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt="" />
                                                {user.verificationStatus === 'VERIFIED' && (
                                                    <span className="absolute -mt-3 -ml-1 bg-green-500 border-2 border-white rounded-full p-0.5">
                                                        <Shield className="h-2 w-2 text-white" />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.phoneNumber}</div>
                                                <div className="text-xs text-gray-400">{new Date(user.registrationDate).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${user.status === AccountStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                                                user.status === AccountStatus.REVIEW ? 'bg-yellow-100 text-yellow-800' :
                                                    user.status === AccountStatus.SUSPENDED ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                                            {user.rating?.toFixed(1)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-brand-purple h-full" style={{ width: `${Math.min(user.totalTrips, 100)}%` }}></div>
                                            </div>
                                            {user.totalTrips}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ${user.totalSpend.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.city || 'Casablanca'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => onViewDetails(user)} className="text-gray-400 hover:text-brand-purple p-2 hover:bg-purple-50 rounded-lg">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> results
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
