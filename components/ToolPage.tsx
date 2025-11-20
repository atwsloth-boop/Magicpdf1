
import React, { useState, useRef } from 'react';
import { Tool } from '../types';
import { UploadIcon } from './icons/ToolIcons';

// Inform TypeScript about the global objects from the CDN scripts
declare const PDFLib: any;
declare const JSZip: any;
declare const pdfjsLib: any;

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
}

interface ToolPageProps {
  tool: Tool;
}

// --- Reusable Styled Components for Light Theme ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm";
    let variantStyle = "";
    
    switch(variant) {
        case 'primary':
            variantStyle = "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md";
            break;
        case 'secondary':
            variantStyle = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900";
            break;
        case 'danger':
            variantStyle = "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700";
            break;
    }

    return (
        <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm ${className}`}>
        {children}
    </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input 
        {...props} 
        className={`w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${props.className || ''}`} 
    />
);

// --- Helper & Generic Components ---

const ProcessingAnimation: React.FC<{ text?: string }> = ({ text = "Processing..." }) => (
    <div className="flex flex-col items-center justify-center gap-6 text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div>
            <p className="text-lg font-bold text-gray-800">{text}</p>
            <p className="text-sm text-gray-500 mt-1">This usually takes a few seconds.</p>
        </div>
    </div>
);

const ComingSoon: React.FC = () => (
    <Card className="text-center py-16 bg-gray-50">
        <div className="text-4xl mb-4">🚧</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">Coming Soon</h3>
        <p className="text-gray-500">We are working hard to bring this tool to life.</p>
    </Card>
);

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

// --- Tool Implementations ---

const CompressPdfTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ originalSize: number; newSize: number; compressedBytes: Uint8Array } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

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
            const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
            const compressedBytes = await pdfDoc.save();

            setResult({
                originalSize: file.size,
                newSize: compressedBytes.length,
                compressedBytes: compressedBytes,
            });
        } catch (e) {
            console.error(e);
            setError('Error: Compression failed. The file might be encrypted.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (isProcessing) return <ProcessingAnimation text="Optimizing PDF..." />;

    if (result) {
        return (
            <div className="w-full flex flex-col gap-6 items-center text-center max-w-2xl mx-auto">
                <div className="bg-green-50 text-green-800 px-6 py-3 rounded-full font-semibold text-sm border border-green-200 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    PDF Successfully Compressed
                </div>
                <Card className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        <div className="text-center p-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Original</p>
                            <p className="font-bold text-xl text-gray-800 mt-1">{formatBytes(result.originalSize)}</p>
                        </div>
                        <div className="text-center p-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Compressed</p>
                            <p className="font-bold text-xl text-blue-600 mt-1">{formatBytes(result.newSize)}</p>
                        </div>
                        <div className="text-center p-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Savings</p>
                            <p className="font-bold text-xl text-green-600 mt-1">
                                {result.originalSize > 0 ? (((result.originalSize - result.newSize) / result.originalSize) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>
                </Card>
                <Button onClick={() => downloadFile(result.compressedBytes, 'application/pdf', `${file?.name.replace('.pdf', '')}-compressed.pdf`)} className="w-full text-lg">
                    Download Compressed PDF
                </Button>
                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-blue-600 hover:underline">
                    Compress another PDF
                </button>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col gap-6 text-center max-w-2xl mx-auto">
            {!file ? (
                <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files?.[0] || null); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'} rounded-xl p-12 transition-all duration-200 cursor-pointer group`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <div className="p-4 rounded-full bg-blue-50 mb-4 group-hover:bg-blue-100 transition-colors">
                            <UploadIcon className={`w-8 h-8 text-blue-600`} />
                        </div>
                        <p className="text-gray-900 font-bold text-xl mb-2">Select PDF file</p>
                        <p className="text-gray-500">or drop PDF here</p>
                    </div>
                </div>
            ) : (
                <Card className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-red-100 p-2 rounded text-red-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="font-medium text-gray-700 truncate">{file.name}</span>
                    </div>
                    <button onClick={handleReset} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </Card>
            )}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}
            {file && (
                 <Button onClick={handleCompress} disabled={isProcessing} className="w-full text-lg shadow-md">
                    Compress PDF
                </Button>
            )}
        </div>
    );
};

const SplitPdfTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'extract' | 'split'>('extract');
    const [pageRange, setPageRange] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileSelect = async (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are accepted.');
            setFile(null);
            setTotalPages(0);
            return;
        }
        setError(null);
        setIsProcessing(true);
        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            setTotalPages(pdfDoc.getPageCount());
            setFile(selectedFile);
        } catch (e) {
            setError('Could not read PDF. File corrupted or password protected.');
            setFile(null);
            setTotalPages(0);
        } finally {
            setIsProcessing(false);
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
                if (!pagesToExtract || pagesToExtract.length === 0) {
                    setError('Invalid page range. Use format like: 1, 3-5, 8.');
                    setIsProcessing(false);
                    return;
                }
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(pdfDoc, pagesToExtract.map(p => p - 1));
                copiedPages.forEach(page => newPdf.addPage(page));
                const pdfBytes = await newPdf.save();
                downloadFile(pdfBytes, 'application/pdf', `${file.name.replace('.pdf', '')}-extracted.pdf`);
            } else { 
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

    const parsePageRange = (rangeStr: string, max: number): number[] | null => {
        const result: Set<number> = new Set();
        if (!rangeStr.trim()) return [];
        const parts = rangeStr.split(',');
        for (const part of parts) {
            const trimmedPart = part.trim();
            if (trimmedPart.includes('-')) {
                const [start, end] = trimmedPart.split('-').map(s => parseInt(s.trim()));
                if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > max) return null;
                for (let i = start; i <= end; i++) result.add(i);
            } else {
                const num = parseInt(trimmedPart);
                if (isNaN(num) || num < 1 || num > max) return null;
                result.add(num);
            }
        }
        return Array.from(result).sort((a, b) => a - b);
    };

    if (isProcessing && !file) return <ProcessingAnimation text="Analyzing PDF..." />;

    return (
        <div className="w-full flex flex-col gap-6 max-w-2xl mx-auto">
            {!file ? (
                 <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files?.[0] || null); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'} rounded-xl p-12 transition-all duration-200 cursor-pointer group text-center`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <div className="p-4 rounded-full bg-blue-50 mb-4 group-hover:bg-blue-100 transition-colors">
                            <UploadIcon className={`w-8 h-8 text-blue-600`} />
                        </div>
                        <p className="text-gray-900 font-bold text-xl mb-2">Select PDF file</p>
                        <p className="text-gray-500">or drop PDF here</p>
                    </div>
                </div>
            ) : (
                <>
                    <Card className="text-center border-blue-200 bg-blue-50/50">
                         <div className="flex items-center justify-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <p className="font-semibold text-gray-800">{file.name}</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{totalPages} Pages Detected</p>
                        <button onClick={() => { setFile(null); setTotalPages(0); }} className="text-sm text-blue-600 hover:underline">
                            Change File
                        </button>
                    </Card>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setMode('extract')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'extract' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Extract Pages</button>
                        <button onClick={() => setMode('split')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Split All</button>
                    </div>
                    
                    {mode === 'extract' ? (
                        <div className="flex flex-col gap-2">
                            <label htmlFor="pageRange" className="text-sm font-bold text-gray-700">Pages to extract</label>
                            <Input
                                id="pageRange"
                                type="text"
                                value={pageRange}
                                onChange={(e) => setPageRange(e.target.value)}
                                placeholder="Example: 1, 3-5, 8"
                            />
                            <p className="text-xs text-gray-500">Enter page numbers or ranges separated by commas.</p>
                        </div>
                    ) : (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center text-sm text-blue-800">
                            This will convert every page of this PDF into a separate file and download them as a ZIP archive.
                        </div>
                    )}
                    <Button onClick={handleProcess} disabled={isProcessing} className="w-full text-lg shadow-md">
                        {isProcessing ? 'Processing...' : 'Split PDF'}
                    </Button>
                </>
            )}
             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
    );
};

const PdfToWordTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileSelect = (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are accepted.');
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setError(null);
    };

    const handleConvert = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            let htmlBody = '';
            // Simple text extraction for demo
            for (let i = 0; i < pdf.numPages; i++) {
                const page = await pdf.getPage(i + 1);
                const textContent = await page.getTextContent();
                const strings = textContent.items.map((item: any) => item.str);
                htmlBody += `<p>${strings.join(' ')}</p><br/>`;
            }

            const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>MagicPDF Conversion</title></head><body>`;
            const footer = "</body></html>";
            const sourceHTML = header + htmlBody + footer;
            
            downloadFile(new Blob([sourceHTML], { type: 'application/msword' }), 'application/msword', `${file.name.replace('.pdf', '')}.doc`);

        } catch (e: any) {
            setError('Conversion failed. PDF might be protected or complex.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isProcessing) return <ProcessingAnimation text="Converting..." />;

    return (
        <div className="w-full flex flex-col gap-6 text-center max-w-2xl mx-auto">
            {!file ? (
                <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files?.[0] || null); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'} rounded-xl p-12 transition-all duration-200 cursor-pointer group`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <div className="p-4 rounded-full bg-blue-50 mb-4 group-hover:bg-blue-100 transition-colors">
                             <UploadIcon className={`w-8 h-8 text-blue-600`} />
                        </div>
                        <p className="text-gray-900 font-bold text-xl mb-2">Select PDF file</p>
                        <p className="text-gray-500">or drop PDF here</p>
                    </div>
                </div>
            ) : (
                <Card className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 truncate">{file.name}</span>
                    <button onClick={() => setFile(null)} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                </Card>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button onClick={handleConvert} disabled={!file} className="w-full text-lg shadow-md">
                Convert to Word
            </Button>
        </div>
    );
};

// Main Tool Page Component
const ToolPage: React.FC<ToolPageProps> = ({ tool }) => {
  const renderToolContent = () => {
    switch (tool.id) {
      case 'merge-pdf': return <ComingSoon />; 
      case 'split-pdf': return <SplitPdfTool />;
      case 'compress-pdf': return <CompressPdfTool />;
      case 'pdf-to-word': return <PdfToWordTool />;
      default: return <ComingSoon />;
    }
  };

  return (
    <div className="min-h-full p-4 md:p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{tool.title}</h1>
                <p className="max-w-2xl mx-auto text-lg text-gray-600">{tool.description}</p>
            </header>
            
            {/* Main Interface Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 min-h-[400px] flex items-center justify-center">
                {renderToolContent()}
            </div>

            {/* SEO Content Area - "Separate Page" feel */}
            <div className="mt-12 prose prose-blue max-w-none text-gray-600">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">How to use {tool.title}</h2>
                <ol className="list-decimal list-inside space-y-2 mb-8">
                    <li>Select your file from the upload area above.</li>
                    <li>Wait for the file to be processed securely in your browser.</li>
                    <li>Adjust any settings if available for the specific tool.</li>
                    <li>Click the action button to download your result.</li>
                </ol>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Secure & Private</h2>
                <p>
                    MagicPDF operates differently from other online PDF tools. We don't upload your files to a remote server for processing. 
                    Instead, we use advanced browser technologies to process your files directly on your device. This guarantees 
                    that your documents never leave your computer and remain 100% private.
                </p>
            </div>
        </div>
    </div>
  );
};

export default ToolPage;
