import { RideType } from './types';

export const APP_NAME = "Ladies Drive";

export const SERVICE_TYPES = [
  {
    id: RideType.REGULAR,
    name: 'Regular',
    description: 'Everyday rides',
    multiplier: 1.0,
    icon: 'Car'
  },
  {
    id: RideType.FAMILY,
    name: 'Family',
    description: 'For you and your kids',
    multiplier: 1.4,
    icon: 'Users'
  },
  {
    id: RideType.VIP,
    name: 'VIP',
    description: 'Luxury experience',
    multiplier: 2.0,
    icon: 'Crown'
  },
  {
    id: RideType.INSTANT,
    name: 'Instant',
    description: 'No booking needed',
    multiplier: 1.2,
    icon: 'Zap'
  }
];


export const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fes",
  "Tangier",
  "Agadir",
  "Meknes",
  "Oujda",
  "Kenitra",
  "Tetouan",
  "Safi",
  "Sale",
  "Mohammedia"
];

export const MOCK_DRIVER_LOCATION = { lat: 33.5731, lng: -7.5898 }; // Casablanca coords