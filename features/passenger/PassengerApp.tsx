import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Shield, Heart, Menu, LogOut, Clock, Phone, AlertTriangle, Send, User as UserIcon, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reverseGeocode, searchAddress } from '../../services/geocoding';
import { createRideRequest, subscribeToRide, cancelRide } from '../../services/rideService';
import { RideRequest } from '../../types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Custom Icons
const pickupIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div class="relative">
             <div class="w-4 h-4 bg-brand-purple rounded-full border-2 border-white shadow-lg z-10 relative"></div>
             <div class="w-8 h-8 bg-brand-purple/30 rounded-full absolute -top-2 -left-2 animate-ping"></div>
           </div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const destIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div class="relative">
             <div class="w-6 h-6 text-brand-pink fill-current">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
             </div>
             <div class="w-2 h-2 bg-black/20 rounded-full blur-sm absolute bottom-0 left-2 translate-y-1"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24]
});

const driverIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div class="relative group">
             <div class="p-1 px-2 bg-white rounded-full shadow-lg border border-brand-purple flex items-center gap-1 scale-90 group-hover:scale-105 transition-transform">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse shrink-0"></div>
                <div class="text-[8px] font-bold text-brand-purple whitespace-nowrap">Sadiqa</div>
             </div>
             <div class="w-8 h-8 text-brand-purple mt-0.5 mx-auto">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
             </div>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});
import { Button } from '../../components/ui/Button';
import { SERVICE_TYPES } from '../../constants';
import { RideType, User, RideStatus } from '../../types';
import { getSafetyAdvice } from '../../services/geminiService';
import { PassengerLogin } from '../../components/auth/PassengerLogin';
import { PassengerProfile } from './PassengerProfile';
import { RateDriver } from './RateDriver';
import { rateUser } from '../../services/rideService';

interface PassengerAppProps {
    user: User;
    onLogout: () => void;
    onLogin: (user: User) => void;
}

interface GeocodingResult {
    display_name: string;
    lat: string;
    lon: string;
}

