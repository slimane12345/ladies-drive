import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, Search, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface HelpSupportViewProps {
    onBack: () => void;
}

const FAQS = [
    {
        question: "How do I cash out my earnings?",
        answer: "You can cash out your earnings once a week. Go to the Payment Methods section to link your bank account, then request a payout from the Earnings dashboard."
    },
    {
        question: "What should I do in case of an accident?",
        answer: "First, ensure everyone's safety. Use the emergency button in the app if immediate help is needed. Then, contact our 24/7 support line through the phone icon below."
    },
    {
        question: "How is my rating calculated?",
        answer: "Your rating is the average of the last 100 ratings from passengers. High ratings can unlock Silver and Gold partner benefits."
    },
    {
        question: "Can I take male passengers?",
        answer: "No, Ladies Drive is strictly for women and children. This is a core part of our safety guarantee for both drivers and passengers."
    }
];

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({ onBack }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="fixed inset-0 bg-gray-50 z-[60] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        <ChevronLeft className="h-6 w-6" /> Back
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Help & Support</h1>
                    <div className="w-12"></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-8">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search for help topics..."
                        className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Contact Options */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:bg-brand-purple/5 transition-colors group">
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-gray-900">Live Chat</span>
                        <span className="text-xs text-gray-400 mt-1">Typical wait: 2 min</span>
                    </button>
                    <button className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center hover:bg-brand-purple/5 transition-colors group">
                        <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Phone className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-gray-900">Call Support</span>
                        <span className="text-xs text-gray-400 mt-1">Available 24/7</span>
                    </button>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 ml-2">Frequently Asked Questions</h3>
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        {FAQS.map((faq, i) => (
                            <div key={i} className="px-6 py-5">
                                <button
                                    className="w-full flex justify-between items-center text-left"
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                >
                                    <span className="font-bold text-gray-800 leading-tight pr-4">{faq.question}</span>
                                    {openIndex === i ? <ChevronUp className="h-5 w-5 text-brand-purple" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                </button>
                                {openIndex === i && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Community Forum Link */}
                <div className="bg-brand-purple rounded-3xl p-6 text-white overflow-hidden relative shadow-lg shadow-purple-200">
                    <div className="relative z-10">
                        <h4 className="font-bold text-lg">Partner Community</h4>
                        <p className="text-purple-200 text-sm mt-1">Connect with other Ladies Drive partners, share tips, and attend local meetups.</p>
                        <button className="mt-4 bg-white text-brand-purple px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-purple-50">
                            Join Forum <ExternalLink size={14} />
                        </button>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-32 bg-white/10 -skew-x-12 translate-x-16 pointer-events-none"></div>
                </div>

                <div className="text-center pb-8">
                    <p className="text-xs text-gray-400">Need immediate safety assistance?</p>
                    <button className="bg-red-50 text-red-600 px-6 py-2 rounded-full font-bold text-sm mt-2 border border-red-100 shadow-sm">Emergency Dispatch</button>
                </div>
            </div>
        </div>
    );
};
