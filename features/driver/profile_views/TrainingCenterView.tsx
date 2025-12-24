import React from 'react';
import { ChevronLeft, GraduationCap, PlayCircle, CheckCircle, Clock, Star, Trophy, Award } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface TrainingCenterViewProps {
    onBack: () => void;
}

const COURSES = [
    {
        id: 1,
        title: "Introduction to Ladies Drive",
        description: "Learn about our safety standards and community guidelines.",
        duration: "15 min",
        progress: 100,
        status: "COMPLETED",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 2,
        title: "Defensive Driving for Women",
        description: "Advanced techniques for navigating urban environments safely.",
        duration: "45 min",
        progress: 30,
        status: "IN_PROGRESS",
        image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=400"
    },
    {
        id: 3,
        title: "Dealing with Emergency Situations",
        description: "What to do in case of breakdowns or medical emergencies.",
        duration: "30 min",
        progress: 0,
        status: "NOT_STARTED",
        image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
    }
];

export const TrainingCenterView: React.FC<TrainingCenterViewProps> = ({ onBack }) => {
    return (
        <div className="fixed inset-0 bg-gray-50 z-[60] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        <ChevronLeft className="h-6 w-6" /> Back
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Training Center</h1>
                    <div className="w-12"></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-8">
                {/* Stats Summary */}
                <div className="bg-gradient-to-br from-brand-purple to-purple-800 rounded-3xl p-8 text-white shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold">Your Progress</h2>
                            <p className="text-purple-200 mt-1">1 of 3 courses completed</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                            <Trophy className="h-8 w-8 text-yellow-300" />
                        </div>
                    </div>

                    <div className="mt-8 space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Level: Silver Partner</span>
                            <span>33%</span>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-pink w-[33%] rounded-full shadow-lg shadow-pink-500/50"></div>
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-l-4 border-brand-purple pl-4">Available Courses</h3>

                    <div className="grid gap-6">
                        {COURSES.map((course) => (
                            <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-32 w-full overflow-hidden relative">
                                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                                            <Clock size={12} /> {course.duration}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-gray-900">{course.title}</h4>
                                        {course.status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${course.status === 'COMPLETED' ? 'bg-green-500' : 'bg-brand-purple'} rounded-full`} style={{ width: `${course.progress}%` }}></div>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={course.status === 'COMPLETED' ? 'outline' : 'primary'}
                                            className="min-w-[100px]"
                                        >
                                            {course.status === 'COMPLETED' ? 'Review' : course.status === 'IN_PROGRESS' ? 'Resume' : 'Start'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm">
                            <Award className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Why complete training?</h4>
                            <p className="text-sm text-gray-600 mt-1">Completing all courses increases your rating and unlocks "Gold Partner" status with 5% lower commissions.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-12"></div>
        </div>
    );
};
