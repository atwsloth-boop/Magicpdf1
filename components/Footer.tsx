
import React from 'react';
import { LogoIcon } from './icons/UIIcons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                    <LogoIcon className="h-6 w-6 text-blue-500" />
                    <span className="text-xl font-bold text-white">MagicPDF</span>
                </div>
                <p className="text-sm text-gray-400">
                    Professional online PDF tools for everyone. Fast, secure, and easy to use directly in your browser.
                </p>
            </div>
            
            <div>
                <h4 className="text-white font-semibold mb-4">PDF Tools</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#/tool/merge-pdf" className="hover:text-blue-400">Merge PDF</a></li>
                    <li><a href="#/tool/split-pdf" className="hover:text-blue-400">Split PDF</a></li>
                    <li><a href="#/tool/compress-pdf" className="hover:text-blue-400">Compress PDF</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-semibold mb-4">Convert</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#/tool/pdf-to-word" className="hover:text-blue-400">PDF to Word</a></li>
                    <li><a href="#/tool/word-to-pdf" className="hover:text-blue-400">Word to PDF</a></li>
                    <li><a href="#/tool/jpg-to-pdf" className="hover:text-blue-400">JPG to PDF</a></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#/privacy" className="hover:text-blue-400">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                    <li><a href="#" className="hover:text-blue-400">Cookie Policy</a></li>
                </ul>
            </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
             <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} MagicPDF. All Rights Reserved.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
