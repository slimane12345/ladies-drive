export enum UserRole {
  PASSENGER = 'PASSENGER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export enum RideType {
  REGULAR = 'Ladies Drive',
  FAMILY = 'Ladies Drive Family',
  VIP = 'Ladies Drive VIP',
  INSTANT = 'Ladies Drive Instant'
}

export enum RideStatus {
  SEARCHING = 'SEARCHING',
  ACCEPTED = 'ACCEPTED',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
}

export interface DriverDocuments {
  licenseUrl?: string; // Driver's License
  nationalIdUrl?: string; // National ID
  criminalRecordUrl?: string; // Criminal Record Certificate
  insuranceUrl?: string; // Vehicle Insurance
  personalPhotoUrl?: string; // Personal Photo
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  rating?: number;
  ratingCount?: number;
  completedTrips?: number;
  dailyTarget?: number;
  phoneNumber?: string;
  email?: string;
  verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  idCardUrl?: string;
  address?: string;
  birthDate?: string;
  emergencyContact?: string;

  // Driver specific
  vehicle?: VehicleInfo;
  documents?: DriverDocuments;
  city?: string;
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  currentLocation?: { lat: number; lng: number };
}

export interface RideRequest {
  id: string;
  passenger: User;
  pickup: string;
  destination: string;
  type: RideType;
  price: number;
  options: {
    quiet: boolean;
    luggage: boolean;
    assistance: boolean;
    wait: boolean;
  };
  status: RideStatus;
  city?: string;
  driver?: User;
  targetDriverId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}