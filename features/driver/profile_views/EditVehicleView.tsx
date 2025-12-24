import React, { useState } from 'react';
import { ChevronLeft, Car, Save, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { User, VehicleInfo } from '../../../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

interface EditVehicleViewProps {
    user: User;
    onBack: () => void;
    onUpdate: (updatedUser: User) => void;
}

export const EditVehicleView: React.FC<EditVehicleViewProps> = ({ user, onBack, onUpdate }) => {
    const [vehicle, setVehicle] = useState<VehicleInfo>(user.vehicle || {
        make: '', model: '', year: '', color: '', plateNumber: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, { vehicle });
            onUpdate({ ...user, vehicle });
            onBack();
        } catch (error) {
            console.error("Error updating vehicle:", error);
            alert("Failed to save vehicle details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-[60] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        <ChevronLeft className="h-6 w-6" /> Back
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Edit Vehicle</h1>
                    <div className="w-12"></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div className="bg-brand-purple rounded-3xl p-8 text-white flex flex-col items-center shadow-xl">
                    <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Car className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Vehicle Specifications</h2>
                    <p className="text-purple-200 text-sm mt-1">Update your vehicle details below</p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Make</label>
                            <input
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                placeholder="e.g. Toyota"
                                value={vehicle.make}
                                onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Model</label>
                            <input
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                placeholder="e.g. Camry"
                                value={vehicle.model}
                                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Year</label>
                            <input
                                type="number"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                placeholder="2022"
                                value={vehicle.year}
                                onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Color</label>
                            <input
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                placeholder="e.g. Pearl White"
                                value={vehicle.color}
                                onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">License Plate</label>
                        <input
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all uppercase"
                            placeholder="e.g. 1234-ABC"
                            value={vehicle.plateNumber}
                            onChange={(e) => setVehicle({ ...vehicle, plateNumber: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" fullWidth onClick={onBack}>Cancel</Button>
                    <Button
                        fullWidth
                        onClick={handleSave}
                        disabled={loading || !vehicle.make || !vehicle.model || !vehicle.year || !vehicle.plateNumber}
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" /> Save Changes</>}
                    </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 text-blue-800 text-sm border border-blue-100">
                    <Loader2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p>Changing your vehicle might require re-verification by our administrative team for safety compliance.</p>
                </div>
            </div>
        </div>
    );
};
