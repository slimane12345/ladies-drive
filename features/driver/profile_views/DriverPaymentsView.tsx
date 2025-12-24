import React, { useState } from 'react';
import { ChevronLeft, CreditCard, Plus, ArrowUpRight, DollarSign, Wallet, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface DriverPaymentsViewProps {
    onBack: () => void;
}

const TRANSACTIONS = [
    { id: 1, date: 'May 12, 2024', amount: 450.00, status: 'COMPLETED', method: '•••• 4242' },
    { id: 2, date: 'May 05, 2024', amount: 385.20, status: 'COMPLETED', method: '•••• 4242' },
    { id: 3, date: 'Apr 28, 2024', amount: 512.45, status: 'COMPLETED', method: '•••• 4242' }
];

export const DriverPaymentsView: React.FC<DriverPaymentsViewProps> = ({ onBack }) => {
    return (
        <div className="fixed inset-0 bg-gray-50 z-[60] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        <ChevronLeft className="h-6 w-6" /> Back
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Payments</h1>
                    <div className="w-12"></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-8">
                {/* Balance Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4 border border-green-100">
                        <Wallet className="h-10 w-10" />
                    </div>
                    <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Available Balance</span>
                    <h2 className="text-4xl font-extrabold text-gray-900 mt-2">$245.80</h2>
                    <Button className="mt-6 w-full max-w-xs shadow-xl shadow-green-100" size="lg">Cash Out Now</Button>
                    <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                        Automatic payouts occur every Monday at 08:00 AM.
                    </p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center ml-2">
                        <h3 className="text-xl font-bold text-gray-900">Payment Methods</h3>
                        <button className="text-brand-purple text-sm font-bold flex items-center gap-1 hover:bg-purple-50 px-3 py-1.5 rounded-xl transition-colors">
                            <Plus size={16} /> Add New
                        </button>
                    </div>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
                                    <span className="text-blue-600 font-bold italic text-lg tracking-tighter">VISA</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Chase Bank Debit</p>
                                    <p className="text-xs text-gray-400 font-medium">•••• •••• •••• 4242</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-brand-purple bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">Primary</span>
                        </div>
                    </div>
                </div>

                {/* Payout History */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 ml-2">Recent Payouts</h3>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        {TRANSACTIONS.map((tx) => (
                            <div key={tx.id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-brand-purple/10 group-hover:text-brand-purple transition-colors">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{tx.date}</p>
                                        <p className="text-xs text-gray-400 font-medium">{tx.method}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">${tx.amount.toFixed(2)}</p>
                                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">{tx.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full text-center text-sm font-bold text-brand-purple py-2 hover:underline">View All History</button>
                </div>

                {/* Security Badge */}
                <div className="bg-gray-200/50 rounded-3xl p-6 flex flex-col items-center text-center border-2 border-white">
                    <ShieldCheck className="h-10 w-10 text-brand-purple mb-2" />
                    <p className="text-xs text-gray-500 font-medium">
                        Your banking information is encrypted and securely processed. We do not store full card numbers on our servers.
                    </p>
                </div>
            </div>
            <div className="h-12"></div>
        </div>
    );
};