export const PassengerApp: React.FC<PassengerAppProps> = ({ user, onLogout, onLogin }) => {
    if (user.role !== 'PASSENGER' && user.role !== 'ADMIN') {
        return <PassengerLogin onLogin={onLogin} />;
    }

    const [view, setView] = useState<'home' | 'profile'>('home');
    const [step, setStep] = useState<'map' | 'select_driver' | 'confirm' | 'tracking'>('map');
    const [selectedService, setSelectedService] = useState<RideType>(RideType.REGULAR);

    // Address Texts
    const [pickup, setPickup] = useState("Locating...");
    const [destination, setDestination] = useState("");

    // Coordinate States
    const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null); // Actual GPS
    const [pickupLocation, setPickupLocation] = useState<[number, number] | null>(null); // Selected Pickup Coords
    const [destinationLocation, setDestinationLocation] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([33.5731, -7.5898]);

    // Ride State
    const [activeRideId, setActiveRideId] = useState<string | null>(null);
    const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
    const [rideToRate, setRideToRate] = useState<RideRequest | null>(null);
    const [nearbyDrivers, setNearbyDrivers] = useState<User[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [rideOptions, setRideOptions] = useState({
        quiet: false,
        luggage: false,
        assistance: false,
        wait: false
    });

    // Fetch nearby drivers in the same city
    useEffect(() => {
        console.log("Fetching nearby drivers for city:", user.city || 'Casablanca');
        const q = query(
            collection(db, 'users'),
            where('role', '==', 'DRIVER'),
            where('city', '==', user.city || 'Casablanca'),
            where('availabilityStatus', '==', 'AVAILABLE')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log(`Found ${snapshot.docs.length} drivers online in ${user.city || 'Casablanca'}`);
            const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setNearbyDrivers(drivers);
        }, (error) => {
            console.error("Error fetching nearby drivers:", error);
        });

        return () => unsubscribe();
    }, [user.city]);

    // Subscribe to active ride
    useEffect(() => {
        if (!activeRideId) return;

        const unsubscribe = subscribeToRide(activeRideId, (ride) => {
            setCurrentRide(ride);
            if (ride.status === 'COMPLETED') {
                setRideToRate(ride);
                setActiveRideId(null);
            }
        });

        return () => unsubscribe();
    }, [activeRideId]);

    const [showSafetyChat, setShowSafetyChat] = useState(false);
    const [safetyMessages, setSafetyMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([
        { sender: 'ai', text: 'Hi! I am your personal safety assistant. How can I help you feel more secure today?' }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Get Location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                const latLng: [number, number] = [latitude, longitude];

                setCurrentPosition(latLng);
                setPickupLocation(latLng); // Default pickup is current location
                setMapCenter(latLng);

                // Get human readable address
                const address = await reverseGeocode(latitude, longitude);
                setPickup(address);
            }, (err) => {
                console.error("Location access denied or error:", err);
                setPickup("Location access denied");
            });
        }
    }, []);

    // Suggestion logic
    const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);

    function MapClickHandler() {
        useMapEvents({
            click: async (e) => {
                const { lat, lng } = e.latlng;
                setDestinationLocation([lat, lng]);
                setDestination("Loading...");
                const address = await reverseGeocode(lat, lng);
                setDestination(address);
                setSuggestions([]); // Clear any suggestions if open
            },
        });
        return null;
    }

    function RecenterMap({ center }: { center: [number, number] }) {
        const map = useMap();
        useEffect(() => {
            map.setView(center);
        }, [center, map]);
        return null;
    }

    const handleDestinationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDestination(val);

        if (val.length > 2) {
            try {
                const results = await searchAddress(val);
                setSuggestions(results);
            } catch (err) {
                console.error("Search error", err);
            }
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (s: GeocodingResult) => {
        setDestination(s.display_name);
        if (s.lat && s.lon) {
            const lat = parseFloat(s.lat);
            const lng = parseFloat(s.lon);
            setDestinationLocation([lat, lng]);
            setMapCenter([lat, lng]); // Move map to destination
        }
        setSuggestions([]);
    };

    const handleSafetyChat = async () => {
        if (!chatInput.trim()) return;
        const msg = chatInput;
        setSafetyMessages(prev => [...prev, { sender: 'user', text: msg }]);
        setChatInput("");
        setIsTyping(true);

        const response = await getSafetyAdvice(msg);
        setIsTyping(false);
        setSafetyMessages(prev => [...prev, { sender: 'ai', text: response }]);
    };

    const handleBook = async () => {
        if (!pickupLocation || !destinationLocation) {
            alert("Please select pickup and destination");
            return;
        }

        try {
            const rideId = await createRideRequest(
                user,
                pickup,
                destination,
                pickupLocation,
                destinationLocation,
                18.50, // Mock price for now
                selectedService,
                rideOptions,
                selectedDriverId || undefined
            );
            console.log("Ride requested successfully:", rideId);
            setActiveRideId(rideId);
            setStep('tracking');
        } catch (error) {
            console.error(error);
            alert("Failed to request ride. Please try again.");
        }
    };

    const handleRateDriver = async (rating: number) => {
        if (!rideToRate?.driver?.id) return;
        try {
            await rateUser(rideToRate.driver.id, rating);
            setRideToRate(null);
            resetFlow();
        } catch (error) {
            console.error("Error rating driver:", error);
        }
    };

    const resetFlow = () => {
        setStep('map');
        setActiveRideId(null);
        setCurrentRide(null);
        setPickup('');
        setDestination('');
        setPickupLocation(null);
        setDestinationLocation(null);
    };

    if (view === 'profile') {
        return <PassengerProfile user={user} onBack={() => setView('home')} onUpdateUser={onLogin} />;
    }

    if (rideToRate && rideToRate.driver) {
        return (
            <RateDriver
                driver={rideToRate.driver}
                ridePrice={rideToRate.price}
                onSubmit={handleRateDriver}
                onSkip={() => {
                    setRideToRate(null);
                    resetFlow();
                }}
            />
        );
    }

    return (
        <div className="flex h-screen flex-col bg-gray-50 relative overflow-hidden">
            {/* Interactive Map */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={mapCenter}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    {/* Professional CartoDB Tiles */}
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    <RecenterMap center={mapCenter} />
                    <MapClickHandler />

                    {pickupLocation && (
                        <Marker position={pickupLocation} icon={pickupIcon}>
                            <Popup className="rounded-xl">Pickup: {pickup}</Popup>
                        </Marker>
                    )}

                    {/* Nearby Drivers */}
                    {nearbyDrivers.map(driver => (
                        <Marker
                            key={driver.id}
                            position={driver.currentLocation ? [driver.currentLocation.lat, driver.currentLocation.lng] : [
                                (pickupLocation?.[0] || mapCenter[0]) + (Math.random() - 0.5) * 0.015,
                                (pickupLocation?.[1] || mapCenter[1]) + (Math.random() - 0.5) * 0.015
                            ]}
                            icon={driverIcon}
                        >
                            <Popup className="rounded-xl">
                                <div className="p-2">
                                    <p className="font-bold text-brand-purple">{driver.name}</p>
                                    <p className="text-xs text-gray-500">{driver.vehicle?.model} • {driver.rating} ★</p>
                                    {!driver.currentLocation && <p className="text-[10px] text-red-400 mt-1 italic">Location simulated</p>}
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Route Line and Destination Marker */}
                    {pickupLocation && destinationLocation && (
                        <>
                            <Marker
                                position={destinationLocation}
                                icon={destIcon}
                            />
                            <Polyline
                                positions={[
                                    pickupLocation,
                                    destinationLocation
                                ]}
                                color="#8A4FFF"
                                weight={4}
                                opacity={0.8}
                                dashArray="10 10"
                            />
                        </>
                    )}
                </MapContainer>
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <button className="rounded-full p-2 hover:bg-gray-100">
                        <Menu className="h-6 w-6 text-gray-700" />
                    </button>
                    <h1 className="text-xl font-bold text-brand-purple">Ladies Drive</h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-pink-50 px-3 py-1 rounded-full">
                        <span className="font-semibold text-brand-pink text-sm">Wallet: $45.00</span>
                    </div>
                    <button onClick={() => setView('profile')}>
                        <img
                            src={user.avatarUrl}
                            alt="Profile"
                            className="h-9 w-9 rounded-full border-2 border-brand-pink object-cover"
                        />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex flex-col justify-end pb-6 px-4 pointer-events-none">

                {/* Safety Floating Button - No changes needed */}
                <div className="absolute top-4 right-4 pointer-events-auto flex flex-col gap-3">
                    <button
                        onClick={() => setShowSafetyChat(!showSafetyChat)}
                        className="h-12 w-12 bg-white rounded-full shadow-lg flex items-center justify-center text-brand-purple hover:bg-purple-50 transition-transform hover:scale-105"
                    >
                        <Shield className="h-6 w-6" />
                    </button>
                    <button className="h-14 w-14 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white animate-pulse hover:bg-red-600 border-4 border-red-200">
                        <span className="font-bold text-xs">SOS</span>
                    </button>
                </div>

                {/* Safety Chat Modal - No changes needed */}
                {showSafetyChat && (
                    <div className="pointer-events-auto absolute top-4 right-20 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden flex flex-col h-96">
                        <div className="bg-brand-purple p-3 flex justify-between items-center">
                            <span className="text-white font-medium flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Safety Assistant
                            </span>
                            <button onClick={() => setShowSafetyChat(false)} className="text-white/80 hover:text-white">x</button>
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3">
                            {safetyMessages.map((m, i) => (
                                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.sender === 'user' ? 'bg-brand-purple text-white rounded-tr-none' : 'bg-white text-gray-700 shadow-sm rounded-tl-none'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && <div className="text-xs text-gray-400 italic">Assistant is thinking...</div>}
                        </div>
                        <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                className="flex-1 bg-gray-50 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple"
                                placeholder="Ask for safety advice..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSafetyChat()}
                            />
                            <button onClick={handleSafetyChat} className="bg-brand-pink text-white p-2 rounded-full">
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Booking Card */}
                {step === 'map' && (
                    <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-auto">
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute left-4 top-3.5 z-10">
                                    <div className="h-2 w-2 rounded-full bg-brand-purple ring-4 ring-purple-100"></div>
                                </div>
                                <input
                                    type="text"
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-gray-800 font-medium focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-3.5 z-10">
                                    <div className="h-2 w-2 rounded-full bg-brand-pink ring-4 ring-pink-100"></div>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Where to?"
                                    value={destination}
                                    onChange={handleDestinationChange}
                                    className="w-full bg-gray-50 rounded-xl py-3 pl-10 pr-4 text-gray-800 font-medium focus:ring-2 focus:ring-brand-pink focus:outline-none"
                                />
                                {suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-b-xl mt-1 z-20 border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                                        {suggestions.map((s, idx) => (
                                            <button key={idx} onClick={() => selectSuggestion(s)} className="w-full text-left px-4 py-3 hover:bg-purple-50 text-sm text-gray-700 border-b border-gray-50 last:border-0 flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400 shrink-0" />
                                                <span className="truncate">{s.display_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Select Service</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {SERVICE_TYPES.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => setSelectedService(service.id)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${selectedService === service.id ? 'border-brand-purple bg-purple-50 text-brand-purple' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                                    >
                                        <div className={`mb-1 p-2 rounded-full ${selectedService === service.id ? 'bg-brand-purple text-white' : 'bg-gray-100'}`}>
                                            {/* Icon placeholder based on name logic or generic */}
                                            <div className="h-4 w-4 bg-current rounded-full opacity-50" />
                                        </div>
                                        <span className="text-[10px] font-bold text-center leading-tight">{service.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900">$18.50</span>
                                <span className="text-xs text-gray-400 line-through">$22.00</span>
                            </div>
                            <Button size="lg" className="rounded-2xl px-8" onClick={() => setStep('select_driver')}>
                                Select Ride
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'select_driver' && (
                    <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-auto animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Choose your Sadiqa</h2>
                            <span className="text-xs bg-purple-100 text-brand-purple px-2 py-1 rounded-full font-bold">{nearbyDrivers.length} Online</span>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {nearbyDrivers.length > 0 ? (
                                nearbyDrivers.map(driver => (
                                    <button
                                        key={driver.id}
                                        onClick={() => {
                                            setSelectedDriverId(driver.id);
                                            setStep('confirm');
                                        }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-brand-purple hover:bg-purple-50 transition-all text-left group"
                                    >
                                        <div className="relative">
                                            <img src={driver.avatarUrl || "https://picsum.photos/100/100"} alt={driver.name} className="h-14 w-14 rounded-full object-cover" />
                                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-800">{driver.name}</h3>
                                                <span className="text-xs font-bold text-brand-purple">3 min away</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center text-yellow-400 text-xs">
                                                    ★ <span className="text-gray-600 ml-1 font-medium">{driver.completedTrips || 12} trips</span>
                                                </div>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs text-gray-500">{driver.vehicle?.model} • {driver.vehicle?.color}</span>
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-gray-50 group-hover:bg-brand-purple group-hover:text-white flex items-center justify-center transition-colors">
                                            →
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <UserIcon className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No drivers available right now</p>
                                    <p className="text-xs text-gray-400 mt-1">Please try again in a few minutes</p>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setStep('map')} className="w-full text-center mt-6 text-gray-400 text-sm hover:text-gray-600 font-medium">Back to Map</button>
                    </div>
                )}

                {step === 'confirm' && (
                    <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg mx-auto animate-slide-up">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Ride Options</h2>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { id: 'quiet', label: 'Quiet Ride' },
                                { id: 'luggage', label: 'Extra Luggage' },
                                { id: 'assistance', label: 'Help with Bags' },
                                { id: 'wait', label: 'Wait for me' }
                            ].map(opt => (
                                <label key={opt.id} className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl cursor-pointer hover:bg-purple-50">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox text-brand-purple rounded h-4 w-4"
                                        checked={(rideOptions as any)[opt.id]}
                                        onChange={(e) => setRideOptions(prev => ({ ...prev, [opt.id]: e.target.checked }))}
                                    />
                                    <span className="text-sm text-gray-600">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        <Button fullWidth size="lg" onClick={handleBook}>Confirm Booking</Button>
                        <button onClick={() => setStep('map')} className="w-full text-center mt-3 text-gray-400 text-sm hover:text-gray-600">Cancel</button>
                    </div>
                )}

                {(step === 'tracking' || currentRide?.status === 'COMPLETED') && (
                    <div className="pointer-events-auto bg-white rounded-3xl shadow-2xl p-0 w-full max-w-lg mx-auto overflow-hidden">
                        {/* COMPLETED STATE */}
                        {currentRide?.status === 'COMPLETED' ? (
                            <div className="p-8 text-center bg-white">
                                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800 mb-2">Ride Completed!</h1>
                                <p className="text-gray-500 mb-8">You have arrived at your destination.</p>

                                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                                    <p className="text-sm text-gray-400 uppercase font-semibold mb-1">Total Fare</p>
                                    <p className="text-4xl font-bold text-brand-purple">${currentRide.price.toFixed(2)}</p>
                                </div>

                                <div className="space-y-3">
                                    <Button fullWidth size="lg" className="bg-brand-purple" onClick={() => {
                                        if (currentRide) {
                                            setRideToRate(currentRide);
                                            setCurrentRide(null);
                                        }
                                    }}>
                                        Finish & Rate Driver
                                    </Button>
                                    <Button variant="ghost" fullWidth onClick={() => alert("Report issue")}>Report Issue</Button>
                                </div>
                            </div>
                        ) : (
                            /* TRACKING STATE */
                            <>
                                <div className={`p-4 text-white transition-colors ${currentRide?.status === 'IN_PROGRESS' ? 'bg-brand-pink' : 'bg-brand-purple'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-white/80 text-xs uppercase font-semibold">Status</p>
                                            <h2 className="text-xl font-bold">
                                                {currentRide?.status === 'SEARCHING' ? 'Finding Driver...' :
                                                    currentRide?.status === 'ACCEPTED' ? 'Driver Arriving' :
                                                        currentRide?.status === 'ARRIVED' ? 'Driver Arrived!' :
                                                            currentRide?.status === 'IN_PROGRESS' ? 'On Trip' :
                                                                'Connecting...'}
                                            </h2>
                                        </div>
                                        {currentRide?.driver && (
                                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                                <p className="text-xs font-medium">{currentRide.driver.vehicle?.model}</p>
                                                <p className="text-lg font-bold tracking-widest">{currentRide.driver.vehicle?.plateNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    {(!currentRide || currentRide.status === 'SEARCHING') && (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <div className="relative">
                                                <div className="h-20 w-20 bg-purple-100 rounded-full animate-ping absolute"></div>
                                                <div className="h-20 w-20 bg-brand-purple rounded-full flex items-center justify-center relative z-10 text-white">
                                                    <Shield className="h-10 w-10 animate-pulse" />
                                                </div>
                                            </div>
                                            <p className="text-gray-500 mt-6 text-center max-w-xs">
                                                We are broadcasting your request to <span className="text-brand-purple font-bold">{nearbyDrivers.length}</span> nearby female drivers in <span className="font-bold">{user.city || 'your city'}</span>...
                                            </p>
                                        </div>
                                    )}

                                    {currentRide?.driver && (currentRide.status !== 'SEARCHING') && (
                                        <div className="flex items-center gap-4 mb-6">
                                            <img src={currentRide.driver.avatarUrl || "https://picsum.photos/100/100"} alt="Driver" className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-md -mt-10" />
                                            <div className="-mt-4">
                                                <h3 className="font-bold text-lg text-gray-800">{currentRide.driver.name}</h3>
                                                <div className="flex items-center text-yellow-400 text-sm">
                                                    ★★★★★ <span className="text-gray-400 ml-1">({currentRide.driver.rating || '5.0'})</span>
                                                </div>
                                            </div>
                                            <div className="ml-auto flex gap-2">
                                                <button className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200">
                                                    <Phone className="h-5 w-5" />
                                                </button>
                                                <button className="h-10 w-10 bg-brand-pink text-white rounded-full flex items-center justify-center hover:bg-pink-600">
                                                    <Shield className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {currentRide?.status === 'ACCEPTED' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-brand-purple">
                                                    <Shield className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">Verification Code</p>
                                                    <p className="text-2xl font-bold text-brand-purple tracking-widest">8 2 9 1</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentRide?.status === 'IN_PROGRESS' && (
                                        <div className="flex flex-col items-center justify-center py-6">
                                            <div className="h-32 w-full bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400">
                                                <Navigation className="h-8 w-8 animate-pulse" />
                                            </div>
                                            <p className="text-gray-500 text-sm">Heading to destination...</p>
                                        </div>
                                    )}

                                    {currentRide?.status !== 'IN_PROGRESS' && (
                                        <Button
                                            variant="outline"
                                            fullWidth
                                            className="mt-6 border-red-200 text-red-500 hover:bg-red-50"
                                            onClick={async () => {
                                                if (window.confirm("Are you sure you want to cancel your ride request?")) {
                                                    try {
                                                        await cancelRide(currentRide?.id || activeRideId || '');
                                                        resetFlow();
                                                    } catch (error) {
                                                        console.error("Error cancelling ride:", error);
                                                        alert("Failed to cancel ride.");
                                                    }
                                                }
                                            }}
                                        >
                                            Cancel Ride
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};