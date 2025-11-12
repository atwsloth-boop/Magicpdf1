
import React, { useState, useCallback } from 'react';
import { Tool } from '../types';
import { CloseIcon } from './icons/UIIcons';
import { UploadIcon } from './icons/ToolIcons';
import { QRCodeSVG } from 'qrcode.react';

interface ToolModalProps {
  tool: Tool;
  onClose: () => void;
}

// A generic file drop zone component for tools that need file input
const FileDropZone: React.FC = () => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(droppedFiles);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };
    
    const simulateProcessing = () => {
        if (files.length === 0) return;
        setStatus('uploading');
        setTimeout(() => {
            setStatus('processing');
            setTimeout(() => {
                setStatus('done');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="w-full text-center">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300'} rounded-lg p-10 transition-all duration-300`}
            >
                <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadIcon className="w-12 h-12 text-slate-400 mb-4" />
                    <p className="text-slate-700">Drag & drop files here, or click to select files</p>
                    <p className="text-xs text-slate-500 mt-1">Maximum file size 50MB</p>
                </label>
            </div>
            {files.length > 0 && (
                <div className="mt-4 text-left">
                    <h4 className="font-semibold text-slate-800">Selected files:</h4>
                    <ul className="list-disc list-inside text-slate-600">
                        {files.map((file, i) => <li key={i}>{file.name}</li>)}
                    </ul>
                </div>
            )}
            <button
                onClick={simulateProcessing}
                disabled={files.length === 0 || status !== 'idle'}
                className="mt-6 w-full bg-blue-500 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Process Files
            </button>
            {status !== 'idle' && (
                <div className="mt-4 p-3 bg-slate-100 rounded-md">
                    {status === 'uploading' && <p className="text-yellow-600">Uploading...</p>}
                    {status === 'processing' && <p className="text-blue-600">Processing...</p>}
                    {status === 'done' && <p className="text-green-600">Done! Your download will start shortly (simulation).</p>}
                </div>
            )}
        </div>
    );
};

// Specific Tool Components
const QRGenerator: React.FC = () => {
    const [text, setText] = useState('https://react.dev');
    return (
        <div className="w-full flex flex-col items-center gap-4">
            <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or text"
                className="w-full bg-slate-100 border border-slate-300 rounded-md p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="p-4 bg-white rounded-md border border-slate-200">
                <QRCodeSVG value={text} size={256} />
            </div>
        </div>
    );
};

const WordCounter: React.FC = () => {
    const [text, setText] = useState('');
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const charCount = text.length;
    return (
        <div className="w-full flex flex-col gap-4">
            <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder="Paste your text here..."
                className="w-full bg-slate-100 border border-slate-300 rounded-md p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="flex justify-around p-3 bg-slate-100 rounded-md">
                <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{wordCount}</p>
                    <p className="text-sm text-slate-500">Words</p>
                </div>
                 <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{charCount}</p>
                    <p className="text-sm text-slate-500">Characters</p>
                </div>
            </div>
        </div>
    );
}

const TextToSpeech: React.FC = () => {
    const [text, setText] = useState("Hello from Magic PDF! This is a text-to-speech demonstration.");
    
    const handleSpeak = () => {
        if ('speechSynthesis' in window && text) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser doesn't support text-to-speech.");
        }
    };
    
    return (
        <div className="w-full flex flex-col gap-4">
            <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Enter text to speak..."
                className="w-full bg-slate-100 border border-slate-300 rounded-md p-3 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
                onClick={handleSpeak}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-600"
            >
                Speak
            </button>
        </div>
    );
};


const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose }) => {
    const renderToolContent = () => {
        switch (tool.id) {
            case 'qr-code-generator':
                return <QRGenerator />;
            case 'word-counter':
                return <WordCounter />;
            case 'text-to-speech':
                return <TextToSpeech />;
            // Add cases for other implemented tools here
            // Default to file drop zone for PDF/Image tools
            default:
                return <FileDropZone />;
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                <header className="flex items-center justify-between p-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <tool.icon className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-bold text-slate-900">{tool.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    <p className="text-slate-500 mb-6 text-center">{tool.description}</p>
                    <div className="flex justify-center">
                        {renderToolContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ToolModal;