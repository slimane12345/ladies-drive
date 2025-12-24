import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '../ui/Button';
import { Phone, User as UserIcon, Loader2, Key, MapPin } from 'lucide-react';
import { MOROCCAN_CITIES } from '../../constants';

interface DriverLoginProps {
    onLogin: (user: User) => void;
}

export const DriverLogin: React.FC<DriverLoginProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState(MOROCCAN_CITIES[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !city) {
            setError('Please enter all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const usersRef = collection(db, 'users');
            // Query for existing driver by phone
            const q = query(usersRef, where('phoneNumber', '==', phone), where('role', '==', UserRole.DRIVER));
            const querySnapshot = await getDocs(q);

            let user: User;

            if (!querySnapshot.empty) {
                // User exists, login
                const userDoc = querySnapshot.docs[0];
                user = { id: userDoc.id, ...userDoc.data() } as User;

                // Update name or city if changed to keep it fresh
                if (user.name !== name || user.city !== city) {
                    await setDoc(doc(db, 'users', user.id), { name, city }, { merge: true });
                    user.name = name;
                    user.city = city;
                }
            } else {
                // Register new driver
                const newUserCtx = {
                    name,
                    phoneNumber: phone,
                    city,
                    role: UserRole.DRIVER,
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                    verificationStatus: 'UNVERIFIED',
                    availabilityStatus: 'OFFLINE',
                    createdAt: new Date().toISOString()
                };
                const docRef = await addDoc(usersRef, newUserCtx);
                user = { id: docRef.id, ...newUserCtx } as User;
            }

            onLogin(user);
        } catch (err: any) {
            console.error("Login error:", err);
            setError('Failed to login. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gray-800 p-8 text-center relative overflow-hidden">
                    {/* Decorative Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5">
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
                    </div>

                    <div className="relative z-10">
                        <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/10">
                            <Key className="text-brand-pink h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Driver Portal</h2>
                        <p className="text-gray-400 text-sm">Join the elite fleet of Ladies Drive</p>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Driver Name</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-brand-pink transition-colors">
                                    <UserIcon size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all font-medium text-gray-800"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-brand-pink transition-colors">
                                    <Phone size={20} />
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all font-medium text-gray-800"
                                    placeholder="e.g. 0612345678"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Operation City</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-brand-pink transition-colors">
                                    <MapPin size={20} />
                                </div>
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all font-medium text-gray-800 appearance-none"
                                >
                                    {MOROCCAN_CITIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-600 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button fullWidth size="lg" disabled={loading} className="mt-6 rounded-xl bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200 transition-transform active:scale-[0.98]">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4" /> Verifying...
                                </span>
                            ) : (
                                "Continue to Dashboard"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
