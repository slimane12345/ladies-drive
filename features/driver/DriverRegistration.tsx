import React, { useState } from 'react';
import { User, VehicleInfo, DriverDocuments } from '../../types';
import { Button } from '../../components/ui/Button';
import { Camera, FileText, CheckCircle, Car, Upload, ChevronRight, ChevronLeft, AlertCircle, Shield, MapPin, Loader2, Navigation } from 'lucide-react';
import { MOROCCAN_CITIES } from '../../constants';
import { reverseGeocodeCity } from '../../services/geocoding';

interface DriverRegistrationProps {
    user: User;
    onSubmit: (updatedUser: Partial<User>) => void;
}

export const DriverRegistration: React.FC<DriverRegistrationProps> = ({ user, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [documents, setDocuments] = useState<DriverDocuments>({});
    const [city, setCity] = useState(user.city || MOROCCAN_CITIES[0]);
    const [vehicle, setVehicle] = useState<VehicleInfo>({
        make: '', model: '', year: '', color: '', plateNumber: ''
    });
    const [isDetecting, setIsDetecting] = useState(false);

    const handleDetectCity = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const detectedCity = await reverseGeocodeCity(position.coords.latitude, position.coords.longitude);
                if (detectedCity) {
                    // Try to find exact match in our list
                    const match = MOROCCAN_CITIES.find(c =>
                        detectedCity.toLowerCase().includes(c.toLowerCase()) ||
                        c.toLowerCase().includes(detectedCity.toLowerCase())
                    );
                    if (match) {
                        setCity(match);
                    } else {
                        alert(`Detected city: ${detectedCity}, but it's not in our primary list. Please select manually.`);
                    }
                }
            } catch (error) {
                console.error("Error detecting city:", error);
            } finally {
                setIsDetecting(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            setIsDetecting(false);
            alert("Failed to get location. Please select your city manually.");
        });
    };

    const handleFileChange = (field: keyof DriverDocuments) => {
        // Simulate upload
        setDocuments(prev => ({
            ...prev,
            [field]: 'https://via.placeholder.com/300x200?text=Uploaded+Document'
        }));
    };

    const isStep1Valid = true; // Welcome step
    const isStep2Valid = documents.licenseUrl && documents.nationalIdUrl && documents.personalPhotoUrl && documents.criminalRecordUrl && documents.insuranceUrl;
    const isStep3Valid = vehicle.make && vehicle.model && vehicle.year && vehicle.plateNumber && city;

    const handleSubmit = () => {
        onSubmit({
            verificationStatus: 'PENDING',
            documents,
            vehicle,
            city
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-brand-purple p-6 text-white text-center">
                    <h1 className="text-2xl font-bold">Partner Registration</h1>
                    <p className="opacity-80 text-sm mt-1">Join the Ladies Drive fleet</p>

                    {/* Progress Steps */}
                    <div className="flex justify-center items-center gap-2 mt-6">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-2 rounded-full transition-all ${s <= step ? 'w-8 bg-brand-pink' : 'w-2 bg-purple-400'}`} />
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    {/* Step 1: Intro */}
                    {step === 1 && (
                        <div className="text-center space-y-6">
                            <div className="bg-purple-50 p-4 rounded-2xl inline-block mb-2">
                                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto text-brand-purple shadow-sm border border-purple-100">
                                    <Shield className="h-10 w-10" />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">Required Documents</h2>
                                <p className="text-gray-500 mt-2 text-base leading-relaxed max-w-xs mx-auto">
                                    To ensure safety, we need to verify your identity and vehicle.
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-1 border border-gray-100">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
                                    {[
                                        'Valid Driver\'s License',
                                        'National ID Card',
                                        'Criminal Record Certificate',
                                        'Vehicle Insurance Policy',
                                        'Recent Personal Photo'
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-default">
                                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                            <span className="text-gray-700 font-medium text-left">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button fullWidth size="lg" onClick={() => setStep(2)} className="h-14 text-lg shadow-xl shadow-purple-200">
                                Start Application
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Documents */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Documents</h2>

                            {[
                                { label: 'Driver\'s License', field: 'licenseUrl' },
                                { label: 'National ID', field: 'nationalIdUrl' },
                                { label: 'Criminal Record', field: 'criminalRecordUrl' },
                                { label: 'Vehicle Insurance', field: 'insuranceUrl' },
                                { label: 'Personal Photo', field: 'personalPhotoUrl' },
                            ].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-brand-purple/30 transition-colors bg-white shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${documents[doc.field as keyof DriverDocuments] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {documents[doc.field as keyof DriverDocuments] ? <CheckCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                        </div>
                                        <span className="font-medium text-gray-700">{doc.label}</span>
                                    </div>
                                    <button
                                        className="text-brand-purple text-sm font-semibold hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                                        onClick={() => handleFileChange(doc.field as keyof DriverDocuments)}
                                    >
                                        {documents[doc.field as keyof DriverDocuments] ? 'Change' : 'Upload'}
                                    </button>
                                </div>
                            ))}

                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                <Button className="flex-1" disabled={!isStep2Valid} onClick={() => setStep(3)}>Next Step</Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Vehicle */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Car className="h-6 w-6 text-brand-purple" /> Vehicle & City Info
                            </h2>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <MapPin size={14} /> Operation City
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple appearance-none"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    >
                                        {MOROCCAN_CITIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleDetectCity}
                                        disabled={isDetecting}
                                        className="bg-brand-purple/10 text-brand-purple p-3 rounded-lg hover:bg-brand-purple hover:text-white transition-all disabled:opacity-50"
                                        title="Detect City"
                                    >
                                        {isDetecting ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Make</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                        placeholder="e.g. Toyota"
                                        value={vehicle.make}
                                        onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Model</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                        placeholder="e.g. Camry"
                                        value={vehicle.model}
                                        onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Year</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                        placeholder="2020"
                                        value={vehicle.year}
                                        onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                        placeholder="e.g. White"
                                        value={vehicle.color}
                                        onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">License Plate</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                                    placeholder="e.g. 1234 ABC"
                                    value={vehicle.plateNumber}
                                    onChange={(e) => setVehicle({ ...vehicle, plateNumber: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                                <Button className="flex-1" disabled={!isStep3Valid} onClick={() => setStep(4)}>Review</Button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="text-center space-y-6">
                            <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
                                <CheckCircle className="h-12 w-12" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Ready to Submit?</h2>
                                <p className="text-gray-500 mt-2">Your application will be sent to our team for verification. This usually takes 24-48 hours.</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl text-left text-sm space-y-2">
                                <p><span className="font-bold">Name:</span> {user.name}</p>
                                <p><span className="font-bold">Vehicle:</span> {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.color})</p>
                                <p><span className="font-bold">Documents:</span> 5 files attached</p>
                            </div>

                            <Button fullWidth size="lg" onClick={handleSubmit}>Submit Application</Button>
                            <button onClick={() => setStep(3)} className="text-gray-400 text-sm hover:text-gray-600">Back to Edit</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
