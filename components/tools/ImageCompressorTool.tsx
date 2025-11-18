import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const JSZip: any;

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
                        className={`w-full relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
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
                             <label className="font-medium text-gray-700 block">Compression Quality: <span className="font-bold text-indigo-600">{Math.round(quality * 100)}%</span></label>
                             <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                        </div>
                        <button onClick={handleCompress} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold text-lg">Compress Images</button>
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
                                            <p className="text-xs text-gray-500">{formatBytes(cFile.originalSize)} → <span className="font-medium text-indigo-600">{formatBytes(cFile.blob.size)}</span> (<span className="text-green-600">{reduction.toFixed(1)}%</span>)</p>
                                        </div>
                                        <a href={URL.createObjectURL(cFile.blob)} download={cFile.name} className="bg-indigo-100 text-indigo-700 text-sm font-semibold py-1 px-3 rounded-md hover:bg-indigo-200">
                                            Download
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                        {compressedFiles.length > 1 && (
                            <button onClick={handleDownloadAll} className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-bold">Download All (.zip)</button>
                        )}
                        <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline">Compress More Images</button>
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

export default ImageCompressorTool;
