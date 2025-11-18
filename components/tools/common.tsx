import React from 'react';

export const ProcessingAnimation: React.FC<{ text?: string }> = ({ text = "Processing your documents..." }) => (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative h-24 w-24">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-semibold text-gray-700">{text}</p>
        <p className="text-sm text-gray-500">Please wait a moment.</p>
    </div>
);

export const ComingSoon: React.FC = () => (
    <div className="text-center p-10 bg-gray-100 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-700 mb-2">Tool Coming Soon!</h3>
        <p className="text-gray-500">We're working hard to bring this feature to you.</p>
    </div>
);

export const downloadFile = (data: BlobPart, type: string, name: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
