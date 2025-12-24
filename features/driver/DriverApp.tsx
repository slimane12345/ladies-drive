import React, { useState, useEffect } from 'react';
import { User, RideRequest, RideStatus, RideType } from '../../types';
import { Button } from '../../components/ui/Button';
import { MapPin, Navigation, Phone, Shield, Power, CheckCircle, Smartphone, User as UserIcon, Clock, Clock3, AlertTriangle, ChevronDown } from 'lucide-react';
import { DriverRegistration } from './DriverRegistration';
import { DriverProfile } from './DriverProfile';
import { DriverEarnings } from './DriverEarnings';
import { RatePassenger } from './RatePassenger';
import { doc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { subscribeToOpenRides, acceptRide, updateRideStatus, completeRide, rateUser, cancelRide, subscribeToDriverRides } from '../../services/rideService';

interface DriverAppProps {
    user: User;
    onLogout: () => void;
    onUpdateUser?: (user: User) => void;
}

export const DriverApp: React.FC<DriverAppProps> = ({ user, onLogout, onUpdateUser }) => {
    // State
    const [isOnline, setIsOnline] = useState(user.availabilityStatus === 'AVAILABLE');
    const [activeRequest, setActiveRequest] = useState<RideRequest | null>(null);
    const [incomingRequests, setIncomingRequests] = useState<RideRequest[]>([]);
    const [showProfile, setShowProfile] = useState(false);
    const [showEarnings, setShowEarnings] = useState(false);
    const [rideToRate, setRideToRate] = useState<RideRequest | null>(null);
    const [skippedRideIds, setSkippedRideIds] = useState<Set<string>>(new Set());

    // 1. Verification Flow
    if (!user.verificationStatus || user.verificationStatus === 'UNVERIFIED') {
        return (
            <DriverRegistration
                user={user}
                onSubmit={async (updates) => {
                    try {
                        if (!user.id) return;
                        // Persist to Firestore with merge to ensure creation
                        const userRef = doc(db, 'users', user.id);
                        const fullUpdates = {
                            ...updates,
                            role: 'DRIVER', // Ensure role is set for Admin query
                            name: user.name, // Ensure name is present
                            email: user.email || '',
                            phoneNumber: user.phoneNumber || '',
                            updatedAt: new Date().toISOString()
                        };
                        await setDoc(userRef, fullUpdates, { merge: true });

                        // Update local state
                        onUpdateUser?.({ ...user, ...fullUpdates });
                    } catch (error) {
                        console.error("Error submitting application:", error);
                        alert("Failed to submit application. Please try again.");
                    }
                }}
            />
        );
    }

    if (user.verificationStatus === 'PENDING') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Clock3 className="h-10 w-10 text-yellow-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Application Under Review</h1>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    Thanks for submitting your documents! Our team is currently reviewing your application.
                    You will be notified once your account is verified (usually within 24-48 hours).
                </p>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-sm mx-auto text-left mb-8">
                    <h3 className="font-bold text-gray-800 text-sm mb-2">Submitted Details</h3>
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>Name: {user.name}</p>
                        <p>Vehicle: {user.vehicle?.year} {user.vehicle?.make} {user.vehicle?.model}</p>
                        <p>Status: Pending Approval</p>
                    </div>
                </div>
                <Button variant="outline" onClick={onLogout}>Sign Out</Button>
            </div>
        );
    }

    if (user.verificationStatus === 'REJECTED') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Application Rejected</h1>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    Unfortunately, we could not approve your application at this time.
                    Please contact support for more information regarding your documents.
                </p>
                <Button variant="outline" onClick={onLogout}>Sign Out</Button>
            </div>
        );
    }

    // Overlays

    // Overlays are now handled inside the main return block for better stability

    // 2. Ride Subscriptions
    useEffect(() => {
        if (!isOnline || !user.id) {
            setIncomingRequests([]);
            setActiveRequest(null);
            return;
        }

        // A. Recovery of ALREADY ASSIGNED rides (for this driver)
        const unsubDriverRides = subscribeToDriverRides(user.id, (rides) => {
            if (rides.length > 0) {
                // If we have an active assigned ride, prioritize it
                setActiveRequest(rides[0]);
            }
        });

        // B. Listening for NEW requests in the city (Specifically for THIS driver)
        const unsubOpenRides = subscribeToOpenRides(user.city || 'Unknown', user.id || null, (rides) => {
            // Filter out searching rides that have already been skipped in this session
            const availableRides = rides.filter(r =>
                r.status === RideStatus.SEARCHING &&
                !skippedRideIds.has(r.id)
            );

            setIncomingRequests(availableRides);

            // If we're not currently in an assigned ride, show the first available SEARCHING request
            if (availableRides.length > 0 && (!activeRequest || activeRequest.status === RideStatus.SEARCHING)) {
                // If the specific request being shown is no longer in the list (taken by others), update it
                if (!activeRequest || !availableRides.find(r => r.id === activeRequest.id)) {
                    setActiveRequest(availableRides[0]);
                }
            } else if (availableRides.length === 0 && activeRequest?.status === RideStatus.SEARCHING) {
                setActiveRequest(null);
            }
        });

        // C. Specific listener for the ACTIVE ride to catch status changes (Cancelled/Completed)
        let activeUnsubscribe: () => void = () => { };
        if (activeRequest?.id) {
            activeUnsubscribe = onSnapshot(doc(db, 'rides', activeRequest.id), (snap) => {
                if (snap.exists()) {
                    const data = { id: snap.id, ...snap.data() } as RideRequest;
                    if (data.status === RideStatus.CANCELLED || data.status === RideStatus.COMPLETED) {
                        // If it was the active assigned ride, clear it
                        if (data.status === RideStatus.COMPLETED) {
                            setRideToRate(data);
                        }
                        setActiveRequest(null);
                    } else {
                        setActiveRequest(data);
                    }
                } else {
                    setActiveRequest(null);
                }
            });
        }

        return () => {
            unsubDriverRides();
            unsubOpenRides();
            activeUnsubscribe();
        };
    }, [isOnline, user.id, user.city, activeRequest?.id, skippedRideIds]);

    // 3. Location Tracking
    useEffect(() => {
        if (!isOnline || !user.id) return;

        console.log("Starting location tracking for driver:", user.id);

        const updateLocation = (pos: GeolocationPosition) => {
            const { latitude, longitude } = pos.coords;
            const userRef = doc(db, 'users', user.id);
            updateDoc(userRef, {
                currentLocation: { lat: latitude, lng: longitude },
                lastLocationUpdate: new Date().toISOString()
            }).catch(err => console.error("Error updating location:", err));
        };

        const watchId = navigator.geolocation.watchPosition(
            updateLocation,
            (err) => console.error("Geolocation watch error:", err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Fallback: also update once immediately
        navigator.geolocation.getCurrentPosition(updateLocation);

        return () => {
            console.log("Stopping location tracking");
            navigator.geolocation.clearWatch(watchId);
        };
    }, [isOnline, user.id]);

    const handleAcceptRide = async () => {
        if (!activeRequest) return;
        try {
            await acceptRide(activeRequest.id, user);
            // State update will happen via snapshot, but we can optimistically set it to hide the "New Request" modal
            setActiveRequest(prev => prev ? { ...prev, status: RideStatus.ACCEPTED } : null);
        } catch (error) {
            console.error("Error accepting ride:", error);
            alert("Failed to accept ride. It might have been taken.");
            setActiveRequest(null);
        }
    };

    const handleStatusUpdate = async (status: RideStatus) => {
        if (!activeRequest) return;
        try {
            if (status === RideStatus.COMPLETED) {
                if (!activeRequest.driver?.id) throw "Driver ID missing";
                if (!activeRequest.passenger?.id) throw "Passenger ID missing";

                await completeRide(activeRequest.id, activeRequest.passenger.id, activeRequest.driver.id);
                // We don't call setRideToRate(activeRequest) here because the snapshot listener will handle the transition
                // to stay in sync with the actual DB state.
                setActiveRequest(null);
            } else {
                await updateRideStatus(activeRequest.id, status);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status.");
        }
    };

    const handleCancelRide = async () => {
        if (!activeRequest) return;
        if (!window.confirm("Are you sure you want to cancel this ride?")) return;

        try {
            await cancelRide(activeRequest.id);
            setActiveRequest(null);
        } catch (error) {
            console.error("Error cancelling ride:", error);
            alert("Failed to cancel ride.");
        }
    };

    const openNavigation = () => {
        if (!activeRequest) return;
        const target = activeRequest.status === RideStatus.ACCEPTED ? activeRequest.pickup : activeRequest.destination;
        const encodedTarget = encodeURIComponent(target);
        // Using Google Maps Universal Link
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedTarget}`, '_blank');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 relative">
            {/* Overlays */}
            {rideToRate && (
                <RatePassenger
                    passenger={rideToRate.passenger}
                    ridePrice={rideToRate.price}
                    onSubmit={async (rating) => {
                        try {
                            if (rideToRate.passenger.id) {
                                await rateUser(rideToRate.passenger.id, rating);
                            }
                            setRideToRate(null);
                        } catch (error) {
                            console.error("Error rating passenger:", error);
                            alert("Failed to save rating.");
                        }
                    }}
                    onSkip={() => setRideToRate(null)}
                />
            )}
            {showEarnings && (
                <DriverEarnings
                    user={user}
                    onClose={() => setShowEarnings(false)}
                    onUpdateUser={onUpdateUser}
                />
            )}
            {showProfile && (
                <DriverProfile
                    user={user}
                    onClose={() => setShowProfile(false)}
                    onLogout={onLogout}
                    onUpdateUser={onUpdateUser}
                />
            )}
            {/* Header */}
            <header className="bg-white px-6 py-4 shadow-sm flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowProfile(true)}
                        className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors overflow-hidden"
                    >
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <UserIcon className="h-6 w-6 text-gray-600" />
                        )}
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-gray-800">{user.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            {/* Status Switch */}
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${isOnline ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                <select
                                    value={isOnline ? 'AVAILABLE' : 'OFFLINE'}
                                    onChange={async (e) => {
                                        const online = e.target.value === 'AVAILABLE';
                                        setIsOnline(online);
                                        if (user.id) {
                                            const userRef = doc(db, 'users', user.id);
                                            await updateDoc(userRef, {
                                                availabilityStatus: online ? 'AVAILABLE' : 'OFFLINE'
                                            });
                                        }
                                    }}
                                    className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 cursor-pointer appearance-none"
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="OFFLINE">Unavailable</option>
                                </select>
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Vehicle Badge */}
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-xs font-bold text-gray-800">{user.vehicle?.color} {user.vehicle?.model}</span>
                        <span className="text-xs bg-gray-100 px-1.5 rounded text-gray-500 border border-gray-200">{user.vehicle?.plateNumber}</span>
                    </div>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-1 px-4 py-4 cursor-pointer" onClick={() => setShowEarnings(true)}>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:bg-gray-50 transition-colors">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Today</span>
                    <span className="text-lg font-bold text-brand-purple">${(user.completedTrips || 0) * 15}</span>
                    {/* Tiny Target Progress */}
                    <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div
                            className="h-full bg-brand-pink"
                            style={{ width: `${Math.min(((user.completedTrips || 0) * 15 / (user.dailyTarget || 200)) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:bg-gray-50 transition-colors">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Trips</span>
                    <span className="text-lg font-bold text-brand-pink">{user.completedTrips || 0}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:bg-gray-50 transition-colors">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Hours</span>
                    <span className="text-lg font-bold text-brand-blue">{((user.completedTrips || 0) * 0.5).toFixed(1)}</span>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-gray-200 m-4 rounded-3xl overflow-hidden shadow-inner border-4 border-white flex flex-col">
                <div className="absolute inset-0 bg-blue-50 opacity-60" style={{ backgroundImage: 'radial-gradient(#CBD5E0 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>

                {/* Status Message when Idle */}
                {!activeRequest && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-sm text-gray-600 text-sm font-medium border border-gray-200 flex items-center gap-2">
                            {isOnline ? (
                                <>
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    Searching for passengers...
                                </>
                            ) : (
                                <>
                                    <Power className="h-4 w-4 text-gray-400" />
                                    Go Online to start earning
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ACTIVE RIDE INTERFACE (Post-Acceptance) */}
                {activeRequest && activeRequest.status !== RideStatus.SEARCHING && (
                    <div className="absolute inset-0 z-40 bg-white/95 flex flex-col">
                        <div className="bg-brand-purple text-white p-6 rounded-b-3xl shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-purple-200 text-xs uppercase font-bold tracking-wider">Current Ride</span>
                                    <h2 className="text-2xl font-bold">{activeRequest.status === RideStatus.ACCEPTED ? 'Picking up' : 'Heading to Destination'}</h2>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">${activeRequest.price}</div>
                                    <div className="text-xs text-purple-200 uppercase">{activeRequest.type}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                <div className="h-12 w-12 rounded-full bg-white text-brand-purple flex items-center justify-center font-bold text-xl">
                                    {activeRequest.passenger.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{activeRequest.passenger.name}</h3>
                                    <div className="flex items-center text-yellow-300 text-sm">
                                        ★★★★★ 5.0
                                    </div>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    <button
                                        onClick={openNavigation}
                                        className="h-10 w-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg text-white transition-colors"
                                        title="Navigate"
                                    >
                                        <Navigation className="h-5 w-5" />
                                    </button>
                                    <a href={`tel:${activeRequest.passenger.phoneNumber}`} className="h-10 w-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg text-white transition-colors">
                                        <Phone className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="space-y-6 relative">
                                <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-gray-100"></div>

                                <div className={`relative pl-10 transition-opacity ${activeRequest.status !== RideStatus.ACCEPTED ? 'opacity-50' : 'opacity-100'}`}>
                                    <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${activeRequest.status === RideStatus.ACCEPTED ? 'bg-brand-purple z-10 scale-110' : 'bg-gray-300'}`}>
                                        <div className="h-2 w-2 bg-white rounded-full"></div>
                                    </div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Pickup</p>
                                    <p className="text-lg font-semibold text-gray-800 leading-tight">{activeRequest.pickup}</p>
                                </div>

                                <div className={`relative pl-10 transition-opacity ${activeRequest.status === RideStatus.IN_PROGRESS ? 'opacity-100' : 'opacity-50'}`}>
                                    <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${activeRequest.status === RideStatus.IN_PROGRESS ? 'bg-brand-pink z-10 scale-110' : 'bg-gray-300'}`}>
                                        <div className="h-2 w-2 bg-white rounded-full"></div>
                                    </div>
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Dropoff</p>
                                    <p className="text-lg font-semibold text-gray-800 leading-tight">{activeRequest.destination}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t bg-white">
                            {activeRequest.status === RideStatus.ACCEPTED && (
                                <div className="space-y-3">
                                    <Button fullWidth size="lg" className="bg-brand-purple py-4 text-lg shadow-lg shadow-purple-200" onClick={() => handleStatusUpdate(RideStatus.ARRIVED)}>
                                        I've Arrived at Pickup
                                    </Button>
                                    <Button fullWidth variant="ghost" className="text-red-500" onClick={handleCancelRide}>Cancel Ride</Button>
                                </div>
                            )}

                            {activeRequest.status === RideStatus.ARRIVED && (
                                <Button fullWidth size="lg" className="bg-green-600 hover:bg-green-700 py-4 text-lg shadow-lg shadow-green-200" onClick={() => handleStatusUpdate(RideStatus.IN_PROGRESS)}>
                                    Start Trip →
                                </Button>
                            )}

                            {activeRequest.status === RideStatus.IN_PROGRESS && (
                                <Button fullWidth size="lg" className="bg-brand-pink hover:bg-pink-600 py-4 text-lg shadow-lg shadow-pink-200" onClick={() => handleStatusUpdate(RideStatus.COMPLETED)}>
                                    Complete Trip ($ {activeRequest.price})
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* INCOMING REQUEST MODAL (SEARCHING ONLY) */}
                {activeRequest && activeRequest.status === RideStatus.SEARCHING && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
                        <div className="bg-white w-full rounded-t-3xl p-6 pb-8 animate-slide-up shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-brand-purple">
                                        <Clock className="h-5 w-5 animate-spin" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl">New Request!</h3>
                                        <p className="text-gray-500 text-sm">3 min away</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-bold text-brand-purple">${activeRequest.price}</h2>
                                    <span className="bg-purple-100 text-brand-purple px-2 py-0.5 rounded text-xs font-bold uppercase">{activeRequest.type}</span>
                                </div>
                            </div>

                            <div className="relative pl-6 space-y-6 mb-8">
                                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                                <div className="relative">
                                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-brand-purple ring-4 ring-white"></div>
                                    <p className="text-xs text-gray-400 uppercase">Pickup</p>
                                    <p className="font-semibold text-gray-800">{activeRequest.pickup}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-brand-pink ring-4 ring-white"></div>
                                    <p className="text-xs text-gray-400 uppercase">Dropoff</p>
                                    <p className="font-semibold text-gray-800">{activeRequest.destination}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-6">
                                {activeRequest.options.quiet && <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Quiet Ride</span>}
                                <span className="px-3 py-1 bg-pink-100 text-brand-pink rounded-full text-xs flex items-center gap-1">
                                    <UserIcon size={12} /> {activeRequest.passenger.name} (4.8★)
                                </span>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="ghost" className="flex-1 bg-gray-100" onClick={() => {
                                    // Add to skipped list so and find next
                                    setSkippedRideIds(prev => new Set(prev).add(activeRequest.id));
                                    const next = incomingRequests.find(r => r.id !== activeRequest.id && !skippedRideIds.has(r.id));
                                    setActiveRequest(next || null);
                                }}>Decline</Button>
                                <Button variant="primary" className="flex-[2] bg-brand-purple" onClick={handleAcceptRide}>Accept Ride</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};