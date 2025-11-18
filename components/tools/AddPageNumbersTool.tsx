import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';
import { ProcessingAnimation, downloadFile } from './common';

declare const PDFLib: any;

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
                            position === pos ? 'bg-indigo-600 border-indigo-700' : 'bg-white border-gray-300 hover:bg-gray-100'
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
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300 cursor-pointer text-center`}
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
                        <button onClick={() => { setFile(null); setTotalPages(0); }} className="text-sm text-indigo-600 hover:underline mt-1">
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

                    <button onClick={handleProcess} disabled={isProcessing} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-indigo-700 disabled:opacity-50">
                        {isProcessing ? 'Processing...' : 'Add Page Numbers'}
                    </button>
                </>
            )}
             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
    );
};

export default AddPageNumbersTool;
