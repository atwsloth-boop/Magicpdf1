import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tool } from '../types';
import { UploadIcon } from './icons/ToolIcons';

// Inform TypeScript about the global objects from the CDN scripts
declare const PDFLib: any;
declare const JSZip: any;
declare const pdfjsLib: any;
declare const mammoth: any;
declare const jspdf: any;
declare const html2canvas: any;

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
}

interface ToolPageProps {
  tool: Tool;
}

// Helper & Generic Components

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

const ComingSoon: React.FC = () => (
    <div className="text-center p-10 bg-gray-100 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-700 mb-2">Tool Coming Soon!</h3>
        <p className="text-gray-500">We're working hard to bring this feature to you.</p>
    </div>
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
            const yThreshold = 2; // Tolerance for items on the same line
            const paraThresholdMultiplier = 1.5; // If space is > 1.5 * line height, it's a new para

            for (let i = 0; i < pdf.numPages; i++) {
                const page = await pdf.getPage(i + 1);
                const textContent = await page.getTextContent();
                
                if (textContent.items.length === 0) continue;

                // Sort items vertically, then horizontally
                const sortedItems = textContent.items.slice().sort((a: any, b: any) => {
                    if (Math.abs(a.transform[5] - b.transform[5]) > yThreshold) {
                        return b.transform[5] - a.transform[5]; // Y descending (top to bottom)
                    }
                    return a.transform[4] - b.transform[4]; // X ascending (left to right)
                });
                
                let currentParagraph = '';
                let lastY = -1;
                let lastHeight = -1;

                for (const item of sortedItems) {
                    const currentY = item.transform[5];
                    const itemHeight = item.height;

                    if (lastY !== -1) {
                        if (currentY < lastY - (lastHeight * paraThresholdMultiplier)) {
                            htmlBody += `<p>${currentParagraph.trim().replace(/\s+/g, ' ')}</p>`;
                            currentParagraph = '';
                        } 
                    }

                    currentParagraph += item.str + ' ';
                    lastY = currentY;
                    lastHeight = itemHeight > lastHeight ? itemHeight : lastHeight;
                }
                
                htmlBody += `<p>${currentParagraph.trim().replace(/\s+/g, ' ')}</p>`;
                
                if (i < pdf.numPages - 1) {
                    htmlBody += '<br style="page-break-after:always;"></br>';
                }
            }

            const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Magic PDF Conversion</title></head><body>`;
            const footer = "</body></html>";
            const sourceHTML = header + htmlBody + footer;
            
            downloadFile(new Blob([sourceHTML], { type: 'application/msword' }), 'application/msword', `${file.name.replace('.pdf', '')}.doc`);

        } catch (e: any) {
            console.error(e);
            if (e.name === 'PasswordException') {
                setError('Could not convert. The PDF file is password-protected.');
            } else {
                setError('An error occurred while converting the PDF. It may be corrupted.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 text-center">
            {isProcessing ? (
                <ProcessingAnimation text="Converting PDF to Word..." />
            ) : (
                <>
                    {!file ? (
                        <div
                            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files?.[0] || null); }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                            <div className="flex flex-col items-center">
                                <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-gray-700 font-semibold">Drag & drop a PDF here</p>
                                <p className="text-gray-500">to convert to a Word document</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center bg-gray-50 p-4 rounded-lg border">
                            <p className="font-semibold">{file.name}</p>
                            <button onClick={() => setFile(null)} className="text-sm text-blue-600 hover:underline mt-1">
                                Choose a different file
                            </button>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                     <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm text-left">
                        <strong>Note:</strong> This tool extracts text from your PDF. Complex layouts, tables, and images may not be perfectly preserved. The output is a .doc file for basic editing.
                    </div>
                    <button onClick={handleConvert} disabled={!file} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50">
                        Convert to Word (.doc)
                    </button>
                </>
            )}
        </div>
    );
};

const WordToPdfTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles || selectedFiles.length === 0) return;
        
        const selectedFile = selectedFiles[0];
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const allowedExtensions = ['.docx'];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (allowedTypes.includes(selectedFile.type) || allowedExtensions.includes(fileExtension)) {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError("Only .docx files are supported. The legacy .doc format cannot be converted in the browser.");
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

    const handleConvert = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }
        setIsConverting(true);
        setError(null);
        
        try {
            const arrayBuffer = await file.arrayBuffer();

            const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

            const renderContainer = document.createElement('div');
            // A4 page aspect ratio is roughly 1:1.414
            // Width: 210mm. Let's use pixels for canvas. 800px width should be good for quality.
            const renderWidth = 794; // approx 210mm at 96dpi
            renderContainer.style.position = 'absolute';
            renderContainer.style.left = '-9999px';
            renderContainer.style.width = `${renderWidth}px`;
            renderContainer.style.padding = '38px'; // approx 10mm padding on each side
            renderContainer.style.fontFamily = 'Arial, sans-serif'; // a common font
            renderContainer.style.fontSize = '12pt';
            renderContainer.style.backgroundColor = 'white';
            renderContainer.style.boxSizing = 'border-box';
            renderContainer.style.wordWrap = 'break-word';
            renderContainer.innerHTML = html;
            document.body.appendChild(renderContainer);

            const canvas = await html2canvas(renderContainer, {
                scale: 2, // higher scale for better resolution
                useCORS: true,
                logging: false,
            });

            document.body.removeChild(renderContainer);

            const { jsPDF } = jspdf;
            const imgData = canvas.toDataURL('image/png');
            
            // A4 dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297; 

            // Calculate the image height in the PDF to maintain aspect ratio
            const imgHeight = canvas.height * pdfWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Add the first page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add more pages if the content is taller than one page
            while (heightLeft > 0.1) { // use a small tolerance
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const pdfName = file.name.replace(/\.docx?$/i, '.pdf');
            pdf.save(pdfName);
            
            setFile(null);
        } catch (e) {
            console.error(e);
            setError("An error occurred during conversion. The .docx file might be corrupted or contain unsupported features.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="w-full text-center flex flex-col gap-4">
            {!file ? (
                <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-8 transition-all duration-300 cursor-pointer`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onFileChange} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-gray-700">Drag & drop a Word file here, or click to select</p>
                        <p className="text-xs text-gray-500 mt-1">Accepts .docx files only</p>
                    </div>
                </div>
            ) : (
                <div className="mt-2 text-left bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 truncate pr-2">{file.name}</span>
                        <button onClick={removeFile} className="p-1 text-red-500 hover:text-red-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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

const ImageCompressorTool: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [compressedFiles, setCompressedFiles] = useState<{ name: string; blob: Blob; originalSize: number; }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quality, setQuality] = useState(0.75); // 75% quality
    const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const newFiles = Array.from(selectedFiles).filter(file => acceptedTypes.includes(file.type));
        
        if (newFiles.length !== selectedFiles.length) {
            setError("Only JPG, PNG, and WEBP images are accepted.");
        } else {
            setError(null);
        }
        
        if (newFiles.length > 0) {
            setFiles(prev => [...prev, ...newFiles]);
            setStep('preview');
        }
    };
    
    const handleReset = () => {
        setFiles([]);
        setCompressedFiles([]);
        setError(null);
        setIsProcessing(false);
        setStep('upload');
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        if (newFiles.length === 0) {
            handleReset();
        }
    };

    const compressImage = (file: File, quality: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        return reject(new Error('Could not get canvas context.'));
                    }
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas toBlob failed.'));
                        }
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleCompress = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setError(null);

        try {
            const compressedResults = await Promise.all(
                files.map(async file => {
                    const blob = await compressImage(file, quality);
                    const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '-compressed.jpg';
                    return { name: newName, blob, originalSize: file.size };
                })
            );
            setCompressedFiles(compressedResults);
            setStep('complete');
        } catch(e) {
            console.error(e);
            setError("An error occurred during image compression.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownloadAll = async () => {
        if (compressedFiles.length === 0) return;
        const zip = new JSZip();
        compressedFiles.forEach(file => {
            zip.file(file.name, file.blob);
        });
        const zipContent = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipContent, 'application/zip', 'compressed-images.zip');
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderContent = () => {
        if (isProcessing) {
            return <ProcessingAnimation text="Compressing images..." />;
        }

        switch(step) {
            case 'upload':
                return (
                    <div
                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files); }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileSelect(e.target.files)} />
                        <div className="flex flex-col items-center">
                            <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-gray-700 font-semibold">Drag & drop image files here</p>
                            <p className="text-gray-500">or click to select (JPG, PNG, WEBP)</p>
                        </div>
                    </div>
                );
            case 'preview':
                return (
                     <div className="w-full flex flex-col gap-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto custom-scrollbar bg-gray-50 p-4 rounded-lg border">
                            {files.map((file, i) => (
                                <div key={i} className="relative group">
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md aspect-square" />
                                     <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove ${file.name}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border rounded-lg bg-white space-y-3">
                             <label className="font-medium text-gray-700 block">Compression Quality: <span className="font-bold text-blue-600">{Math.round(quality * 100)}%</span></label>
                             <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                        </div>
                        <button onClick={handleCompress} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold text-lg">Compress Images</button>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-bold">Add More Images</button>
                    </div>
                );
             case 'complete':
                return (
                    <div className="w-full flex flex-col gap-4 items-center text-center">
                        <h3 className="text-2xl font-bold text-green-600">Compression Complete!</h3>
                        <div className="w-full bg-gray-50 p-4 rounded-lg border max-h-72 overflow-y-auto custom-scrollbar text-left space-y-2">
                             {compressedFiles.map((cFile, i) => {
                                const reduction = ((cFile.originalSize - cFile.blob.size) / cFile.originalSize) * 100;
                                return (
                                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                        <div className="truncate pr-2">
                                            <p className="text-sm font-semibold text-gray-800">{cFile.name}</p>
                                            <p className="text-xs text-gray-500">{formatBytes(cFile.originalSize)} → <span className="font-medium text-blue-600">{formatBytes(cFile.blob.size)}</span> (<span className="text-green-600">{reduction.toFixed(1)}%</span>)</p>
                                        </div>
                                        <a href={URL.createObjectURL(cFile.blob)} download={cFile.name} className="bg-blue-100 text-blue-700 text-sm font-semibold py-1 px-3 rounded-md hover:bg-blue-200">
                                            Download
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                        {compressedFiles.length > 1 && (
                            <button onClick={handleDownloadAll} className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-bold">Download All (.zip)</button>
                        )}
                        <button onClick={handleReset} className="text-sm text-blue-600 hover:underline">Compress More Images</button>
                    </div>
                );
        }
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {renderContent()}
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </div>
    );
};

const AddWatermarkTool: React.FC = () => {
    // File states
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Watermark type and options
    const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
    const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
    const [isTiled, setIsTiled] = useState(false);
    const [opacity, setOpacity] = useState(0.5);
    const [rotation, setRotation] = useState(-45);
    const [fontSize, setFontSize] = useState(72);
    const [textColor, setTextColor] = useState('#ff0000');
    const [pageRange, setPageRange] = useState('all');
    type Position = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    const [position, setPosition] = useState<Position>('middle-center');
    
    // UI/Control states
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const pdfFileInputRef = useRef<HTMLInputElement>(null);
    const imageFileInputRef = useRef<HTMLInputElement>(null);

    const handleReset = () => {
        setPdfFile(null);
        setTotalPages(0);
        setWatermarkImageFile(null);
        setImagePreview(null);
        setError(null);
        setIsProcessing(false);
        if (pdfFileInputRef.current) pdfFileInputRef.current.value = "";
        if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    };

    const parsePageRange = (rangeStr: string, max: number): number[] | null => {
        if (rangeStr.trim().toLowerCase() === 'all') {
            return Array.from({ length: max }, (_, i) => i + 1);
        }
        const result: Set<number> = new Set();
        if (!rangeStr.trim()) return [];
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

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        } : { r: 0, g: 0, b: 0 };
    };
    
    const handlePdfSelect = async (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are accepted.');
            return;
        }
        setError(null);
        setIsProcessing(true);
        try {
            const { PDFDocument } = PDFLib;
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            setTotalPages(pdfDoc.getPageCount());
            setPdfFile(selectedFile);
        } catch (e) {
            setError('Could not read PDF. It might be password-protected or corrupted.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImageSelect = (selectedFile: File | null) => {
        if (!selectedFile) return;
        const acceptedTypes = ['image/jpeg', 'image/png'];
        if (!acceptedTypes.includes(selectedFile.type)) {
            setError('Only JPG and PNG images are accepted for watermarks.');
            return;
        }
        setError(null);
        setWatermarkImageFile(selectedFile);
        setImagePreview(URL.createObjectURL(selectedFile));
    };
    
    const handleProcess = async () => {
        if (!pdfFile || (watermarkType === 'image' && !watermarkImageFile)) {
            setError('Please select a PDF and a watermark source.');
            return;
        }
        setIsProcessing(true);
        setError(null);

        try {
            const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;
            const pagesToWatermark = parsePageRange(pageRange, totalPages);
            if (!pagesToWatermark || pagesToWatermark.length === 0) {
                setError('Invalid page range.');
                setIsProcessing(false);
                return;
            }

            const existingPdfBytes = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            let watermarkAsset: any = null;
            let assetDims = { width: 0, height: 0 };
            
            if (watermarkType === 'text') {
                const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
                assetDims.width = font.widthOfTextAtSize(watermarkText, fontSize);
                assetDims.height = font.heightAtSize(fontSize);
                watermarkAsset = { font, text: watermarkText, color: hexToRgb(textColor) };
            } else if (watermarkImageFile) {
                const imageBytes = await watermarkImageFile.arrayBuffer();
                watermarkAsset = watermarkImageFile.type === 'image/png'
                    ? await pdfDoc.embedPng(imageBytes)
                    : await pdfDoc.embedJpg(imageBytes);
                assetDims = watermarkAsset.scale(1);
            }

            for (const pageNum of pagesToWatermark) {
                const page = pdfDoc.getPage(pageNum - 1);
                const { width, height } = page.getSize();
                
                const drawOptions = { opacity, rotate: degrees(rotation) };

                const drawWatermark = (x: number, y: number) => {
                     if (watermarkType === 'text') {
                        page.drawText(watermarkAsset.text, {
                            ...drawOptions, x, y,
                            font: watermarkAsset.font,
                            size: fontSize,
                            color: rgb(watermarkAsset.color.r, watermarkAsset.color.g, watermarkAsset.color.b),
                        });
                    } else {
                        page.drawImage(watermarkAsset, { ...drawOptions, x, y, width: assetDims.width, height: assetDims.height });
                    }
                }

                if (isTiled) {
                    const gap = 100;
                    const stepX = assetDims.width + gap;
                    const stepY = assetDims.height + gap;
                    for (let x = 0; x < width + stepX; x += stepX) {
                        for (let y = 0; y < height + stepY; y += stepY) {
                            drawWatermark(x, y);
                        }
                    }
                } else {
                    let x = 0, y = 0;
                    const margin = 50;
                    const [vAlign, hAlign] = position.split('-');

                    switch (vAlign) {
                        case 'top': y = height - margin - assetDims.height; break;
                        case 'middle': y = height / 2 - assetDims.height / 2; break;
                        case 'bottom': y = margin; break;
                    }
                    switch (hAlign) {
                        case 'left': x = margin; break;
                        case 'center': x = width / 2 - assetDims.width / 2; break;
                        case 'right': x = width - margin - assetDims.width; break;
                    }
                    drawWatermark(x, y);
                }
            }

            const pdfBytes = await pdfDoc.save();
            downloadFile(pdfBytes, 'application/pdf', `${pdfFile.name.replace('.pdf', '')}-watermarked.pdf`);

        } catch (e) {
            console.error(e);
            setError('An error occurred while adding the watermark.');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderOptions = () => (
        <div className="w-full flex flex-col gap-6">
            <div className="text-center bg-gray-50 p-4 rounded-lg border">
                <p className="font-semibold">{pdfFile?.name} <span className="text-gray-500 font-normal">({totalPages} pages)</span></p>
                <button onClick={handleReset} className="text-sm text-blue-600 hover:underline mt-1">
                    Choose a different PDF
                </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-1 bg-gray-50 flex">
                 <button onClick={() => setWatermarkType('text')} className={`flex-1 p-2 rounded-md font-semibold transition-colors ${watermarkType === 'text' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Text Watermark</button>
                 <button onClick={() => setWatermarkType('image')} className={`flex-1 p-2 rounded-md font-semibold transition-colors ${watermarkType === 'image' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Image Watermark</button>
            </div>
            
            {/* Watermark specific options */}
            <div className="bg-white p-4 border rounded-lg">
                {watermarkType === 'text' ? (
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-3">
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Text</label>
                            <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Font Size</label>
                            <input type="number" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-600 mb-1 block">Color</label>
                            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full rounded-md shadow-sm h-10 p-1 border-gray-300"/>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        {!watermarkImageFile ? (
                             <div onClick={() => imageFileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                                <input type="file" ref={imageFileInputRef} className="hidden" accept="image/jpeg,image/png" onChange={e => handleImageSelect(e.target.files?.[0] || null)} />
                                <UploadIcon className="w-8 h-8 mx-auto text-gray-400 mb-2"/>
                                <p className="text-sm text-gray-600">Click to select an image</p>
                                <p className="text-xs text-gray-400">JPG or PNG</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <img src={imagePreview!} alt="Watermark preview" className="w-24 h-24 object-contain border rounded-md" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{watermarkImageFile.name}</p>
                                    <button onClick={() => handleImageSelect(null)} className="text-xs text-blue-600 hover:underline">Change image</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Common options */}
            <div className="bg-white p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Tiled Watermark</span>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isTiled} onChange={e => setIsTiled(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                 {!isTiled && (
                    <div className="flex flex-col items-center gap-2">
                        <label className="font-medium text-gray-700">Position</label>
                         <div className="grid grid-cols-3 gap-2 w-32 h-32">
                            {(['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'] as Position[]).map(pos => (
                                <button key={pos} onClick={() => setPosition(pos)} className={`border rounded flex items-center justify-center transition-colors ${position === pos ? 'bg-blue-600 border-blue-700' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                                    <div className={`w-3 h-3 rounded-full ${position === pos ? 'bg-white' : 'bg-gray-400'}`}></div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <label className="font-medium text-gray-700 block mb-1">Opacity: {Math.round(opacity * 100)}%</label>
                    <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                </div>
                 <div>
                    <label className="font-medium text-gray-700 block mb-1">Rotation: {rotation}°</label>
                    <input type="range" min="-180" max="180" value={rotation} onChange={e => setRotation(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
                </div>
                <div>
                    <label className="font-medium text-gray-700 block mb-1">Page Range</label>
                    <input type="text" value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder='e.g., "all" or "1, 3-5"' className="w-full border-gray-300 rounded-md shadow-sm p-2"/>
                </div>
            </div>

            <button onClick={handleProcess} disabled={isProcessing} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold text-lg transition-all duration-300 hover:bg-blue-700 disabled:opacity-50">
                Add Watermark
            </button>
        </div>
    );
    
    if (isProcessing) {
        return <ProcessingAnimation text="Applying watermark..." />;
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {!pdfFile ? (
                <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handlePdfSelect(e.dataTransfer.files?.[0] || null); }}
                    onClick={() => pdfFileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
                >
                    <input type="file" ref={pdfFileInputRef} className="hidden" accept=".pdf" onChange={e => handlePdfSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-700 font-semibold">Select a PDF to watermark</p>
                    </div>
                </div>
            ) : renderOptions() }
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </div>
    );
};


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

const AddPageNumbersTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Options state
    type Position = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    const [position, setPosition] = useState<Position>('bottom-center');
    const [margin, setMargin] = useState(36);
    const [pageRange, setPageRange] = useState('all');
    const [format, setFormat] = useState('{page} / {total}');
    const [font, setFont] = useState('Helvetica');
    const [fontSize, setFontSize] = useState(12);
    const [color, setColor] = useState('#000000');

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
            setError('Could not read PDF file. It might be corrupted or protected.');
            setFile(null);
            setTotalPages(0);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const parsePageRange = (rangeStr: string, max: number): number[] | null => {
        if (rangeStr.trim().toLowerCase() === 'all') {
            return Array.from({ length: max }, (_, i) => i + 1);
        }
        const result: Set<number> = new Set();
        if (!rangeStr.trim()) return [];
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

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
        } : { r: 0, g: 0, b: 0 };
    };

    const handleProcess = async () => {
        if (!file) return;
        setIsProcessing(true);
        setError(null);

        const pagesToAddNumbers = parsePageRange(pageRange, totalPages);
        if (!pagesToAddNumbers || pagesToAddNumbers.length === 0) {
            setError('Invalid page range. Please use "all" or a format like "1, 3-5, 8".');
            setIsProcessing(false);
            return;
        }

        try {
            const { PDFDocument, StandardFonts, rgb } = PDFLib;
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const fontMap = {
                'Helvetica': StandardFonts.Helvetica,
                'Helvetica-Bold': StandardFonts.HelveticaBold,
                'Times-Roman': StandardFonts.TimesRoman,
                'Courier': StandardFonts.Courier,
            };
            const embeddedFont = await pdfDoc.embedFont(fontMap[font as keyof typeof fontMap] || StandardFonts.Helvetica);
            const textColor = hexToRgb(color);

            for (const pageNum of pagesToAddNumbers) {
                const page = pdfDoc.getPage(pageNum - 1);
                const { width, height } = page.getSize();
                const text = format.replace('{page}', String(pageNum)).replace('{total}', String(totalPages));
                const textWidth = embeddedFont.widthOfTextAtSize(text, fontSize);
                const textHeight = embeddedFont.heightAtSize(fontSize);

                let x = 0, y = 0;
                const [vAlign, hAlign] = position.split('-');

                switch (vAlign) {
                    case 'top': y = height - margin - textHeight; break;
                    case 'middle': y = height / 2 - textHeight / 2; break;
                    case 'bottom': y = margin; break;
                }
                switch (hAlign) {
                    case 'left': x = margin; break;
                    case 'center': x = width / 2 - textWidth / 2; break;
                    case 'right': x = width - margin - textWidth; break;
                }
                
                page.drawText(text, { x, y, font: embeddedFont, size: fontSize, color: rgb(textColor.r, textColor.g, textColor.b) });
            }

            const pdfBytes = await pdfDoc.save();
            downloadFile(pdfBytes, 'application/pdf', `${file.name.replace('.pdf', '')}-numbered.pdf`);

        } catch (e) {
            console.error(e);
            setError("An error occurred. Please ensure the PDF is not corrupted or password-protected.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const PositionSelector: React.FC = () => {
        const positions: Position[] = [
            'top-left', 'top-center', 'top-right',
            'middle-left', 'middle-center', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right'
        ];
        return (
            <div className="grid grid-cols-3 gap-2 w-32 h-32">
                {positions.map(pos => (
                    <button
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className={`border rounded flex items-center justify-center transition-colors ${
                            position === pos ? 'bg-blue-600 border-blue-700' : 'bg-white border-gray-300 hover:bg-gray-100'
                        }`}
                        aria-label={`Position ${pos.replace('-', ' ')}`}
                    >
                        <div className={`w-3 h-3 rounded-full ${position === pos ? 'bg-white' : 'bg-gray-400'}`}></div>
                    </button>
                ))}
            </div>
        );
    };

    if (isProcessing && !file) {
        return <ProcessingAnimation text="Loading your PDF..." />;
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {!file ? (
                <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files?.[0] || null); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                    <div className="flex flex-col items-center">
                        <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-700 font-semibold">Drag & drop a PDF file here</p>
                        <p className="text-gray-500">or click to select</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-center bg-gray-50 p-4 rounded-lg border">
                        <p className="font-semibold">{file.name} <span className="text-gray-500 font-normal">({totalPages} pages)</span></p>
                        <button onClick={() => { setFile(null); setTotalPages(0); }} className="text-sm text-blue-600 hover:underline mt-1">
                            Choose a different file
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="flex flex-col items-center gap-4 bg-white p-4 border rounded-lg">
                            <h3 className="font-semibold text-gray-700">Position</h3>
                            <PositionSelector />
                        </div>
                        <div className="space-y-4 bg-white p-4 border rounded-lg">
                             <div className="flex flex-col">
                                <label htmlFor="pageRange" className="text-sm font-medium text-gray-600 mb-1">Pages to number</label>
                                <input id="pageRange" type="text" value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder='e.g., "all" or "1, 3-5"' className="w-full border-gray-300 rounded-md shadow-sm p-2"/>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="format" className="text-sm font-medium text-gray-600 mb-1">Text format</label>
                                <input id="format" type="text" value={format} onChange={e => setFormat(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2"/>
                                <p className="text-xs text-gray-500 mt-1">Use {'{page}'} for current page, {'{total}'} for total pages.</p>
                            </div>
                           
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label htmlFor="font" className="text-sm font-medium text-gray-600 mb-1">Font</label>
                                    <select id="font" value={font} onChange={e => setFont(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-2">
                                        <option>Helvetica</option>
                                        <option>Helvetica-Bold</option>
                                        <option>Times-Roman</option>
                                        <option>Courier</option>
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="fontSize" className="text-sm font-medium text-gray-600 mb-1">Font size</label>
                                    <input id="fontSize" type="number" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm p-2"/>
                                </div>
                                 <div className="flex flex-col">
                                    <label htmlFor="margin" className="text-sm font-medium text-gray-600 mb-1">Margin (pt)</label>
                                    <input id="margin" type="number" value={margin} onChange={e => setMargin(parseInt(e.target.value))} className="w-full border-gray-300 rounded-md shadow-sm p-2"/>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="color" className="text-sm font-medium text-gray-600 mb-1">Color</label>
                                    <input id="color" type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full rounded-md shadow-sm h-10 p-1"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleProcess} disabled={isProcessing} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50">
                        {isProcessing ? 'Processing...' : 'Add Page Numbers'}
                    </button>
                </>
            )}
             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
    );
};


const JpgToPdfTool: React.FC = () => {
    type Step = 'upload' | 'preview' | 'processing' | 'complete';
    const [step, setStep] = useState<Step>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // PDF options
    const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [marginSize, setMarginSize] = useState<number>(36); // in points

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const newFiles = Array.from(selectedFiles).filter(file => acceptedTypes.includes(file.type));
        
        if (newFiles.length !== selectedFiles.length) {
            setError("Only JPG, PNG, and WEBP images are accepted.");
        } else {
            setError(null);
        }

        if(newFiles.length > 0) {
            setFiles(prev => [...prev, ...newFiles]);
            setStep('preview');
        }
    };

    const handleConvert = async () => {
        if (files.length === 0) return;
        setStep('processing');
        setError(null);
        try {
            const { PDFDocument, PageSizes } = PDFLib;
            const pdfDoc = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer();
                const image = file.type === 'image/png' 
                    ? await pdfDoc.embedPng(arrayBuffer) 
                    : await pdfDoc.embedJpg(arrayBuffer);

                const page = pdfDoc.addPage(PageSizes[pageSize]);
                if (orientation === 'landscape') {
                    page.setRotation(PDFLib.degrees(90));
                }

                const dims = image.scale(1);
                const pageWidth = page.getWidth();
                const pageHeight = page.getHeight();
                
                const usableWidth = pageWidth - marginSize * 2;
                const usableHeight = pageHeight - marginSize * 2;
                
                const widthScale = usableWidth / dims.width;
                const heightScale = usableHeight / dims.height;
                const scale = Math.min(widthScale, heightScale);

                const scaledWidth = dims.width * scale;
                const scaledHeight = dims.height * scale;
                
                const x = (pageWidth - scaledWidth) / 2;
                const y = (pageHeight - scaledHeight) / 2;

                page.drawImage(image, { x, y, width: scaledWidth, height: scaledHeight });
            }

            const pdfBytes = await pdfDoc.save();
            downloadFile(pdfBytes, 'application/pdf', 'converted-magic-pdf.pdf');
            setStep('complete');

        } catch (e) {
            console.error(e);
            setError("An error occurred while converting the images. Please ensure they are valid files.");
            setStep('preview');
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        if (newFiles.length === 0) setStep('upload');
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {step === 'upload' && (
                <div
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileSelect(e.target.files)} />
                     <div className="flex flex-col items-center">
                        <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-700 font-semibold">Drag & drop image files here</p>
                        <p className="text-gray-500">or click to select (JPG, PNG, WEBP)</p>
                    </div>
                </div>
            )}
            {step === 'preview' && (
                <>
                    {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto custom-scrollbar bg-gray-50 p-4 rounded-lg border">
                        {files.map((file, i) => (
                            <div key={i} className="relative group">
                                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md aspect-square" />
                                <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-white">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Page size</label>
                            <select value={pageSize} onChange={e => setPageSize(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option>A4</option>
                                <option>Letter</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Orientation</label>
                            <select value={orientation} onChange={e => setOrientation(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={handleConvert} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold">Convert to PDF</button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md font-bold">Add More Images</button>
                </>
            )}
            {step === 'processing' && <ProcessingAnimation text="Converting images to PDF..." />}
            {step === 'complete' && (
                 <div className="w-full flex flex-col gap-4 items-center text-center">
                    <h3 className="text-2xl font-bold text-green-600">Conversion Successful!</h3>
                    <p className="text-gray-600">Your new PDF is ready.</p>
                    <button onClick={() => { setFiles([]); setStep('upload'); }} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold">Convert More Images</button>
                </div>
            )}
        </div>
    );
};

const PdfToJpgTool: React.FC = () => {
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
            const zip = new JSZip();
            
            for (let i = 0; i < pdf.numPages; i++) {
                const page = await pdf.getPage(i + 1);
                const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    const imageData = canvas.toDataURL('image/jpeg', 0.9); // Quality 90%
                    zip.file(`page_${i + 1}.jpg`, imageData.split(';base64,')[1], { base64: true });
                }
            }
            
            const zipContent = await zip.generateAsync({ type: 'blob' });
            downloadFile(zipContent, 'application/zip', `${file.name.replace('.pdf', '')}-images.zip`);

        } catch (e) {
            console.error(e);
            setError('An error occurred while converting the PDF. It may be corrupted or protected.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 text-center">
            {isProcessing ? (
                <ProcessingAnimation text="Converting PDF to JPGs..." />
            ) : (
                <>
                    {!file ? (
                        <div
                            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files?.[0] || null); }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
                        >
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
                            <div className="flex flex-col items-center">
                                <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-gray-700 font-semibold">Drag & drop a PDF here</p>
                                <p className="text-gray-500">or click to select</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center bg-gray-50 p-4 rounded-lg border">
                            <p className="font-semibold">{file.name}</p>
                            <button onClick={() => setFile(null)} className="text-sm text-blue-600 hover:underline mt-1">
                                Choose a different file
                            </button>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button onClick={handleConvert} disabled={!file} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50">
                        Convert to JPG
                    </button>
                </>
            )}
        </div>
    );
};

const ImageConverterTool: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const newFiles = Array.from(selectedFiles).filter(file => acceptedTypes.includes(file.type));
        
        if (newFiles.length !== selectedFiles.length) {
            setError("Only JPG, PNG, and WEBP images are accepted.");
        } else {
            setError(null);
        }
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleConvert = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setError(null);
        try {
            const zip = new JSZip();
            for (const file of files) {
                const imageBitmap = await createImageBitmap(file);
                const canvas = document.createElement('canvas');
                canvas.width = imageBitmap.width;
                canvas.height = imageBitmap.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(imageBitmap, 0, 0);

                const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, `image/${outputFormat}`, 0.9));
                if (blob) {
                    const newName = file.name.substring(0, file.name.lastIndexOf('.')) + `.${outputFormat}`;
                    zip.file(newName, blob);
                }
            }
            const zipContent = await zip.generateAsync({ type: 'blob' });
            downloadFile(zipContent, 'application/zip', `converted-images.zip`);
        } catch(e) {
            console.error(e);
            setError("An error occurred during conversion.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
             {isProcessing ? (
                <ProcessingAnimation text="Converting your images..." />
            ) : (
                <>
                {files.length === 0 ? (
                    <div
                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFileSelect(e.dataTransfer.files); }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileSelect(e.target.files)} />
                        <div className="flex flex-col items-center">
                            <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                            <p className="text-gray-700 font-semibold">Drag & drop images here</p>
                            <p className="text-gray-500">or click to select</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto custom-scrollbar bg-gray-50 p-4 rounded-lg border">
                            {files.map((file, i) => (
                                <div key={i} className="relative">
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md aspect-square" />
                                </div>
                            ))}
                        </div>
                         <div className="p-4 border rounded-lg bg-white flex items-center justify-center gap-4">
                            <label htmlFor="format" className="font-medium text-gray-700">Convert to:</label>
                            <select id="format" value={outputFormat} onChange={e => setOutputFormat(e.target.value as any)} className="w-48 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md p-2">
                                <option value="jpeg">JPG</option>
                                <option value="png">PNG</option>
                                <option value="webp">WEBP</option>
                            </select>
                        </div>
                        <button onClick={handleConvert} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold">Convert Images</button>
                        <button onClick={() => { setFiles([]); setError(null); }} className="text-sm text-blue-600 hover:underline">Start Over</button>
                    </>
                )}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </>
            )}
        </div>
    );
};

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
                <button onClick={handleReset} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700">
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
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
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
                        <button onClick={handleReset} className="text-sm text-blue-600 hover:underline mt-1">
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
                    <button onClick={handleUnlock} disabled={!password} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50">
                        Unlock PDF
                    </button>
                </>
            )}
        </div>
    );
};


// Main Tool Page Component
const ToolPage: React.FC<ToolPageProps> = ({ tool }) => {
  const renderToolContent = () => {
    switch (tool.id) {
      case 'merge-pdf':
        return <MergePdfTool />;
      case 'pdf-to-word':
        return <PdfToWordTool />;
      case 'word-to-pdf':
        return <WordToPdfTool />;
      case 'add-page-numbers':
          return <AddPageNumbersTool />;
      case 'jpg-to-pdf':
          return <JpgToPdfTool />;
      case 'pdf-to-jpg':
          return <PdfToJpgTool />;
      case 'image-converter':
          return <ImageConverterTool />;
      case 'unlock-pdf':
        return <UnlockPdfTool />;
      case 'add-watermark':
        return <AddWatermarkTool />;
      case 'image-compressor':
        return <ImageCompressorTool />;
      // Add cases for other implemented tools here
      default:
        return <ComingSoon />;
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-full p-4 sm:p-6 md:p-10 animate-fade-in">
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-10">
                <div className="inline-block p-4 bg-blue-100/50 border border-blue-200/50 rounded-2xl mb-4">
                    <tool.icon className="w-12 h-12 text-blue-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{tool.title}</h1>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">{tool.description}</p>
            </header>
            <main className="bg-white border border-gray-200/80 rounded-2xl shadow-lg shadow-gray-200/40 p-6 sm:p-8 md:p-10">
                <div className="flex justify-center">
                    {renderToolContent()}
                </div>
            </main>
        </div>
    </div>
  );
};

export default ToolPage;