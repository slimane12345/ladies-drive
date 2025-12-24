import React, { useState, useMemo, useEffect } from 'react';
import { DriverStatus, AdminDriver } from './mockDriverData';
import { Search, Filter, Download, Plus, Star, Eye, Edit, Trash2, MoreVertical, Car, DollarSign, Clock, X, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { collection, query, where, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

interface DriverListProps {
    onViewDetails: (driver: AdminDriver) => void;
}

export const DriverList: React.FC<DriverListProps> = ({ onViewDetails }) => {
    const [drivers, setDrivers] = useState<AdminDriver[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDriver, setNewDriver] = useState({ name: '', email: '', phone: '' });
    const itemsPerPage = 8;

    // Real-time Data Fetching
    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            where('role', '==', 'DRIVER')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedDrivers: AdminDriver[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    name: data.name || 'Unknown Driver',
                    email: data.email || '',
                    role: 'DRIVER',
                    avatarUrl: data.avatarUrl || 'https://via.placeholder.com/150',
                    status: mapVerificationToStatus(data.verificationStatus),
                    totalEarnings: data.totalEarnings || 0,
                    tripsToday: data.tripsToday || 0,
                    earningsToday: data.earningsToday || 0,
                    rating: data.rating || 5.0,
                    totalTrips: data.totalTrips || 0,
                    acceptanceRate: data.acceptanceRate || 100,
                    cancellationRate: data.cancellationRate || 0,
                    city: data.city || 'Riyadh',
                    membershipType: data.membershipType || 'Standard',
                    joinDate: data.createdAt || new Date().toISOString(),
                    vehicle: data.vehicle,
                    documents: data.documents,
                    phoneNumber: data.phoneNumber,
                    verificationStatus: data.verificationStatus
                } as AdminDriver;
            });
            setDrivers(fetchedDrivers);
        });

        return () => unsubscribe();
    }, []);

    const mapVerificationToStatus = (vStatus?: string): DriverStatus => {
        if (vStatus === 'PENDING') return DriverStatus.PENDING;
        if (vStatus === 'VERIFIED') return DriverStatus.ACTIVE;
        if (vStatus === 'REJECTED') return DriverStatus.REJECTED;
        return DriverStatus.PENDING;
    };

    // Actions
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this driver?')) return;
        try {
            await deleteDoc(doc(db, 'users', id));
            alert('Driver deleted successfully.');
        } catch (e) {
            console.error(e);
            alert('Failed to delete driver.');
        }
    };

    const handleExport = () => {
        const headers = ['Name', 'Email', 'Phone', 'Status', 'Earnings', 'Rating'];
        const rows = filteredDrivers.map(d => [
            d.name,
            d.email,
            d.phoneNumber || '',
            d.status,
            d.totalEarnings,
            d.rating
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "drivers_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddDriver = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const id = 'd_' + Date.now(); // Mock ID generation
            await setDoc(doc(db, 'users', id), {
                name: newDriver.name,
                email: newDriver.email,
                phoneNumber: newDriver.phone,
                role: 'DRIVER',
                verificationStatus: 'PENDING',
                createdAt: new Date().toISOString(),
                status: 'Pending'
            });
            setShowAddModal(false);
            setNewDriver({ name: '', email: '', phone: '' });
            alert('Driver added successfully! Access details to verify.');
        } catch (error) {
            console.error(error);
            alert('Failed to create driver.');
        }
    };

    // Stats
    const stats = useMemo(() => ({
        total: drivers.length,
        active: drivers.filter(d => d.status === DriverStatus.ACTIVE || d.status === DriverStatus.IN_SERVICE).length,
        pending: drivers.filter(d => d.status === DriverStatus.PENDING).length,
        earningsToday: drivers.reduce((acc, curr) => acc + (curr.earningsToday || 0), 0)
    }), [drivers]);

    // Filter Logic
    const filteredDrivers = useMemo(() => {
        return drivers.filter(driver => {
            const matchesSearch =
                driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                driver.phoneNumber?.includes(searchTerm);

            const matchesStatus = filterStatus === 'All' || driver.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [drivers, searchTerm, filterStatus]);

    // Pagination
    const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);

    return (
        <div className="space-y-6 animate-fade-in relative">
            {/* Add Driver Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Add New Driver</h2>
                            <button onClick={() => setShowAddModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleAddDriver} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input required className="w-full bg-gray-50 border p-2 rounded-lg" value={newDriver.name} onChange={e => setNewDriver({ ...newDriver, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" required className="w-full bg-gray-50 border p-2 rounded-lg" value={newDriver.email} onChange={e => setNewDriver({ ...newDriver, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input required className="w-full bg-gray-50 border p-2 rounded-lg" value={newDriver.phone} onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })} />
                            </div>
                            <Button fullWidth className="bg-brand-purple mt-4">Create Account</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold">Total Drivers</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Car size={20} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-green-600 text-xs uppercase font-bold">Active Now</p>
                        <h3 className="text-2xl font-bold text-green-700">{stats.active}</h3>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg text-green-600"><Clock size={20} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-orange-500 text-xs uppercase font-bold">Pending Approval</p>
                        <h3 className="text-2xl font-bold text-orange-600">{stats.pending}</h3>
                    </div>
                    <div className="bg-orange-50 p-2 rounded-lg text-orange-600"><Eye size={20} /></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-brand-purple text-xs uppercase font-bold">Earnings (Today)</p>
                        <h3 className="text-2xl font-bold text-brand-purple">${stats.earningsToday.toLocaleString()}</h3>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-lg text-brand-purple"><DollarSign size={20} /></div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search drivers..."
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
                            {Object.values(DriverStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Filter className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                    <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export</Button>
                    <Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Driver</Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Driver</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Vehicle</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Rating</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Total Earnings</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">City</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedDrivers.map((driver) => (
                            <tr key={driver.id} className="hover:bg-purple-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={driver.avatarUrl} alt="" />
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-gray-900">{driver.name}</div>
                                            <div className="text-xs text-gray-500">{driver.phoneNumber}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${driver.status === DriverStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                                            driver.status === DriverStatus.IN_SERVICE ? 'bg-blue-100 text-blue-800' :
                                                driver.status === DriverStatus.PENDING ? 'bg-orange-100 text-orange-800' :
                                                    driver.status === DriverStatus.REJECTED ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                        {driver.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{driver.vehicle?.make} {driver.vehicle?.model}</div>
                                    <div className="text-xs text-gray-500">{driver.vehicle?.plateNumber}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                                        {driver.rating.toFixed(1)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    ${driver.totalEarnings.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {driver.city}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onViewDetails(driver)} className="text-gray-400 hover:text-brand-purple p-2 hover:bg-purple-50 rounded-lg">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => onViewDetails(driver)} className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(driver.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredDrivers.length)}</span> of <span className="font-medium">{filteredDrivers.length}</span> drivers
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
