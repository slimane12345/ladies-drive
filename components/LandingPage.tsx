import React from 'react';
import { Car, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
    onLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Left Side: Visual */}
                <div className="md:w-1/2 bg-brand-purple relative overflow-hidden p-10 flex flex-col justify-between text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <Car size={32} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Ladies Drive</h1>
                        </div>
                        <p className="text-purple-100 text-lg leading-relaxed">
                            Experience the safest, most comfortable transportation designed exclusively for women, by women.
                        </p>
                    </div>

                    <div className="relative z-10 grid gap-4 mt-8">
                        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <ShieldCheck className="text-brand-pink" />
                            <span className="font-medium">100% Verified Female Drivers</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <Car className="text-brand-blue" />
                            <span className="font-medium">Luxury & Family Vehicles</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Options */}
                <div className="md:w-1/2 p-10 flex flex-col justify-center items-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                    <p className="text-gray-400 mb-8 text-center">Select your portal to continue</p>

                    <div className="w-full max-w-sm space-y-4">
                        <button
                            onClick={() => onLogin(UserRole.PASSENGER)}
                            className="w-full group relative flex items-center p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-pink hover:shadow-lg transition-all"
                        >
                            <div className="h-12 w-12 bg-pink-50 text-brand-pink rounded-full flex items-center justify-center group-hover:bg-brand-pink group-hover:text-white transition-colors">
                                <Car size={24} />
                            </div>
                            <div className="ml-4 text-left">
                                <h3 className="font-bold text-gray-800">Passenger</h3>
                                <p className="text-xs text-gray-400">Book a ride instantly</p>
                            </div>
                        </button>

                        <button
                            onClick={() => onLogin(UserRole.DRIVER)}
                            className="w-full group relative flex items-center p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-purple hover:shadow-lg transition-all"
                        >
                            <div className="h-12 w-12 bg-purple-50 text-brand-purple rounded-full flex items-center justify-center group-hover:bg-brand-purple group-hover:text-white transition-colors">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="ml-4 text-left">
                                <h3 className="font-bold text-gray-800">Driver Partner</h3>
                                <p className="text-xs text-gray-400">Manage trips & earnings</p>
                            </div>
                        </button>

                        <div className="pt-4 border-t border-gray-100 mt-4">
                            <button
                                onClick={() => onLogin(UserRole.ADMIN)}
                                className="text-xs text-gray-400 hover:text-brand-purple font-medium"
                            >
                                Access Admin Panel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
