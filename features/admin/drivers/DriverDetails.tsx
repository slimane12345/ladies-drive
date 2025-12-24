import React, { useState } from 'react';
import { AdminDriver, DriverStatus } from './mockDriverData';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, User, Car, FileText, Calendar, DollarSign, Star, MessageSquare, AlertTriangle, Shield, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

interface DriverDetailsProps {
    driver: AdminDriver;
    onBack: () => void;
}

export const DriverDetails: React.FC<DriverDetailsProps> = ({ driver, onBack }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleApprove = async () => {
        setIsUpdating(true);
        try {
            const userRef = doc(db, 'users', driver.id);
            await setDoc(userRef, {
                verificationStatus: 'VERIFIED',
                status: 'Active',
                role: 'DRIVER'
            }, { merge: true });
            alert('Driver Approved Successfully');
            onBack();
        } catch (error) {
            console.error("Error approving driver:", error);
            alert("Failed to approve driver. See console for details.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSuspend = async () => {
        if (!confirm('Are you sure you want to REJECT/SUSPEND this driver?')) return;
        setIsUpdating(true);
        try {
            const userRef = doc(db, 'users', driver.id);
            await setDoc(userRef, {
                verificationStatus: 'REJECTED',
                status: 'Rejected'
            }, { merge: true });
            alert('Driver Rejected/Suspended');
            onBack();
        } catch (error) {
            console.error("Error suspending driver:", error);
            alert("Failed to suspend driver.");
        } finally {
            setIsUpdating(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'trips', label: 'Trips', icon: Calendar },
        { id: 'financials', label: 'Financials', icon: DollarSign },
        { id: 'performance', label: 'Performance', icon: Star },
    ];

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-gray-500" />
                    </button>
                    <img src={driver.avatarUrl} alt="" className="h-20 w-20 rounded-full border-4 border-gray-50 shadow-sm" />
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{driver.name}</h1>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase 
                                ${driver.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    driver.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                {driver.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>ID: {driver.id}</span>
                            <span>•</span>
                            <span>{driver.city}</span>
                            <span>•</span>
                            <span>Joined {new Date(driver.joinDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" /> Message</Button>
                    <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={handleSuspend}
                        disabled={isUpdating}
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" /> {driver.verificationStatus === 'REJECTED' ? 'Rejected' : 'Reject/Suspend'}
                    </Button>
                    {driver.verificationStatus !== 'VERIFIED' && (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleApprove}
                            disabled={isUpdating}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" /> {driver.verificationStatus === 'PENDING' ? 'Approve Application' : 'Mark as Verified'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-xl">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-brand-purple text-brand-purple'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-b-xl shadow-sm border border-gray-100 min-h-[400px]">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-brand-purple" /> Personal Information
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Email</p>
                                        <p className="font-medium text-gray-800">{driver.email}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Phone</p>
                                        <p className="font-medium text-gray-800">{driver.phoneNumber}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Address</p>
                                        <p className="font-medium text-gray-800">{driver.address}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase">Membership</p>
                                        <p className="font-medium text-brand-purple">{driver.membershipType}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Car className="h-5 w-5 text-brand-purple" /> Vehicle Information
                            </h3>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">{driver.vehicle?.year} {driver.vehicle?.make} {driver.vehicle?.model}</h4>
                                        <p className="text-gray-500">{driver.vehicle?.color}</p>
                                    </div>
                                    <div className="bg-white px-3 py-1 rounded border border-gray-300 font-mono font-bold text-gray-800">
                                        {driver.vehicle?.plateNumber}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                        <span className="text-gray-500">Insurance Status</span>
                                        <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Valid</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                        <span className="text-gray-500">Inspection</span>
                                        <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Passed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Uploaded Documents</h3>
                            {driver.verificationStatus === 'Pending' && (
                                <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">Verification Pending</div>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { label: 'License', url: driver.documents?.licenseUrl },
                                { label: 'National ID', url: driver.documents?.nationalIdUrl },
                                { label: 'Insurance Policy', url: driver.documents?.insuranceUrl },
                                { label: 'Criminal Record', url: driver.documents?.criminalRecordUrl },
                                { label: 'Personal Photo', url: driver.documents?.personalPhotoUrl },
                            ].map((doc, i) => (
                                <div key={i} className={`border rounded-xl p-4 transition-all ${doc.url ? 'border-gray-200 hover:shadow-md' : 'border-red-100 bg-red-50/30 opacity-70'}`}>
                                    <div className="h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner group relative">
                                        {doc.url ? (
                                            <>
                                                <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => window.open(doc.url, '_blank')}
                                                        className="p-2 bg-white rounded-full text-brand-purple shadow-lg hover:bg-brand-purple hover:text-white transition-colors"
                                                        title="View Full Size"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Not Uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-sm text-gray-800">{doc.label}</span>
                                            {doc.url && (
                                                <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-0.5">
                                                    <CheckCircle size={10} /> RECIEVED
                                                </p>
                                            )}
                                        </div>
                                        {doc.url && (
                                            <div className="flex gap-2">
                                                <button className="text-brand-purple hover:bg-purple-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold uppercase">
                                                    Verify
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Performance Tab */}
                {activeTab === 'performance' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-purple-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-brand-purple">{driver.rating.toFixed(1)}</div>
                                <div className="text-sm text-gray-600">Average Rating</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-green-600">{Math.floor(driver.acceptanceRate)}%</div>
                                <div className="text-sm text-gray-600">Acceptance Rate</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-blue-600">{driver.totalTrips}</div>
                                <div className="text-sm text-gray-600">Total Trips</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-red-600">{driver.cancellationRate.toFixed(1)}%</div>
                                <div className="text-sm text-gray-600">Cancellation Rate</div>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-800 mb-4">Customer Feedback</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-xl">
                                    <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">Fatima K.</span>
                                            <div className="flex text-yellow-400"><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /></div>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">Excellent ride, very polite driver!</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trips Tab */}
                {activeTab === 'trips' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Trips</h3>
                        {/* Mock Trips List */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-brand-purple font-bold">
                                        T{i}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">Technopark to Morocco Mall</p>
                                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString()} • 4:30 PM</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">$18.50</p>
                                    <p className="text-xs text-gray-400">Completed</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Financials Tab */}
                {activeTab === 'financials' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Financial Summary</h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                <p className="text-sm text-green-600 uppercase font-bold mb-2">Total Earnings</p>
                                <p className="text-3xl font-bold text-green-700">${driver.totalEarnings.toLocaleString()}</p>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                                <p className="text-sm text-brand-purple uppercase font-bold mb-2">Pending Payout</p>
                                <p className="text-3xl font-bold text-brand-purple">$450.00</p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <p className="text-sm text-blue-600 uppercase font-bold mb-2">Last Payout</p>
                                <p className="text-lg font-bold text-blue-700">$1,200.00</p>
                                <p className="text-xs text-blue-500 mt-1">Processed on Dec 1st</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-800">Payout History</h4>
                                <Button variant="outline" size="sm">Download Report</Button>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="text-left text-gray-500 border-b border-gray-200">
                                    <tr>
                                        <th className="pb-2">Date</th>
                                        <th className="pb-2">Amount</th>
                                        <th className="pb-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="py-3">Dec 01, 2024</td>
                                        <td className="py-3 font-semibold">$1,200.00</td>
                                        <td className="py-3 text-green-600">Paid</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3">Nov 01, 2024</td>
                                        <td className="py-3 font-semibold">$980.00</td>
                                        <td className="py-3 text-green-600">Paid</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
