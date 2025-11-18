import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const PDFLib: any;

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
            const pdfDoc = await PDFDocument.load(arrayBuffer, { 
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (isProcessing) {
        return <ProcessingAnimation text="Compressing your PDF..." />;
    }

    if (result) {
        return (
            <div className="w-full flex flex-col gap-4 items-center text-center">
                <p className="text-2xl font-bold text-green-600">Compression Complete!</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full p-4 bg-gray-50 rounded-lg border">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Original Size</p>
                        <p className="font-bold text-xl text-gray-800">{formatBytes(result.originalSize)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">New Size</p>
                        <p className="font-bold text-xl text-indigo-600">{formatBytes(result.newSize)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Reduction</p>
                        <p className="font-bold text-xl text-green-600">
                            {result.originalSize > 0 ? (((result.originalSize - result.newSize) / result.originalSize) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => downloadFile(result.compressedBytes, 'application/pdf', `${file?.name.replace('.pdf', '')}-compressed.pdf`)} 
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-green-700"
                >
                    Download Compressed PDF
                </button>
                <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline">
                    Compress another file
                </button>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col gap-4 text-center">
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
                        <p className="text-gray-700 font-semibold">Drag & drop a PDF to compress</p>
                        <p className="text-gray-500">or click to select a file</p>
                    </div>
                </div>
            ) : (
                <div className="text-center bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold">{file.name}</p>
                    <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline mt-1">
                        Choose a different file
                    </button>
                </div>
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {file && (
                 <button onClick={handleCompress} disabled={isProcessing} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-indigo-700 disabled:opacity-50">
                    {isProcessing ? 'Compressing...' : `Compress PDF`}
                </button>
            )}
        </div>
    );
};

export default CompressPdfTool;
