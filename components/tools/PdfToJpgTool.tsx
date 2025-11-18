import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const pdfjsLib: any;
declare const JSZip: any;

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
}

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
                            className={`relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
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
                            <button onClick={() => setFile(null)} className="text-sm text-indigo-600 hover:underline mt-1">
                                Choose a different file
                            </button>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button onClick={handleConvert} disabled={!file} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-indigo-700 disabled:opacity-50">
                        Convert to JPG
                    </button>
                </>
            )}
        </div>
    );
};

export default PdfToJpgTool;
