import { User, UserRole } from '../../../types';

export enum AccountStatus {
    ACTIVE = 'Active',
    REVIEW = 'Under Review',
    SUSPENDED = 'Suspended',
    BANNED = 'Banned'
}

export interface AdminUser extends User {
    email: string;
    registrationDate: string;
    status: AccountStatus;
    totalTrips: number;
    totalSpend: number;
    lastActive: string;
    paymentMethod: 'Card' | 'Cash' | 'Wallet';
    city: string;
}

const FIRST_NAMES = ['Sarah', 'Fatima', 'Amina', 'Layla', 'Noura', 'Mariam', 'Khadija', 'Zainab', 'Huda', 'Rania'];
const LAST_NAMES = ['Ahmed', 'Ali', 'Mohamed', 'Hassan', 'Ibrahim', 'Mahmoud', 'Saleh', 'Omar', 'Khalid', 'Youssef'];
const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Fes'];

const generateUser = (id: string): AdminUser => {
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const statusKeys = Object.values(AccountStatus);

    return {
        id,
        name: `${fn} ${ln}`,
        role: UserRole.PASSENGER,
        avatarUrl: `https://ui-avatars.com/api/?name=${fn}+${ln}&background=random`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
        phoneNumber: `06${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        registrationDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        status: statusKeys[Math.floor(Math.random() * statusKeys.length)],
        rating: 3 + Math.random() * 2, // 3.0 - 5.0
        totalTrips: Math.floor(Math.random() * 50),
        totalSpend: Math.floor(Math.random() * 5000),
        lastActive: new Date(Date.now() - Math.random() * 100000000).toISOString(),
        paymentMethod: Math.random() > 0.5 ? 'Cash' : 'Wallet',
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
        verificationStatus: Math.random() > 0.7 ? 'VERIFIED' : Math.random() > 0.4 ? 'PENDING' : 'UNVERIFIED',
    };
};

export const MOCK_USERS: AdminUser[] = Array.from({ length: 150 }, (_, i) => generateUser(`u${i + 1}`));
