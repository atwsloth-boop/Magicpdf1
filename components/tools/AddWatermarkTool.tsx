import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const PDFLib: any;

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
                <button onClick={handleReset} className="text-sm text-indigo-600 hover:underline mt-1">
                    Choose a different PDF
                </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-1 bg-gray-50 flex">
                 <button onClick={() => setWatermarkType('text')} className={`flex-1 p-2 rounded-md font-semibold transition-colors ${watermarkType === 'text' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Text Watermark</button>
                 <button onClick={() => setWatermarkType('image')} className={`flex-1 p-2 rounded-md font-semibold transition-colors ${watermarkType === 'image' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Image Watermark</button>
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
                             <div onClick={() => imageFileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50">
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
                                    <button onClick={() => handleImageSelect(null)} className="text-xs text-indigo-600 hover:underline">Change image</button>
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
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
                 {!isTiled && (
                    <div className="flex flex-col items-center gap-2">
                        <label className="font-medium text-gray-700">Position</label>
                         <div className="grid grid-cols-3 gap-2 w-32 h-32">
                            {(['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'] as Position[]).map(pos => (
                                <button key={pos} onClick={() => setPosition(pos)} className={`border rounded flex items-center justify-center transition-colors ${position === pos ? 'bg-indigo-600 border-indigo-700' : 'bg-white border-gray-300 hover:bg-gray-100'}`}>
                                    <div className={`w-3 h-3 rounded-full ${position === pos ? 'bg-white' : 'bg-gray-400'}`}></div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <label className="font-medium text-gray-700 block mb-1">Opacity: {Math.round(opacity * 100)}%</label>
                    <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                </div>
                 <div>
                    <label className="font-medium text-gray-700 block mb-1">Rotation: {rotation}°</label>
                    <input type="range" min="-180" max="180" value={rotation} onChange={e => setRotation(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                </div>
                <div>
                    <label className="font-medium text-gray-700 block mb-1">Page Range</label>
                    <input type="text" value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder='e.g., "all" or "1, 3-5"' className="w-full border-gray-300 rounded-md shadow-sm p-2"/>
                </div>
            </div>

            <button onClick={handleProcess} disabled={isProcessing} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold text-lg transition-all duration-300 hover:bg-indigo-700 disabled:opacity-50">
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
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
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

export default AddWatermarkTool;
