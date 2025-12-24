import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot, query, where, getDoc, runTransaction, increment } from 'firebase/firestore';
import { db } from './firebase';
import { User, RideType, RideStatus, RideRequest } from '../types';

export const createRideRequest = async (
    passenger: User,
    pickup: string,
    destination: string,
    pickupLocation: [number, number],
    destinationLocation: [number, number],
    price: number,
    type: RideType,
    options: any,
    targetDriverId?: string
): Promise<string> => {
    try {
        const ridesRef = collection(db, 'rides');
        const docRef = await addDoc(ridesRef, {
            passenger: {
                id: passenger.id,
                name: passenger.name,
                avatarUrl: passenger.avatarUrl,
                rating: passenger.rating || 5.0
            },
            pickup,
            destination,
            pickupLocation: { lat: pickupLocation[0], lng: pickupLocation[1] },
            destinationLocation: { lat: destinationLocation[0], lng: destinationLocation[1] },
            price,
            type,
            options,
            status: 'SEARCHING',
            city: passenger.city || 'Unknown',
            targetDriverId: targetDriverId || null,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating ride request:", error);
        throw error;
    }
};

export const subscribeToRide = (rideId: string, callback: (ride: RideRequest) => void) => {
    return onSnapshot(doc(db, 'rides', rideId), (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() } as RideRequest);
        }
    });
};

export const subscribeToOpenRides = (city: string, driverId: string | null, callback: (rides: RideRequest[]) => void) => {
    // If driverId is provided, only show rides TARGETED to this driver
    // Otherwise show general rides (if we still want broadcast, but user said "only after choosing")
    const q = query(
        collection(db, 'rides'),
        where('status', '==', 'SEARCHING'),
        where('city', '==', city),
        where('targetDriverId', '==', driverId)
    );
    return onSnapshot(q, (snapshot) => {
        const rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RideRequest));
        callback(rides);
    });
};

export const acceptRide = async (rideId: string, driver: User) => {
    const rideRef = doc(db, 'rides', rideId);
    await updateDoc(rideRef, {
        status: 'ACCEPTED',
        driver: {
            id: driver.id,
            name: driver.name,
            avatarUrl: driver.avatarUrl,
            vehicle: driver.vehicle,
            rating: driver.rating || 4.9,
            phone: driver.phoneNumber
        }
    });
};
export const updateRideStatus = async (rideId: string, status: RideStatus) => {
    const rideRef = doc(db, 'rides', rideId);
    await updateDoc(rideRef, { status });
};

export const completeRide = async (rideId: string, passengerId: string, driverId: string) => {
    const rideRef = doc(db, 'rides', rideId);
    const passengerRef = doc(db, 'users', passengerId);
    const driverRef = doc(db, 'users', driverId);

    await runTransaction(db, async (transaction) => {
        const rideDoc = await transaction.get(rideRef);
        if (!rideDoc.exists()) throw "Ride not found";

        // 1. Update Ride Status
        transaction.update(rideRef, {
            status: RideStatus.COMPLETED,
            completedAt: serverTimestamp()
        });

        // 2. Increment Passenger's completedTrips
        transaction.update(passengerRef, {
            completedTrips: increment(1)
        });

        // 3. Increment Driver's completedTrips
        transaction.update(driverRef, {
            completedTrips: increment(1)
        });
    });
};

export const rateUser = async (userId: string, newRating: number) => {
    const userRef = doc(db, 'users', userId);

    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const currentRating = userData.rating || 5.0;
        const currentCount = userData.ratingCount || 0;

        const nextCount = currentCount + 1;
        const nextRating = ((currentRating * currentCount) + newRating) / nextCount;

        transaction.update(userRef, {
            rating: Number(nextRating.toFixed(2)),
            ratingCount: nextCount
        });
    });
};
export const cancelRide = async (rideId: string) => {
    const rideRef = doc(db, 'rides', rideId);
    await updateDoc(rideRef, {
        status: RideStatus.CANCELLED,
        cancelledAt: serverTimestamp()
    });
};
export const subscribeToDriverRides = (driverId: string, callback: (rides: RideRequest[]) => void) => {
    const q = query(
        collection(db, 'rides'),
        where('driver.id', '==', driverId),
        where('status', 'in', [RideStatus.ACCEPTED, RideStatus.ARRIVED, RideStatus.IN_PROGRESS])
    );
    return onSnapshot(q, (snapshot) => {
        const rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RideRequest));
        callback(rides);
    });
};
