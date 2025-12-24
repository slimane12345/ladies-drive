import React, { useState } from 'react';
import { User } from '../../types';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Camera, Shield, User as UserIcon, MapPin, Phone, Calendar, AlertTriangle, CheckCircle, Clock, Star } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface PassengerProfileProps {
    user: User;
    onBack: () => void;
    onUpdateUser: (updatedUser: User) => void;
}

export const PassengerProfile: React.FC<PassengerProfileProps> = ({ user, onBack, onUpdateUser }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        birthDate: user.birthDate || '',
        emergencyContact: user.emergencyContact || '',
    });
    const [idCardImage, setIdCardImage] = useState<string | null>(user.idCardUrl || null);

    const handleSave = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.id);
            const updates = {
                ...formData,
                idCardUrl: idCardImage
            };
            await updateDoc(userRef, updates);
            onUpdateUser({ ...user, ...updates });
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationRequest = async () => {
        if (!idCardImage) return;
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, { verificationStatus: 'PENDING' });
            onUpdateUser({ ...user, verificationStatus: 'PENDING' });
        } catch (error) {
            console.error("Error requesting verification:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdCardImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative z-50 overflow-y-auto pb-20">
            {/* Header */}
            <div className="bg-brand-purple p-6 pb-12 text-white relative">
                <button onClick={onBack} className="absolute top-6 left-4 p-2 hover:bg-white/10 rounded-full">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="text-center mt-4">
                    <div className="relative inline-block">
                        <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="h-24 w-24 rounded-full border-4 border-white/20 object-cover"
                        />
                        <button className="absolute bottom-0 right-0 bg-brand-pink p-2 rounded-full border-2 border-white">
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold mt-2">{user.name}</h2>
                    <p className="text-purple-200 text-sm">{user.phoneNumber}</p>
                    <div className="flex items-center justify-center gap-4 mt-4 text-white">
                        <div className="text-center">
                            <div className="flex items-center gap-1 text-yellow-300 font-bold text-lg">
                                <Star className="h-5 w-5 fill-current" />
                                {typeof user.rating === 'number' ? user.rating.toFixed(1) : '5.0'}
                            </div>
                            <p className="text-[10px] uppercase text-purple-200 font-bold">Rating</p>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-lg font-bold">
                                {user.completedTrips || 0}
                            </div>
                            <p className="text-[10px] uppercase text-purple-200 font-bold">Trips</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 -mt-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">

                    {/* Verification Status */}
                    <div className="border border-purple-100 rounded-xl p-4 bg-purple-50">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-brand-purple" />
                                Review Status
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                ${user.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                    user.verificationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'}`}>
                                {user.verificationStatus || 'UNVERIFIED'}
                            </span>
                        </div>
                        {user.verificationStatus === 'VERIFIED' ? (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Identity verified via ID Card.
                            </p>
                        ) : user.verificationStatus === 'PENDING' ? (
                            <p className="text-xs text-yellow-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Verification is in progress.
                            </p>
                        ) : (
                            <div className="space-y-3 mt-3">
                                <p className="text-xs text-gray-500">
                                    To ensure safety for all women, please upload your National ID card for verification.
                                </p>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageUpload}
                                    />
                                    {idCardImage ? (
                                        <img src={idCardImage} alt="ID Preview" className="h-32 mx-auto object-contain" />
                                    ) : (
                                        <div className="text-gray-400 flex flex-col items-center">
                                            <Camera className="h-8 w-8 mb-2" />
                                            <span className="text-xs">Tap to upload ID Card</span>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    fullWidth
                                    size="sm"
                                    disabled={!idCardImage || loading}
                                    onClick={handleVerificationRequest}
                                >
                                    {loading ? 'Submitting...' : 'Submit for Verification'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Personal Info Form */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 border-b pb-2">Personal Information</h3>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-transparent focus-within:border-brand-purple">
                                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-transparent w-full text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
                            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-transparent focus-within:border-brand-purple">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                <input
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="bg-transparent w-full text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Home Address</label>
                            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-transparent focus-within:border-brand-purple">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Enter your address"
                                    className="bg-transparent w-full text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Birth Date</label>
                            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-transparent focus-within:border-brand-purple">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                <input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                    className="bg-transparent w-full text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Emergency Contact</label>
                            <div className="flex items-center bg-red-50 rounded-lg px-3 py-2 border border-transparent focus-within:border-red-300">
                                <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                                <input
                                    value={formData.emergencyContact}
                                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                    placeholder="Emergency phone number"
                                    className="bg-transparent w-full text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <Button
                            className="mt-4"
                            fullWidth
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};
