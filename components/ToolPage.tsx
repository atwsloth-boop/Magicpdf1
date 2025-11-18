import React from 'react';
import { Tool } from '../types';

// Import all tool components
import { ComingSoon } from './tools/common';
import MergePdfTool from './tools/MergePdfTool';
import SplitPdfTool from './tools/SplitPdfTool';
import CompressPdfTool from './tools/CompressPdfTool';
import PdfToWordTool from './tools/PdfToWordTool';
import WordToPdfTool from './tools/WordToPdfTool';
import AddPageNumbersTool from './tools/AddPageNumbersTool';
import JpgToPdfTool from './tools/JpgToPdfTool';
import PdfToJpgTool from './tools/PdfToJpgTool';
import ImageConverterTool from './tools/ImageConverterTool';
import UnlockPdfTool from './tools/UnlockPdfTool';
import AddWatermarkTool from './tools/AddWatermarkTool';
import ImageCompressorTool from './tools/ImageCompressorTool';

interface ToolPageProps {
  tool: Tool;
}

// Map tool IDs to their respective components
const toolComponentMap: { [key: string]: React.ComponentType } = {
    'merge-pdf': MergePdfTool,
    'split-pdf': SplitPdfTool,
    'compress-pdf': CompressPdfTool,
    'pdf-to-word': PdfToWordTool,
    'word-to-pdf': WordToPdfTool,
    'add-page-numbers': AddPageNumbersTool,
    'jpg-to-pdf': JpgToPdfTool,
    'pdf-to-jpg': PdfToJpgTool,
    'image-converter': ImageConverterTool,
    'unlock-pdf': UnlockPdfTool,
    'add-watermark': AddWatermarkTool,
    'image-compressor': ImageCompressorTool,
};


// Main Tool Page Component
const ToolPage: React.FC<ToolPageProps> = ({ tool }) => {
  const ToolComponent = toolComponentMap[tool.id] || ComingSoon;

  return (
    <div className="bg-gray-50/50 min-h-full p-4 sm:p-6 md:p-10 animate-fade-in">
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-10">
                <div className="inline-block p-4 bg-indigo-100/50 border border-indigo-200/50 rounded-2xl mb-4">
                    <tool.icon className="w-12 h-12 text-indigo-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{tool.title}</h1>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">{tool.description}</p>
            </header>
            <main className="bg-white border border-gray-200/80 rounded-2xl shadow-lg shadow-gray-200/40 p-6 sm:p-8 md:p-10">
                <div className="flex justify-center">
                    <ToolComponent />
                </div>
            </main>
        </div>
    </div>
  );
};

export default ToolPage;
