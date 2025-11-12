
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tool } from '../types';
import { CloseIcon } from './icons/UIIcons';
import { UploadIcon } from './icons/ToolIcons';
import { QRCodeSVG } from 'qrcode.react';

// Fix: Add type definitions for the browser's SpeechRecognition API to resolve compilation errors.
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      isFinal: boolean;
      [key: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

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
        setStatus('idle');
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setStatus('idle');
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
                className={`relative border-2 border-dashed ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-10 transition-all duration-300`}
            >
                <input type="file" id="file-upload" className="hidden" multiple onChange={handleFileChange} />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-700">Drag & drop files here, or click to select files</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size 50MB</p>
                </label>
            </div>
            {files.length > 0 && (
                <div className="mt-4 text-left">
                    <h4 className="font-semibold text-gray-700">Selected files:</h4>
                    <ul className="list-disc list-inside text-gray-600">
                        {files.map((file, i) => <li key={i}>{file.name}</li>)}
                    </ul>
                </div>
            )}
            <button
                onClick={simulateProcessing}
                disabled={files.length === 0 || status !== 'idle'}
                className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Process Files
            </button>
            {status !== 'idle' && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
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
                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                <QRCodeSVG value={text} size={256} />
            </div>
        </div>
    );
};

const WordCounter: React.FC = () => {
    const [text, setText] = useState('');
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const charCount = text.length;
    return (
        <div className="w-full flex flex-col gap-4">
            <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder="Paste your text here..."
                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none custom-scrollbar"
            />
            <div className="flex justify-around p-3 bg-gray-100 border border-gray-200 rounded-md">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{wordCount}</p>
                    <p className="text-sm text-gray-500">Words</p>
                </div>
                 <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{charCount}</p>
                    <p className="text-sm text-gray-500">Characters</p>
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
            window.speechSynthesis.cancel(); // Cancel any previous speech
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
                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none custom-scrollbar"
            />
            <button
                onClick={handleSpeak}
                disabled={!text.trim()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700 disabled:opacity-50"
            >
                Speak
            </button>
        </div>
    );
};

const SpeechToText: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Sorry, your browser doesn't support speech-to-text.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
             setTranscript(prev => prev + finalTranscript + interimTranscript);
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const handleToggleListen = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setTranscript(''); // Reset transcript on new start
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <button
                onClick={handleToggleListen}
                className={`w-full py-3 px-4 rounded-md font-bold text-white transition-all duration-300 ${
                    isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
                {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
            <textarea 
                value={transcript}
                readOnly
                rows={8}
                placeholder="Your transcribed text will appear here..."
                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none custom-scrollbar"
            />
        </div>
    );
};

const PasswordGenerator: React.FC = () => {
    const [length, setLength] = useState(16);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generatePassword = useCallback(() => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
        
        let charSet = lower;
        if (includeUppercase) charSet += upper;
        if (includeNumbers) charSet += numbers;
        if (includeSymbols) charSet += symbols;

        if (charSet === '') {
            setPassword('');
            return;
        }

        let newPassword = '';
        for (let i = 0; i < length; i++) {
            newPassword += charSet.charAt(Math.floor(Math.random() * charSet.length));
        }
        setPassword(newPassword);
        setCopied(false);
    }, [length, includeUppercase, includeNumbers, includeSymbols]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const copyToClipboard = () => {
        if (password) {
            navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="relative bg-gray-100 border border-gray-300 rounded-md p-3 text-gray-800 font-mono text-lg text-center">
                {password || ' '}
                 <button onClick={copyToClipboard} className="absolute top-1/2 right-2 -translate-y-1/2 bg-gray-200 text-gray-600 text-xs font-sans px-2 py-1 rounded hover:bg-gray-300">
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            <div className="space-y-4 text-gray-700">
                <div className="flex items-center justify-between">
                    <label htmlFor="length">Password Length</label>
                    <span className="font-bold text-blue-600">{length}</span>
                </div>
                <input type="range" id="length" min="6" max="32" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                
                <div className="flex items-center">
                    <input type="checkbox" id="uppercase" checked={includeUppercase} onChange={() => setIncludeUppercase(p => !p)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="uppercase" className="ml-2 block text-sm">Include Uppercase Letters</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="numbers" checked={includeNumbers} onChange={() => setIncludeNumbers(p => !p)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="numbers" className="ml-2 block text-sm">Include Numbers</label>
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="symbols" checked={includeSymbols} onChange={() => setIncludeSymbols(p => !p)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="symbols" className="ml-2 block text-sm">Include Symbols</label>
                </div>
            </div>
             <button onClick={generatePassword} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700">
                Generate New Password
            </button>
        </div>
    );
};

const AgeCalculator: React.FC = () => {
    const [birthDate, setBirthDate] = useState('');
    const [age, setAge] = useState<{ years: number, months: number, days: number } | null>(null);

    const calculateAge = () => {
        if (!birthDate) {
            setAge(null);
            return;
        }
        const today = new Date();
        const birth = new Date(birthDate);

        if (birth > today) {
            alert("Birth date cannot be in the future.");
            setAge(null);
            return;
        }

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        setAge({ years, months, days });
    };

    return (
        <div className="w-full flex flex-col items-center gap-4">
             <input 
                type="date" 
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button onClick={calculateAge} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700">
                Calculate Age
            </button>
            {age && (
                 <div className="flex justify-around p-4 bg-gray-100 border border-gray-200 rounded-md w-full">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{age.years}</p>
                        <p className="text-sm text-gray-500">Years</p>
                    </div>
                     <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{age.months}</p>
                        <p className="text-sm text-gray-500">Months</p>
                    </div>
                     <div className="text-center">
                        <p className="text-3xl font-bold text-gray-800">{age.days}</p>
                        <p className="text-sm text-gray-500">Days</p>
                    </div>
                </div>
            )}
        </div>
    )
};

const BMICalculator: React.FC = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);
    const [bmiCategory, setBmiCategory] = useState('');

    const calculateBmi = () => {
        const h = parseFloat(height);
        const w = parseFloat(weight);
        if (h > 0 && w > 0) {
            const bmiValue = w / ((h / 100) ** 2);
            setBmi(bmiValue);
            
            if (bmiValue < 18.5) setBmiCategory('Underweight');
            else if (bmiValue < 25) setBmiCategory('Normal weight');
            else if (bmiValue < 30) setBmiCategory('Overweight');
            else setBmiCategory('Obesity');
        } else {
            setBmi(null);
            setBmiCategory('');
        }
    };

    return (
        <div className="w-full flex flex-col items-center gap-4">
            <div className="w-full space-y-4">
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Height (cm)" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight (kg)" className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"/>
            </div>
            <button onClick={calculateBmi} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-bold transition-all duration-300 hover:bg-blue-700">
                Calculate BMI
            </button>
            {bmi && (
                <div className="text-center p-4 bg-gray-100 border border-gray-200 rounded-md w-full">
                    <p className="text-sm text-gray-500">Your BMI is</p>
                    <p className="text-4xl font-bold text-gray-800">{bmi.toFixed(1)}</p>
                    <p className="font-semibold text-blue-600 mt-1">{bmiCategory}</p>
                </div>
            )}
        </div>
    )
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
            case 'speech-to-text':
                return <SpeechToText />;
            case 'password-generator':
                return <PasswordGenerator />;
            case 'age-calculator':
                return <AgeCalculator />;
            case 'bmi-calculator':
                return <BMICalculator />;
            // Add cases for other implemented tools here
            // Default to file drop zone for PDF/Image tools
            default:
                return <FileDropZone />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <tool.icon className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">{tool.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto custom-scrollbar">
                    <p className="text-gray-600 mb-6 text-center">{tool.description}</p>
                    <div className="flex justify-center">
                        {renderToolContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ToolModal;