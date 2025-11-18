import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const pdfjsLib: any;

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
}

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
                            className={`relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
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
                            <button onClick={() => setFile(null)} className="text-sm text-indigo-600 hover:underline mt-1">
                                Choose a different file
                            </button>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                     <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm text-left">
                        <strong>Note:</strong> This tool extracts text from your PDF. Complex layouts, tables, and images may not be perfectly preserved. The output is a .doc file for basic editing.
                    </div>
                    <button onClick={handleConvert} disabled={!file} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-indigo-700 disabled:opacity-50">
                        Convert to Word (.doc)
                    </button>
                </>
            )}
        </div>
    );
};

export default PdfToWordTool;
