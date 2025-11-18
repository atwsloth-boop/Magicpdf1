import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation } from './common';

declare const PDFLib: any;

const MergePdfTool: React.FC = () => {
    type Step = 'upload' | 'preview' | 'processing' | 'complete';
    const [step, setStep] = useState<Step>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [mergedFileUrl, setMergedFileUrl] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const newFiles = Array.from(selectedFiles).filter(file => file.type === 'application/pdf');
        
        if (newFiles.length !== selectedFiles.length) {
            setError("Only PDF files are accepted.");
        } else {
            setError(null);
        }

        if(newFiles.length > 0) {
            setFiles(prev => [...prev, ...newFiles]);
            setStep('preview');
        }
    };
    
    const handleReset = () => {
        setFiles([]);
        setError(null);
        setMergedFileUrl(null);
        setStep('upload');
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            setError("Please select at least two PDF files to merge.");
            return;
        }
        setStep('processing');
        setError(null);
        try {
            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const donorPdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
                copiedPages.forEach(page => mergedPdf.addPage(page));
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setMergedFileUrl(url);
            setStep('complete');
        } catch (e) {
            console.error(e);
            setError("An error occurred while merging the PDFs. Please ensure they are valid files.");
            setStep('preview');
        }
    };
    
    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        if (newFiles.length === 0) {
            handleReset();
        }
    };
    
    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...files];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= files.length) return;
        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
        setFiles(newFiles);
    };

    const renderUploadStep = () => (
        <div
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
        >
            <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf" onChange={(e) => handleFileSelect(e.target.files)} />
            <div className="flex flex-col items-center">
                <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-semibold">Drag & drop PDF files here</p>
                <p className="text-gray-500">or</p>
                <span className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md font-bold">
                    Select Files
                </span>
            </div>
        </div>
    );
    
    const renderPreviewStep = () => (
        <div className="w-full flex flex-col gap-4">
             {error && <p className="text-red-500 text-sm text-center -mt-2 mb-2">{error}</p>}
            <div className="text-left bg-gray-50 p-4 rounded-lg border max-h-60 overflow-y-auto custom-scrollbar">
                <h4 className="font-semibold text-gray-800 mb-2">Files to merge (in order):</h4>
                <ul className="space-y-2">
                    {files.map((file, i) => (
                        <li key={i} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 shadow-sm">
                            <span className="text-sm text-gray-700 truncate pr-2">{i+1}. {file.name}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => moveFile(i, 'up')} disabled={i === 0} className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                                <button onClick={() => moveFile(i, 'down')} disabled={i === files.length - 1} className="p-1 text-gray-500 hover:text-indigo-600 disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                                <button onClick={() => removeFile(i)} className="p-1 text-red-500 hover:text-red-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
             <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-gray-300">
                Add More Files
            </button>
            <button onClick={handleMerge} disabled={files.length < 2} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Merge PDFs
            </button>
        </div>
    );
    
    const renderProcessingStep = () => (
        <div className="w-full flex justify-center py-10">
            <ProcessingAnimation />
        </div>
    );

    const renderCompleteStep = () => (
        <div className="w-full flex flex-col gap-4 items-center text-center">
            <h3 className="text-2xl font-bold text-green-600">Merge Successful!</h3>
            <p className="text-gray-600">Your combined PDF is ready for download.</p>
            <a href={mergedFileUrl!} download="merged-magic-pdf.pdf" className="w-full block text-center bg-green-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-green-700">
                Download Merged PDF
            </a>
            <p className="text-sm text-gray-500">Thank you for using Magic PDF!</p>
            <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline">
                Start Over
            </button>
        </div>
    );

    switch (step) {
        case 'upload': return renderUploadStep();
        case 'preview': return renderPreviewStep();
        case 'processing': return renderProcessingStep();
        case 'complete': return renderCompleteStep();
        default: return renderUploadStep();
    }
};

export default MergePdfTool;
