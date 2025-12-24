import React from 'react';
import { ChevronLeft, FileText, CheckCircle, Clock, AlertTriangle, ExternalLink, Download, Upload, Loader2 } from 'lucide-react';
import { User, DriverDocuments } from '../../../types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../services/firebase';

interface DriverDocumentsViewProps {
    user: User;
    documents: DriverDocuments;
    onBack: () => void;
    onUpdateUser?: (user: User) => void;
}

const DOCUMENT_LABELS: Record<string, string> = {
    licenseUrl: "Driver's License",
    nationalIdUrl: "National ID Card",
    criminalRecordUrl: "Criminal Record Certificate",
    insuranceUrl: "Vehicle Insurance Policy",
    personalPhotoUrl: "Profile Photo"
};

export const DriverDocumentsView: React.FC<DriverDocumentsViewProps> = ({ user, documents, onBack, onUpdateUser }) => {
    const [uploadingField, setUploadingField] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedField, setSelectedField] = React.useState<keyof DriverDocuments | null>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedField) return;

        setUploadingField(selectedField);
        try {
            const storageRef = ref(storage, `drivers/${user.id}/documents/${selectedField}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            const userRef = doc(db, 'users', user.id);
            const updatedDocuments = { ...documents, [selectedField]: downloadURL };

            await updateDoc(userRef, {
                documents: updatedDocuments,
                verificationStatus: 'PENDING'
            });

            onUpdateUser?.({
                ...user,
                documents: updatedDocuments,
                verificationStatus: 'PENDING'
            });

            setUploadingField(null);
            setSelectedField(null);
            alert(`${DOCUMENT_LABELS[selectedField]} uploaded successfully!`);
        } catch (error: any) {
            console.error("FIREBASE_STORAGE_UPLOAD_ERROR:", error);
            setUploadingField(null);
            setSelectedField(null);

            let errorMessage = "Failed to upload document.";
            if (error.code === 'storage/unauthorized') {
                errorMessage = "Access denied. Please check your storage bucket permissions (CORS).";
            } else if (error.message?.includes('CORS')) {
                errorMessage = "Browser blocked upload (CORS Error). Please see Admin instructions.";
            }

            alert(errorMessage);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const triggerUpload = (field: keyof DriverDocuments) => {
        setSelectedField(field);
        fileInputRef.current?.click();
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-[60] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleUpload}
            />
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        <ChevronLeft className="h-6 w-6" /> Back
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">My Documents</h1>
                    <div className="w-12"></div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${user.verificationStatus === 'VERIFIED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            {user.verificationStatus === 'VERIFIED' ? <CheckCircle className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Verification Status</h2>
                            <p className={`${user.verificationStatus === 'VERIFIED' ? 'text-green-600' : 'text-orange-600'} text-sm font-semibold uppercase tracking-wider`}>
                                {user.verificationStatus || 'UNVERIFIED'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(DOCUMENT_LABELS).map(([key, label]) => {
                            const url = documents[key as keyof DriverDocuments];
                            return (
                                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm ${url ? 'text-green-500' : 'text-gray-400'}`}>
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{label}</p>
                                            {url ? (
                                                <p className="text-[10px] text-green-600 flex items-center gap-1 font-bold uppercase tracking-tight">
                                                    <CheckCircle size={10} /> Uploaded
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-red-400 flex items-center gap-1 font-bold uppercase tracking-tight">
                                                    <AlertTriangle size={10} /> Missing
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {uploadingField === key ? (
                                            <div className="h-9 w-9 flex items-center justify-center">
                                                <Loader2 className="h-5 w-5 text-brand-purple animate-spin" />
                                            </div>
                                        ) : (
                                            <>
                                                {url && (
                                                    <button
                                                        onClick={() => window.open(url, '_blank')}
                                                        className="h-9 w-9 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm border border-gray-100 hover:text-brand-purple transition-colors"
                                                        title="View"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => triggerUpload(key as keyof DriverDocuments)}
                                                    className={`h-9 w-9 rounded-full flex items-center justify-center shadow-sm border transition-colors ${url ? 'bg-white text-gray-600 border-gray-100 hover:text-brand-purple' : 'bg-brand-purple text-white border-transparent'}`}
                                                    title={url ? "Replace" : "Upload"}
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-yellow-50 rounded-3xl p-6 border border-yellow-100">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-yellow-600 shadow-sm flex-shrink-0">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Expired Documents?</h4>
                            <p className="text-sm text-gray-600 mt-1">If your license or insurance has expired, please upload the new version immediately to avoid account suspension.</p>
                            <button className="text-brand-purple text-sm font-bold mt-3 underline">Request Document Update</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-12"></div>
        </div>
    );
};
