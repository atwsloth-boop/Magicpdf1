import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/ToolIcons';

declare const mammoth: any;
declare const jspdf: any;
declare const html2canvas: any;

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
                    className={`relative border-2 border-dashed ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'} rounded-lg p-8 transition-all duration-300 cursor-pointer`}
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
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isConverting ? 'Converting...' : 'Convert to PDF'}
            </button>
        </div>
    );
};

export default WordToPdfTool;
