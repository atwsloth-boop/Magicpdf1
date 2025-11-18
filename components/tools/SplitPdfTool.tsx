import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const PDFLib: any;
declare const JSZip: any;

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
            setError('Could not read PDF file. It might be corrupted or password-protected.');
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
                    setError('Invalid page range format. Use numbers, commas, and hyphens (e.g., 1, 3-5, 8).');
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

    if (isProcessing && !file) {
        return <ProcessingAnimation text="Loading your PDF..." />;
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {!file ? (
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
                        <p className="text-gray-700 font-semibold">Drag & drop a PDF here</p>
                         <p className="text-gray-500">or click to select a file</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-center bg-gray-50 p-4 rounded-lg border">
                        <p className="font-semibold">{file.name} <span className="text-gray-500 font-normal">({totalPages} pages)</span></p>
                        <button onClick={() => { setFile(null); setTotalPages(0); }} className="text-sm text-indigo-600 hover:underline mt-1">
                            Choose a different file
                        </button>
                    </div>

                    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-1">
                        <button onClick={() => setMode('extract')} className={`flex-1 p-2 font-semibold rounded-md transition-colors ${mode === 'extract' ? 'bg-indigo-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}>Extract Pages</button>
                        <button onClick={() => setMode('split')} className={`flex-1 p-2 font-semibold rounded-md transition-colors ${mode === 'split' ? 'bg-indigo-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}>Split All Pages</button>
                    </div>
                    {mode === 'extract' ? (
                        <div className="flex flex-col">
                            <label htmlFor="pageRange" className="text-sm font-medium text-gray-600 mb-1">Pages to extract</label>
                            <input
                                id="pageRange"
                                type="text"
                                value={pageRange}
                                onChange={(e) => setPageRange(e.target.value)}
                                placeholder="e.g., 1, 3-5, 8"
                                className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    ) : (
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-md text-center text-sm text-indigo-800">
                            This will create a separate PDF file for each of the {totalPages} pages. The files will be downloaded in a .zip archive.
                        </div>
                    )}
                    <button onClick={handleProcess} disabled={isProcessing} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold text-lg transition-all duration-300 hover:bg-indigo-700 disabled:opacity-50">
                        {isProcessing ? 'Processing...' : 'Split PDF'}
                    </button>
                </>
            )}
             {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </div>
    );
};

export default SplitPdfTool;
