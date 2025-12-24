import React, { useState } from 'react';
import { Star, User as UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { User } from '../../types';

interface RatePassengerProps {
    passenger: User;
    ridePrice: number;
    onSubmit: (rating: number) => void;
    onSkip: () => void;
}

export const RatePassenger: React.FC<RatePassengerProps> = ({ passenger, ridePrice, onSubmit, onSkip }) => {
    const [rating, setRating] = useState(0);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
                <div className="text-center mb-6">
                    <div className="h-20 w-20 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-white shadow-sm">
                        {passenger.avatarUrl ? (
                            <img src={passenger.avatarUrl} alt={passenger.name} className="h-full w-full object-cover" />
                        ) : (
                            <UserIcon className="h-8 w-8 text-brand-purple" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Ride Completed!</h2>
                    <p className="text-gray-500">You earned <span className="font-bold text-green-600">${ridePrice}</span></p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-center">
                    <p className="text-sm text-gray-600 font-medium mb-4">How was your passenger?</p>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    className={`h-8 w-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 h-4">
                        {rating === 5 ? "Excellent!" : rating === 1 ? "Terrible" : rating > 0 ? "Thanks for rating" : ""}
                    </p>
                </div>

                <div className="space-y-3">
                    <Button
                        fullWidth
                        size="lg"
                        className="bg-brand-purple"
                        disabled={rating === 0}
                        onClick={() => onSubmit(rating)}
                    >
                        Submit Rating
                    </Button>
                    <Button
                        fullWidth
                        variant="ghost"
                        onClick={onSkip}
                    >
                        Skip
                    </Button>
                </div>
            </div>
        </div>
    );
};
