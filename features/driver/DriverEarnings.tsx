import React, { useState } from 'react';
import { X, ChevronRight, DollarSign, Calendar, TrendingUp, Target } from 'lucide-react';
import { Button } from '../../components/ui/Button';

import { User } from '../../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface DriverEarningsProps {
    user: User;
    onClose: () => void;
    onUpdateUser?: (user: User) => void;
}

export const DriverEarnings: React.FC<DriverEarningsProps> = ({ user, onClose, onUpdateUser }) => {
    if (!user) return null;
    const [view, setView] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [newTarget, setNewTarget] = useState(user.dailyTarget?.toString() || '200');
    const [loading, setLoading] = useState(false);

    const currentEarnings = view === 'DAILY' ? 124.50 : view === 'WEEKLY' ? 845.20 : 3240.00;
    const dailyTarget = user.dailyTarget || 200;
    const progressPercent = Math.min((currentEarnings / dailyTarget) * 100, 100);

    const handleSaveTarget = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.id);
            const targetValue = parseFloat(newTarget);
            await updateDoc(userRef, { dailyTarget: targetValue });
            onUpdateUser?.({ ...user, dailyTarget: targetValue });
            setIsEditingTarget(false);
        } catch (error) {
            console.error("Error updating target:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        <X className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Earnings</h1>
                    <div className="w-6"></div> {/* Spacer */}
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-gray-100">
                    <button
                        onClick={() => setView('DAILY')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${view === 'DAILY' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-gray-500'}`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setView('WEEKLY')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${view === 'WEEKLY' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-gray-500'}`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setView('MONTHLY')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${view === 'MONTHLY' ? 'border-brand-purple text-brand-purple' : 'border-transparent text-gray-500'}`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {/* Main Stats */}
                <div className="bg-brand-purple rounded-3xl p-6 text-center text-white shadow-lg shadow-purple-200">
                    <p className="text-purple-100 text-sm font-medium mb-1">Total Earnings ({view.toLowerCase()})</p>
                    <h2 className="text-4xl font-bold mb-4">$ {view === 'DAILY' ? '124.50' : view === 'WEEKLY' ? '845.20' : '3,240.00'}</h2>

                    <div className="flex justify-center gap-8 border-t border-white/10 pt-4">
                        <div>
                            <p className="text-purple-200 text-xs uppercase font-bold">Trips</p>
                            <p className="text-xl font-bold">{view === 'DAILY' ? '8' : view === 'WEEKLY' ? '42' : '156'}</p>
                        </div>
                        <div>
                            <p className="text-purple-200 text-xs uppercase font-bold">Online</p>
                            <p className="text-xl font-bold">{view === 'DAILY' ? '4.5h' : view === 'WEEKLY' ? '28h' : '110h'}</p>
                        </div>
                    </div>
                </div>

                {/* Daily Target */}
                {view === 'DAILY' && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-brand-pink" />
                                <h3 className="font-bold text-gray-900">Daily Target</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-brand-purple">
                                    ${currentEarnings} / ${dailyTarget}
                                </span>
                                <button
                                    onClick={() => setIsEditingTarget(true)}
                                    className="text-xs text-gray-400 hover:text-brand-purple underline"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>

                        {isEditingTarget ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={newTarget}
                                    onChange={(e) => setNewTarget(e.target.value)}
                                    className="flex-1 bg-gray-50 rounded-lg px-3 py-1 text-sm border focus:ring-1 focus:ring-brand-purple outline-none"
                                    autoFocus
                                />
                                <Button size="sm" onClick={handleSaveTarget} disabled={loading}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditingTarget(false)}>Cancel</Button>
                            </div>
                        ) : (
                            <>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-pink rounded-full transition-all duration-1000"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    {progressPercent >= 100
                                        ? "Congratulations! You've reached your goal! 🎉"
                                        : `You're ${Math.round(progressPercent)}% of the way there! Keep going!`}
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* Recent Trips List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">Recent Activity</h3>

                    {/* Mock Items */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Trip #{4820 + i}</p>
                                    <p className="text-xs text-gray-500">Today, 2:30 PM</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">+$15.50</p>
                                <p className="text-xs text-gray-400">Cash</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
