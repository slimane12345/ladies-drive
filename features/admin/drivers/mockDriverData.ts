import { User, UserRole, VehicleInfo, DriverDocuments } from '../../../types';

export enum DriverStatus {
    ACTIVE = 'Active',
    IN_SERVICE = 'In Service',
    UNAVAILABLE = 'Unavailable',
    TRAINING = 'Training',
    PENDING = 'Pending',
    REJECTED = 'Rejected',
    VIP = 'VIP'
}

export interface AdminDriver extends User {
    status: DriverStatus;
    joinDate: string;
    totalEarnings: number;
    tripsToday: number;
    earningsToday: number;
    rating: number;
    totalTrips: number;
    acceptanceRate: number;
    cancellationRate: number;
    city: string;
    membershipType: 'Standard' | 'Silver' | 'Gold' | 'Platinum';
}

const FIRST_NAMES = ['Sarah', 'Fatima', 'Amina', 'Layla', 'Noura', 'Mariam', 'Huda', 'Zainab', 'Salma', 'Rania'];
const LAST_NAMES = ['Ahmed', 'Ali', 'Khan', 'Mohammed', 'Ibrahim', 'Hassan', 'Abdullah', 'Saleh', 'Omar', 'Youssef'];
const CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca', 'Medina'];
const CAR_MAKES = ['Toyota', 'Hyundai', 'Honda', 'Nissan', 'Kia'];
const CAR_MODELS = ['Camry', 'Elantra', 'Accord', 'Altima', 'Sonata', 'Corolla'];

// Generate 100 mock drivers
export const MOCK_DRIVERS: AdminDriver[] = Array.from({ length: 100 }, (_, i) => {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const isPending = i < 15; // First 15 are pending
    const isVIP = i > 15 && i < 25;

    let status = DriverStatus.ACTIVE;
    if (isPending) status = DriverStatus.PENDING;
    else if (i % 10 === 0) status = DriverStatus.REJECTED;
    else if (i % 5 === 0) status = DriverStatus.IN_SERVICE;
    else if (i % 7 === 0) status = DriverStatus.UNAVAILABLE;
    else if (isVIP) status = DriverStatus.VIP;

    return {
        id: `d-${i + 1}`,
        name: `${firstName} ${lastName}`,
        role: UserRole.DRIVER,
        avatarUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&color=fff`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phoneNumber: `+966 5${Math.floor(Math.random() * 90000000 + 10000000)}`,
        status,
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        totalEarnings: Math.floor(Math.random() * 50000) + 1000,
        tripsToday: status === DriverStatus.IN_SERVICE ? Math.floor(Math.random() * 10) + 1 : 0,
        earningsToday: status === DriverStatus.IN_SERVICE ? Math.floor(Math.random() * 500) : 0,
        rating: 3.5 + Math.random() * 1.5,
        totalTrips: Math.floor(Math.random() * 2000),
        acceptanceRate: 80 + Math.random() * 20,
        cancellationRate: Math.random() * 5,
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
        membershipType: isVIP ? 'Platinum' : Math.random() > 0.7 ? 'Gold' : 'Standard',
        vehicle: {
            make: CAR_MAKES[Math.floor(Math.random() * CAR_MAKES.length)],
            model: CAR_MODELS[Math.floor(Math.random() * CAR_MODELS.length)],
            year: `${2018 + Math.floor(Math.random() * 6)}`,
            color: ['White', 'Black', 'Silver', 'Red', 'Blue'][Math.floor(Math.random() * 5)],
            plateNumber: `${Math.floor(Math.random() * 9000)} ABC`
        },
        address: `${Math.floor(Math.random() * 100)} King Fahd Road, ${CITIES[Math.floor(Math.random() * CITIES.length)]}`,
        verificationStatus: isPending ? 'PENDING' : status === DriverStatus.REJECTED ? 'REJECTED' : 'VERIFIED',
    };
});
