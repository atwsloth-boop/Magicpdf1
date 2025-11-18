import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const PDFLib: any;

const UnlockPdfTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'upload' | 'password' | 'complete'>('upload');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are accepted.');
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setError(null);
        setPassword('');
        setStep('password');
    };
    
    const handleReset = () => {
        setFile(null);
        setPassword('');
        setError(null);
        setIsProcessing(false);
        setStep('upload');
         if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUnlock = async () => {
        if (!file || !password) {
            setError('Please provide a password.');
            return;
        }
        setIsProcessing(true);
        setError(null);
        
        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await file.arrayBuffer();
            // Attempt to load the PDF with the provided password
            const pdfDoc = await PDFDocument.load(arrayBuffer, { password });
            
            // If it loads, save it without a password
            const unlockedPdfBytes = await pdfDoc.save();
            downloadFile(unlockedPdfBytes, 'application/pdf', `${file.name.replace('.pdf', '')}-unlocked.pdf`);
            setStep('complete');
            
        } catch (e) {
            console.error(e);
            // pdf-lib throws an error for incorrect passwords.
            setError('Incorrect password or the PDF file may be corrupted.');
            setStep('password'); // Go back to password step
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (isProcessing) {
        return <ProcessingAnimation text="Unlocking your PDF..." />;
    }

    if (step === 'complete') {
        return (
            <div className="w-full flex flex-col gap-4 items-center text-center">
                <h3 className="text-2xl font-bold text-green-600">PDF Unlocked Successfully!</h3>
                <p className="text-gray-600">Your download has started. If not, please check your browser settings.</p>
                <button onClick={handleReset} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-indigo-700">
                    Unlock Another PDF
                </button>
            </div>
        );
    }
    
    return (
        <div className="w-full flex flex-col gap-4">
            {step === 'upload' ? (
                 <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files?.[0] || null); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-700 font-semibold">Select a password-protected PDF</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-center bg-gray-50 p-4 rounded-lg border">
                        <p className="font-semibold">{file?.name}</p>
                        <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline mt-1">
                            Choose a different file
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="password-input" className="text-sm font-medium text-gray-600 mb-1">Enter Password</label>
                        <input
                            id="password-input"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="PDF Password"
                            className="w-full border-gray-300 rounded-md shadow-sm p-2 text-lg"
                            autoFocus
                        />
                    </div>
                     {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button onClick={handleUnlock} disabled={!password} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-indigo-700 disabled:opacity-50">
                        Unlock PDF
                    </button>
                </>
            )}
        </div>
    );
};

export default UnlockPdfTool;
