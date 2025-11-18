import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const PDFLib: any;

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
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
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
                            <select value={pageSize} onChange={e => setPageSize(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option>A4</option>
                                <option>Letter</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Orientation</label>
                            <select value={orientation} onChange={e => setOrientation(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={handleConvert} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold">Convert to PDF</button>
                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md font-bold">Add More Images</button>
                </>
            )}
            {step === 'processing' && <ProcessingAnimation text="Converting images to PDF..." />}
            {step === 'complete' && (
                 <div className="w-full flex flex-col gap-4 items-center text-center">
                    <h3 className="text-2xl font-bold text-green-600">Conversion Successful!</h3>
                    <p className="text-gray-600">Your new PDF is ready.</p>
                    <button onClick={() => { setFiles([]); setStep('upload'); }} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold">Convert More Images</button>
                </div>
            )}
        </div>
    );
};

export default JpgToPdfTool;
