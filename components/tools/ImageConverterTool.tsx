import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const JSZip: any;

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
                        className={`relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
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
                            <select id="format" value={outputFormat} onChange={e => setOutputFormat(e.target.value as any)} className="w-48 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md p-2">
                                <option value="jpeg">JPG</option>
                                <option value="png">PNG</option>
                                <option value="webp">WEBP</option>
                            </select>
                        </div>
                        <button onClick={handleConvert} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold">Convert Images</button>
                        <button onClick={() => { setFiles([]); setError(null); }} className="text-sm text-indigo-600 hover:underline">Start Over</button>
                    </>
                )}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </>
            )}
        </div>
    );
};

export default ImageConverterTool;
