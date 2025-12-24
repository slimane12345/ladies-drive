import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '../ui/Button';
import { Phone, User as UserIcon, Loader2, Navigation, MapPin } from 'lucide-react';
import { MOROCCAN_CITIES } from '../../constants';

interface PassengerLoginProps {
    onLogin: (user: User) => void;
}

export const PassengerLogin: React.FC<PassengerLoginProps> = ({ onLogin }) => {
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
            const q = query(usersRef, where('phoneNumber', '==', phone), where('role', '==', UserRole.PASSENGER));
            const querySnapshot = await getDocs(q);

            let user: User;

            if (!querySnapshot.empty) {
                // User exists, login
                const userDoc = querySnapshot.docs[0];
                user = { id: userDoc.id, ...userDoc.data() } as User;

                // Update name or city if changed
                if (user.name !== name || user.city !== city) {
                    await setDoc(doc(db, 'users', user.id), { name, city }, { merge: true });
                    user.name = name;
                    user.city = city;
                }
            } else {
                // Register new user
                const newUserCtx = {
                    name,
                    phoneNumber: phone,
                    city,
                    role: UserRole.PASSENGER,
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                    verificationStatus: 'UNVERIFIED',
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-brand-purple p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10">
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rotate-12" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Navigation className="text-white h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Start Your Journey</h2>
                        <p className="text-purple-100 text-sm">Safe, comfortable rides for women</p>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3.5 text-gray-400">
                                    <UserIcon size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all"
                                    placeholder="e.g. Sarah Ahmed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3.5 text-gray-400">
                                    <Phone size={20} />
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all"
                                    placeholder="e.g. 0612345678"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3.5 text-gray-400">
                                    <MapPin size={20} />
                                </div>
                                <select
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all appearance-none"
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
                            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <Button fullWidth size="lg" disabled={loading} className="mt-4 rounded-xl shadow-lg shadow-purple-200">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4" /> Logging in...
                                </span>
                            ) : (
                                "Continue"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
