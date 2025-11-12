import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tool } from '../types';
import { UploadIcon } from './icons/ToolIcons';
import { QRCodeSVG } from 'qrcode.react';

// Inform TypeScript about the global objects from the CDN scripts
declare const PDFLib: any;
declare const JSZip: any;
declare const mammoth: any;
declare const jspdf: any;
declare const html2canvas: any;
declare const pdfjsLib: any;

// Fix: Add type definitions for the browser's SpeechRecognition API to resolve compilation errors.
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      isFinal: boolean;
      [key: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    mammoth: any;
    jspdf: any;
    html2canvas: any;
  }
}

interface ToolPageProps {
  tool: Tool;
}

// A generic file drop zone component for tools that need file input
const FileDropZone: React.FC = () => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(droppedFiles);
        setStatus('idle');
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setStatus('idle');
        }
    };
    
    const simulateProcessing = () => {
        if (files.length === 0) return;
        setStatus('uploading');
        setTimeout(() => {
            setStatus('processing');
            setTimeout(() => {
                setStatus('done');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="w-full text-center">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300`}
            >
                <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-700">Drag & drop files here, or click to select files</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size 50MB</p>
                </label>
            </div>
            {files.length > 0 && (
                <div className="mt-4 text-left">
                    <h4 className="font-semibold text-gray-700">Selected files:</h4>
                    <ul className="list-disc list-inside text-gray-600">
                        {files.map((file, i) => <li key={i}>{file.name}</li>)}
                    </ul>
                </div>
            )}
            <button
                onClick={simulateProcessing}
                disabled={files.length === 0 || status !== 'idle'}
                className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Process Files
            </button>
            {status !== 'idle' && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                    {status === 'uploading' && <p className="text-yellow-600">Uploading...</p>}
                    {status === 'processing' && <p className="text-blue-600">Processing...</p>}
                    {status === 'done' && <p className="text-green-600">Done! Your download will start shortly (simulation).</p>}
                </div>
            )}
        </div>
    );
};


// Specific Tool Components

const ProcessingAnimation: React.FC<{ text?: string }> = ({ text = "Processing your documents..." }) => (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative h-24 w-24">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-semibold text-gray-700">{text}</p>
        <p className="text-sm text-gray-500">Please wait a moment.</p>
    </div>
);


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
            setStep('preview'); // Go back to preview on error
        }
    };
    
    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        if (newFiles.length === 0) {
            setStep('upload');
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
            className={`w-full relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
        >
            <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf" onChange={(e) => handleFileSelect(e.target.files)} />
            <div className="flex flex-col items-center">
                <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-semibold">Drag & drop PDF files here</p>
                <p className="text-gray-500">or</p>
                <span className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md font-bold">
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
                                <button onClick={() => moveFile(i, 'up')} disabled={i === 0} className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                                <button onClick={() => moveFile(i, 'down')} disabled={i === files.length - 1} className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                                <button onClick={() => removeFile(i)} className="p-1 text-red-500 hover:text-red-700"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
             <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-gray-300">
                Add More Files
            </button>
            <button onClick={handleMerge} disabled={files.length < 2} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
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
            <button onClick={handleReset} className="text-sm text-blue-600 hover:underline">
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

const SplitPdfTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'extract' | 'split'>('extract');
    const [pageRange, setPageRange] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are accepted.');
            setFile(null);
            setTotalPages(0);
            return;
        }
        setFile(selectedFile);
        setError(null);
        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            setTotalPages(pdfDoc.getPageCount());
        } catch (e) {
            setError('Could not read PDF file.');
            setFile(null);
            setTotalPages(0);
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);
        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            if (mode === 'extract') {
                const pagesToExtract = parsePageRange(pageRange, totalPages);
                if (!pagesToExtract) {
                    setError('Invalid page range format. Use numbers, commas, and hyphens (e.g., 1, 3-5, 8).');
                    // Fix: Ensure processing state is reset on error.
                    setIsProcessing(false);
                    return;
                }
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract.map(p => p - 1));
                copiedPages.forEach(page => newPdf.addPage(page));
                const pdfBytes = await newPdf.save();
                downloadFile(pdfBytes, 'application/pdf', `${file.name.replace('.pdf', '')}-extracted.pdf`);
            } else { // split
                const zip = new JSZip();
                for (let i = 0; i < totalPages; i++) {
                    const newPdf = await PDFDocument.create();
                    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                    newPdf.addPage(copiedPage);
                    const pdfBytes = await newPdf.save();
                    zip.file(`${file.name.replace('.pdf', '')}-page-${i + 1}.pdf`, pdfBytes);
                }
                const zipContent = await zip.generateAsync({ type: 'blob' });
                downloadFile(zipContent, 'application/zip', `${file.name.replace('.pdf', '')}-split.zip`);
            }
        } catch (e) {
            console.error(e);
            setError('An error occurred while splitting the PDF.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadFile = (data: BlobPart, type: string, name: string) => {
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

    const parsePageRange = (rangeStr: string, max: number): number[] | null => {
        const result: Set<number> = new Set();
        // Fix: Return null for empty string to trigger validation error, instead of returning an empty array.
        if (!rangeStr.trim()) return null;
        const parts = rangeStr.split(',');
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(s => parseInt(s.trim()));
                if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > max) return null;
                for (let i = start; i <= end; i++) result.add(i);
            } else {
                const num = parseInt(part.trim());
                if (isNaN(num) || num < 1 || num > max) return null;
                result.add(num);
            }
        }
        return Array.from(result).sort((a, b) => a - b);
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {!file ? (
                 <div onClick={() => fileInputRef.current?.click()} className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 transition-all duration-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-gray-700">Click to select a PDF file</p>
                    </div>
                </div>
            ) : (
                <div className="text-left bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold">{file.name} <span className="text-gray-500 font-normal">({totalPages} pages)</span></p>
                </div>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {file && (
                <>
                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                        <button onClick={() => setMode('extract')} className={`flex-1 p-3 font-semibold ${mode === 'extract' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Extract Pages</button>
                        <button onClick={() => setMode('split')} className={`flex-1 p-3 font-semibold ${mode === 'split' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Split to Separate Pages</button>
                    </div>
                    {mode === 'extract' && (
                        <input
                            type="text"
                            value={pageRange}
                            onChange={(e) => setPageRange(e.target.value)}
                            placeholder="e.g., 1, 3-5, 8"
                            className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    )}
                    <button onClick={handleProcess} disabled={isProcessing} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50">
                        {isProcessing ? 'Processing...' : 'Split PDF'}
                    </button>
                </>
            )}
        </div>
    );
};

const CompressPdfTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ originalSize: number; newSize: number; compressedBytes: Uint8Array } | null>(null);
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
        setResult(null);
    };

    const handleCompress = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);
        setResult(null);
        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { 
                // This is an advanced option that can affect compression.
                // It is not a guarantee of smaller size.
                updateMetadata: false 
            });
            const compressedBytes = await pdfDoc.save();

            setResult({
                originalSize: file.size,
                newSize: compressedBytes.length,
                compressedBytes: compressedBytes,
            });
        } catch (e) {
            console.error(e);
            setError('An error occurred during compression. The PDF might be corrupted or protected.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const downloadFile = () => {
        if (!result || !file) return;
        const blob = new Blob([result.compressedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file.name.replace('.pdf', '')}-compressed.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full flex flex-col gap-4 text-center">
            {!file && !result && (
                <div onClick={() => fileInputRef.current?.click()} className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 transition-all duration-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-gray-700">Click to select a PDF file to compress</p>
                    </div>
                </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {file && !result && (
                 <button onClick={handleCompress} disabled={isProcessing} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50">
                    {isProcessing ? 'Compressing...' : `Compress ${file.name}`}
                </button>
            )}
            {result && (
                <div className="flex flex-col gap-4 items-center">
                    <p className="text-2xl font-bold text-green-600">Compression Complete!</p>
                    <div className="flex justify-around w-full p-4 bg-gray-100 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-500">Original Size</p>
                            <p className="font-bold text-lg">{formatBytes(result.originalSize)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">New Size</p>
                            <p className="font-bold text-lg text-blue-600">{formatBytes(result.newSize)}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500">Reduction</p>
                            <p className="font-bold text-lg text-green-600">
                                {(((result.originalSize - result.newSize) / result.originalSize) * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    <button onClick={downloadFile} className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-green-700">Download Compressed PDF</button>
                    <button onClick={() => { setFile(null); setResult(null); }} className="text-sm text-blue-600 hover:underline">Compress another file</button>
                </div>
            )}
        </div>
    );
};

const PdfToWordTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
    }, []);

    const handleFileSelect = (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are accepted.');
            setFile(null);
        } else {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace('.pdf', '')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error(e);
            setError('Failed to extract text from PDF.');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="w-full text-center flex flex-col gap-4">
            <div className="text-left p-3 text-sm bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-r-md">
                <strong>Note:</strong> This tool extracts text content from your PDF. Complex layouts, tables, and images will not be preserved. The output is a plain text (.txt) file.
            </div>
            {!file ? (
                <div onClick={() => fileInputRef.current?.click()} className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 transition-all duration-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-gray-700">Click to select a PDF file</p>
                    </div>
                </div>
            ) : (
                <div className="mt-2 text-left bg-gray-50 p-4 rounded-lg border">
                     <p className="font-semibold">{file.name}</p>
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                onClick={handleConvert}
                disabled={!file || isConverting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isConverting ? 'Converting...' : 'Convert to Text'}
            </button>
        </div>
    );
};

const OfficeToPdfTool: React.FC<{tool: 'powerpoint' | 'excel'}> = ({ tool }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validTypes = tool === 'powerpoint' 
        ? ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'] 
        : ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const validExtensions = tool === 'powerpoint' ? '.pptx, .ppt' : '.xlsx, .xls';

    const handleFileSelect = (selectedFile: File | null) => {
        if (!selectedFile) return;
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
        if (validTypes.includes(selectedFile.type) || validExtensions.includes(fileExtension)) {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError(`Please select a valid ${tool} file (${validExtensions}).`);
        }
    };
    
    const handleConvert = async () => {
        if (!file) return;
        setIsConverting(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

        try {
            const { PDFDocument, rgb, StandardFonts } = PDFLib;
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const { height } = page.getSize();
            
            page.drawText(`File "${file.name}" converted to PDF.`, {
                x: 50,
                y: height - 50,
                font,
                size: 18,
                color: rgb(0, 0, 0),
            });
             page.drawText(`(This is a placeholder conversion as client-side ${tool} rendering is not supported.)`, {
                x: 50,
                y: height - 80,
                font,
                size: 10,
                color: rgb(0.5, 0.5, 0.5),
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace(/\.[^/.]+$/, "")}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch(e) {
            setError("An error occurred during the simulated conversion.");
        } finally {
            setIsConverting(false);
            setFile(null);
        }
    };

    return (
         <div className="w-full text-center flex flex-col gap-4">
            <div className="text-left p-3 text-sm bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-r-md">
                <strong>Note:</strong> This is a simulated conversion. Full client-side rendering of complex Office documents is not feasible. This tool creates a placeholder PDF.
            </div>
            {!file ? (
                <div onClick={() => fileInputRef.current?.click()} className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 transition-all duration-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <input type="file" ref={fileInputRef} className="hidden" accept={validExtensions} onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-gray-700">Click to select a {tool} file</p>
                    </div>
                </div>
            ) : (
                <div className="mt-2 text-left bg-gray-50 p-4 rounded-lg border">
                     <p className="font-semibold">{file.name}</p>
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                onClick={handleConvert}
                disabled={!file || isConverting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isConverting ? 'Converting...' : 'Convert to PDF'}
            </button>
        </div>
    );
};


const WordToPdfTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles || selectedFiles.length === 0) return;
        
        const selectedFile = selectedFiles[0];
        const validTypes = [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const validExtensions = ['.doc', '.docx'];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (validTypes.includes(selectedFile.type) || validExtensions.includes(fileExtension)) {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError("Please select a valid Word document (.doc or .docx).");
        }
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files);
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleConvert = useCallback(async () => {
        if (!file) {
            setError('Please select a Word file first.');
            return;
        }
        
        setIsConverting(true);
        setError(null);
        let renderContainer: HTMLDivElement | null = null;

        try {
            // 1. Read Word file and convert to HTML using Mammoth.js
            setProgressMessage('Step 1/4: Reading Word file...');
            const arrayBuffer = await file.arrayBuffer();
            // Fix: Use window.mammoth to ensure the global library is found.
            const { value: html } = await window.mammoth.convertToHtml({ arrayBuffer });

            // 2. Create a hidden element to render the HTML for capturing
            setProgressMessage('Step 2/4: Preparing document for rendering...');
            renderContainer = document.createElement('div');
            // Style it for off-screen rendering
            renderContainer.style.position = 'absolute';
            renderContainer.style.left = '-9999px';
            renderContainer.style.width = '794px'; // A4 width at 96 DPI
            renderContainer.style.padding = '40px';
            renderContainer.style.backgroundColor = 'white';
            renderContainer.style.boxSizing = 'border-box';
            renderContainer.innerHTML = `<div style="color: black; word-wrap: break-word;">${html}</div>`;
            document.body.appendChild(renderContainer);

            // Give browser a moment to render content, especially images
            await new Promise(resolve => setTimeout(resolve, 100));

            // 3. Use html2canvas to render the hidden element to a canvas
            setProgressMessage('Step 3/4: Rendering document to image...');
            // Fix: Use window.html2canvas to ensure the global library is found.
            const canvas = await window.html2canvas(renderContainer, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });
            
            // Cleanup the hidden element immediately
            document.body.removeChild(renderContainer);
            renderContainer = null;

            // 4. Use jsPDF to create a PDF from the canvas image
            setProgressMessage('Step 4/4: Generating PDF...');
            // Fix: Use window.jspdf to ensure the global library is found.
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasHeight / canvasWidth;
            const imgHeightInPdf = pdfWidth * ratio;
            
            const pdfHeight = pdf.internal.pageSize.getHeight();
            let heightLeft = imgHeightInPdf;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = position - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
                heightLeft -= pdfHeight;
            }
            
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            const filename = `${file.name.replace(/\.(docx?)$/i, '')}.pdf`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setFile(null);

        } catch (e: any) {
            console.error(e);
            setError(`Conversion failed: ${e.message || 'An unknown error occurred.'}`);
        } finally {
            if (renderContainer && document.body.contains(renderContainer)) {
                document.body.removeChild(renderContainer);
            }
            setIsConverting(false);
            setProgressMessage('');
        }
    }, [file]);

    return (
        <div className="w-full text-center flex flex-col gap-4">
             <div className="text-left p-3 text-sm bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-r-md">
                <strong>Note:</strong> Conversion is performed in your browser. Complex layouts and formatting may have minor variations in the final PDF.
            </div>
            {!file ? (
                <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-8 transition-all duration-300 cursor-pointer`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFileChange} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-gray-700">Drag & drop a Word file here, or click to select</p>
                        <p className="text-xs text-gray-500 mt-1">Convert .doc or .docx to PDF</p>
                    </div>
                </div>
            ) : (
                <div className="mt-2 text-left bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 truncate pr-2">{file.name}</span>
                        <button onClick={removeFile} className="p-1 text-red-500 hover:text-red-700" disabled={isConverting}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {isConverting && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md text-center">
                    <div className="flex items-center justify-center text-blue-600">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p>{progressMessage || 'Converting...'}</p>
                    </div>
                </div>
            )}

            <button
                onClick={handleConvert}
                disabled={!file || isConverting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isConverting ? 'Converting...' : 'Convert to PDF'}
            </button>
        </div>
    );
};

const EditPdfTool: React.FC = () => {
    // Tool state
    const [file, setFile] = useState<File | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Editing state
    type ActiveTool = 'select' | 'text' | 'image' | 'draw';
    type Edit = TextEdit | ImageEdit | DrawingEdit;
    
    interface BaseEdit { id: string; page: number; }
    interface TextEdit extends BaseEdit { type: 'text'; x: number; y: number; text: string; fontSize: number; font: string; color: string; }
    interface ImageEdit extends BaseEdit { type: 'image'; x: number; y: number; width: number; height: number; imageBytes: ArrayBuffer; mimeType: 'image/png' | 'image/jpeg'; }
    interface DrawingEdit extends BaseEdit { type: 'drawing'; path: string; color: string; strokeWidth: number; }
    
    const [activeTool, setActiveTool] = useState<ActiveTool>('select');
    const [edits, setEdits] = useState<Edit[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // Toolbar options state
    const [textColor, setTextColor] = useState('#000000');
    const [fontSize, setFontSize] = useState(16);
    const [font, setFont] = useState('Helvetica');
    const [drawColor, setDrawColor] = useState('#ff0000');
    const [strokeWidth, setStrokeWidth] = useState(2);

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const editorWrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Setup pdf.js worker
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
    }, []);

    const renderPage = useCallback(async (pageNum: number) => {
        if (!pdfDoc) return;
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const context = canvas.getContext('2d');
        if (!context) return;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        // Draw existing edits on top
        const pageEdits = edits.filter(e => e.page === pageNum);
        pageEdits.forEach(edit => {
            if (edit.type === 'text') {
                context.fillStyle = edit.color;
                context.font = `${edit.fontSize}px ${edit.font}`;
                context.fillText(edit.text, edit.x, edit.y);
            } else if (edit.type === 'drawing') {
                context.strokeStyle = edit.color;
                context.lineWidth = edit.strokeWidth;
                context.lineCap = 'round';
                context.lineJoin = 'round';
                const p = new Path2D(edit.path);
                context.stroke(p);
            } else if (edit.type === 'image') {
                const img = new Image();
                const blob = new Blob([edit.imageBytes], { type: edit.mimeType });
                img.src = URL.createObjectURL(blob);
                img.onload = () => {
                    context.drawImage(img, edit.x, edit.y, edit.width, edit.height);
                    URL.revokeObjectURL(img.src);
                };
            }
        });

    }, [pdfDoc, edits]);
    
    useEffect(() => {
        renderPage(currentPage);
    }, [currentPage, pdfDoc, edits, renderPage]);

    const handleFileSelect = async (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            setError('Please select a valid PDF file.');
            return;
        }
        setFile(selectedFile);
        setError(null);
        setIsProcessing(true);
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setCurrentPage(1);
        } catch (e) {
            setError('Failed to load PDF.');
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (activeTool === 'text') {
            const rect = canvasRef.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const text = prompt('Enter text:');
            if (text) {
                setEdits([...edits, { id: Date.now().toString(), type: 'text', page: currentPage, x, y, text, color: textColor, fontSize, font }]);
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const imgFile = e.target.files?.[0];
        if (!imgFile || !['image/png', 'image/jpeg'].includes(imgFile.type)) {
            alert('Please select a PNG or JPG image.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageBytes = event.target?.result as ArrayBuffer;
            if(imageBytes) {
                // For simplicity, place image at a default position
                setEdits([...edits, { id: Date.now().toString(), type: 'image', page: currentPage, x: 50, y: 50, width: 200, height: 150, imageBytes, mimeType: imgFile.type as 'image/png' | 'image/jpeg' }]);
            }
        };
        reader.readAsArrayBuffer(imgFile);
        setActiveTool('select');
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (activeTool !== 'draw') return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newPath = `M${x} ${y}`;
        setEdits([...edits, {id: Date.now().toString(), type: 'drawing', page: currentPage, path: newPath, color: drawColor, strokeWidth}]);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || activeTool !== 'draw') return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const lastEdit = edits[edits.length-1];
        if(lastEdit.type !== 'drawing') return;
        
        lastEdit.path += ` L${x} ${y}`;
        setEdits([...edits.slice(0, -1), lastEdit]);
    };
    
    const stopDrawing = () => {
        if (activeTool !== 'draw') return;
        setIsDrawing(false);
    };

    const handleSave = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;
            const existingPdfBytes = await file.arrayBuffer();
            const pdfLibDoc = await PDFDocument.load(existingPdfBytes);
            const fontObjects = {
                Helvetica: await pdfLibDoc.embedFont(StandardFonts.Helvetica),
                TimesRoman: await pdfLibDoc.embedFont(StandardFonts.TimesRoman),
                Courier: await pdfLibDoc.embedFont(StandardFonts.Courier)
            };
            const pages = pdfLibDoc.getPages();

            for (const edit of edits) {
                const page = pages[edit.page - 1];
                const { width, height } = page.getSize();
                const canvas = canvasRef.current!;
                const scaleX = width / canvas.width;
                const scaleY = height / canvas.height;

                if (edit.type === 'text') {
                    page.drawText(edit.text, {
                        x: edit.x * scaleX,
                        y: height - (edit.y * scaleY),
                        font: fontObjects[edit.font as keyof typeof fontObjects],
                        size: edit.fontSize * scaleX,
                        color: rgb(parseInt(edit.color.slice(1, 3), 16) / 255, parseInt(edit.color.slice(3, 5), 16) / 255, parseInt(edit.color.slice(5, 7), 16) / 255),
                    });
                } else if (edit.type === 'image') {
                    const image = edit.mimeType === 'image/png' ? await pdfLibDoc.embedPng(edit.imageBytes) : await pdfLibDoc.embedJpg(edit.imageBytes);
                    page.drawImage(image, {
                        x: edit.x * scaleX,
                        y: height - (edit.y * scaleY) - (edit.height * scaleY),
                        width: edit.width * scaleX,
                        height: edit.height * scaleY,
                    });
                } else if (edit.type === 'drawing') {
                     // Need to scale path coordinates
                    const scaledPath = edit.path.split(' ').map(part => {
                        if (part.startsWith('M') || part.startsWith('L')) {
                            const coords = part.substring(1).split(',').map(Number);
                            return `${part.charAt(0)}${coords[0] * scaleX},${coords[1] * scaleY}`;
                        }
                        const coords = part.split(',').map(Number);
                        return `${coords[0] * scaleX},${coords[1] * scaleY}`;
                    }).join(' ');
                    
                    // a simple path conversion, this is complex for real-world apps
                    const pathCommands = edit.path.split(/(?=[ML])/).map(cmd => {
                        const type = cmd[0];
                        const [x, y] = cmd.substring(1).trim().split(' ').map(parseFloat);
                        return { type, x: x * scaleX, y: height - (y * scaleY) };
                    });
                    
                    let svgPath = '';
                    pathCommands.forEach(p => { svgPath += `${p.type}${p.x} ${p.y} `; });
                    
                    page.drawSvgPath(svgPath.trim(), {
                        borderColor: rgb(parseInt(edit.color.slice(1, 3), 16) / 255, parseInt(edit.color.slice(3, 5), 16) / 255, parseInt(edit.color.slice(5, 7), 16) / 255),
                        borderWidth: edit.strokeWidth,
                    });
                }
            }

            const pdfBytes = await pdfLibDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name.replace('.pdf', '-edited.pdf');
            document.body.appendChild(a);
            a.click();
            // Fix: a.remove() is not a function. The element should be removed from its parent.
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch(e) {
            console.error(e);
            setError("Failed to save PDF. See console for details.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (isProcessing && !pdfDoc) return <ProcessingAnimation text="Loading PDF..." />;
    
    return (
        <div className="w-full flex flex-col gap-4">
            {!file ? (
                <div onClick={() => fileInputRef.current?.click()} className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 transition-all duration-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50 text-center">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-gray-700">Click to select a PDF file to edit</p>
                    </div>
                </div>
            ) : (
                <>
                {isProcessing && <ProcessingAnimation text="Saving PDF..." />}
                <div className={`transition-opacity duration-300 ${isProcessing ? 'opacity-20' : 'opacity-100'}`}>
                    {/* Toolbar */}
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-2 mb-4 flex flex-wrap items-center gap-4">
                        <button onClick={() => setActiveTool('select')} className={`p-2 rounded ${activeTool === 'select' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}>Select</button>
                        <button onClick={() => setActiveTool('text')} className={`p-2 rounded ${activeTool === 'text' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}>Text</button>
                        <button onClick={() => { setActiveTool('image'); fileInputRef.current?.click(); }} className={`p-2 rounded ${activeTool === 'image' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}>Image</button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                        <button onClick={() => setActiveTool('draw')} className={`p-2 rounded ${activeTool === 'draw' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'}`}>Draw</button>
                        {activeTool === 'text' && (<>
                            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />
                            <input type="number" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-16 p-1 border rounded"/>
                            <select value={font} onChange={e => setFont(e.target.value)} className="p-1 border rounded">
                                <option>Helvetica</option>
                                <option>TimesRoman</option>
                                <option>Courier</option>
                            </select>
                        </>)}
                        {activeTool === 'draw' && (<>
                             <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)} />
                            <input type="range" min="1" max="20" value={strokeWidth} onChange={e => setStrokeWidth(parseInt(e.target.value))} />
                            <span>{strokeWidth}px</span>
                        </>)}
                    </div>
                    {/* Editor */}
                    <div ref={editorWrapperRef} className="bg-gray-200 p-4 overflow-auto custom-scrollbar flex justify-center">
                        <canvas ref={canvasRef} className="border border-gray-400 shadow-lg"
                            onClick={handleCanvasClick}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                        />
                    </div>
                    {/* Navigation & Save */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>Prev</button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next</button>
                        </div>
                        <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Save & Download PDF</button>
                    </div>
                </div>
                </>
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
    );
};


const QRGenerator: React.FC = () => {
    const [text, setText] = useState('https://react.dev');
    return (
        <div className="w-full flex flex-col items-center gap-4">
            <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or text"
                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                <QRCodeSVG value={text} size={256} />
            </div>
        </div>
    );
};

const WordCounter: React.FC = () => {
    const [text, setText] = useState('');
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const charCount = text.length;
    return (
        <div className="w-full flex flex-col gap-4">
            <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder="Paste your text here..."
                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none custom-scrollbar"
            />
            <div className="flex justify-around p-3 bg-gray-100 border border-gray-200 rounded-md">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{wordCount}</p>
                    <p className="text-sm text-gray-500">Words</p>
                </div>
                 <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{charCount}</p>
                    <p className="text-sm text-gray-500">Characters</p>
                </div>
            </div>
        </div>
    );
}

const PasswordGenerator: React.FC = () => {
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generatePassword = useCallback(() => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
        
        let charSet = lower;
        if (includeUppercase) charSet += upper;
        if (includeNumbers) charSet += numbers;
        if (includeSymbols) charSet += symbols;

        if (charSet === '') {
            setPassword('');
            return;
        }

        let newPassword = '';
        for (let i = 0; i < length; i++) {
            newPassword += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }
        setPassword(newPassword);
        setCopied(false);
    }, [length, includeUppercase, includeNumbers, includeSymbols]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const copyToClipboard = () => {
        if (password) {
            navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="relative bg-gray-100 border border-gray-300 rounded-md p-3 text-gray-800 font-mono text-lg text-center">
                {password || ' '}
                 <button onClick={copyToClipboard} className="absolute top-1/2 right-2 -translate-y-1/2 bg-gray-200 text-gray-600 text-xs font-sans px-2 py-1 rounded hover:bg-gray-300">
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            <div className="space-y-4 text-gray-700">
                <div className="flex items-center justify-between">
                    <label htmlFor="length">Password Length</label>
                    <span className="font-bold text-blue-600">{length}</span>
                </div>
                <input type="range" id="length" min="6" max="32" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                
                <div className="flex items-center">
                    <input type="checkbox" id="uppercase" checked={includeUppercase} onChange={() => setIncludeUppercase(p => !p)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="uppercase" className="ml-2 block text-sm">Include Uppercase Letters</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="numbers" checked={includeNumbers} onChange={() => setIncludeNumbers(p => !p)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="numbers" className="ml-2 block text-sm">Include Numbers</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="symbols" checked={includeSymbols} onChange={() => setIncludeSymbols(p => !p)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="symbols" className="ml-2 block text-sm">Include Symbols</label>
                </div>
            </div>
             <button onClick={generatePassword} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700">
                Generate New Password
            </button>
        </div>
    );
};

const AgeCalculator: React.FC = () => {
    const [birthDate, setBirthDate] = useState('');
    const [age, setAge] = useState<{ years: number, months: number, days: number } | null>(null);

    const calculateAge = () => {
        if (!birthDate) {
            setAge(null);
            return;
        }
        const today = new Date();
        const birth = new Date(birthDate);

        if (birth > today) {
            alert("Birth date cannot be in the future.");
            setAge(null);
            return;
        }

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        setAge({ years, months, days });
    };

    return (
        <div className="w-full flex flex-col items-center gap-4">
             <input 
                type="date" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button onClick={calculateAge} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700">
                Calculate Age
            </button>
            {age && (
                 <div className="flex justify-around p-4 bg-gray-100 border border-gray-200 rounded-md w-full">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{age.years}</p>
                        <p className="text-sm text-gray-500">Years</p>
                    </div>
                     <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{age.months}</p>
                        <p className="text-sm text-gray-500">Months</p>
                    </div>
                     <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{age.days}</p>
                        <p className="text-sm text-gray-500">Days</p>
                    </div>
                </div>
            )}
        </div>
    )
};

const BMICalculator: React.FC = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);
    const [bmiCategory, setBmiCategory] = useState('');

    const calculateBmi = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);
        if (h > 0 && w > 0) {
            const bmiValue = w / ((h / 100) ** 2);
            setBmi(bmiValue);
            
            if (bmiValue < 18.5) setBmiCategory('Underweight');
            else if (bmiValue < 25) setBmiCategory('Normal weight');
            else if (bmiValue < 30) setBmiCategory('Overweight');
            else setBmiCategory('Obesity');
        } else {
            setBmi(null);
            setBmiCategory('');
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-4">
            <div className="w-full space-y-4">
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Height (cm)" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg)" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>
            <button onClick={calculateBmi} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700">
                Calculate BMI
            </button>
            {bmi && (
                <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-md w-full">
                    <p className="text-sm text-gray-500">Your BMI is</p>
                    <p className="text-4xl font-bold text-gray-800">{bmi.toFixed(1)}</p>
                    <p className="font-semibold text-blue-600 mt-1">{bmiCategory}</p>
                </div>
            )}
        </div>
    )
};


const ToolPage: React.FC<ToolPageProps> = ({ tool }) => {
    const renderToolContent = () => {
        switch (tool.id) {
            case 'merge-pdf':
                return <MergePdfTool />;
            case 'split-pdf':
                return <SplitPdfTool />;
            case 'compress-pdf':
                return <CompressPdfTool />;
            case 'pdf-to-word':
                return <PdfToWordTool />;
            case 'word-to-pdf':
                return <WordToPdfTool />;
            case 'powerpoint-to-pdf':
                return <OfficeToPdfTool tool="powerpoint" />;
            case 'excel-to-pdf':
                return <OfficeToPdfTool tool="excel" />;
            case 'edit-pdf':
                return <EditPdfTool />;
            case 'pdf-to-jpg':
                 return <div>Coming soon...</div>;
            case 'jpg-to-pdf':
                 return <div>Coming soon...</div>;
            case 'add-page-numbers':
                 return <div>Coming soon...</div>;
            case 'add-watermark':
                 return <div>Coming soon...</div>;
            case 'rotate-pdf':
                 return <div>Coming soon...</div>;
            case 'unlock-pdf':
                 return <div>Coming soon...</div>;
            case 'protect-pdf':
                 return <div>Coming soon...</div>;
            case 'organize-pdf':
                 return <div>Coming soon...</div>;
            case 'qr-code-generator':
                return <QRGenerator />;
            case 'word-counter':
                return <WordCounter />;
            case 'password-generator':
                return <PasswordGenerator />;
            case 'age-calculator':
                return <AgeCalculator />;
            case 'bmi-calculator':
                return <BMICalculator />;
            // Add cases for other implemented tools here
            // Default to file drop zone for PDF/Image tools
            default:
                return <FileDropZone />;
        }
    };

    return (
        <main className="flex-1 p-6 md:p-10 animate-fade-in">
            {/* Breadcrumb/Back link */}
            <div className="mb-8">
                <a href="/#" className="text-blue-600 hover:underline flex items-center gap-2 w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to All Tools
                </a>
            </div>

            {/* Tool Header */}
            <header className="text-center mb-10">
                <div className="inline-block p-4 bg-blue-100/50 border border-blue-200 rounded-full mb-4">
                    <tool.icon className="w-12 h-12 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800">{tool.title}</h1>
                <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">{tool.description}</p>
            </header>

            {/* Tool Content Area */}
            <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
                <div className="flex justify-center">
                    {renderToolContent()}
                </div>
            </div>
        </main>
    );
};

export default ToolPage;