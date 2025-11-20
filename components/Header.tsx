
import React, { useState } from 'react';
import { LogoIcon, MenuIcon, CloseIcon } from './icons/UIIcons';
import { ToolCategory } from '../types';

// Helper to generate a slug for anchor links
const toSlug = (str: string) => str.toLowerCase().replace(/\s+/g, '-');

const Header: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };
  
  const navLinkClasses = "text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200";
  const mobileNavLinkClasses = "text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors";

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <a href="/#" className="flex items-center space-x-2 group">
                <LogoIcon className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-blue-700 transition-colors">
                  MagicPDF
                </span>
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/#" className={navLinkClasses}>Home</a>
              <a href="#/tool/merge-pdf" className={navLinkClasses}>Merge PDF</a>
              <a href={`#${toSlug(ToolCategory.PDF)}`} className={navLinkClasses}>PDF Tools</a>
              <a href={`#${toSlug(ToolCategory.IMAGE)}`} className={navLinkClasses}>Image</a>
              <a href={`#${toSlug(ToolCategory.TEXT)}`} className={navLinkClasses}>Text</a>
              <a href={`#${toSlug(ToolCategory.UTILITY)}`} className={navLinkClasses}>Utilities</a>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center">
                <a href="#/tool/merge-pdf" className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                    Get Started
                </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={handleMobileMenuToggle} aria-label="Open menu" className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
             <span className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <LogoIcon className="h-6 w-6 text-blue-600" /> MagicPDF
             </span>
              <button onClick={handleMobileMenuToggle} aria-label="Close menu" className="p-2 text-gray-500 hover:text-red-500">
                  <CloseIcon className="h-8 w-8" />
              </button>
          </div>
          <nav className="flex flex-col items-center space-y-6 pt-10">
            <a href="/#" onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Home</a>
            <a href="#/tool/merge-pdf" onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Merge PDF</a>
            <a href={`#${toSlug(ToolCategory.PDF)}`} onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>PDF Tools</a>
            <a href={`#${toSlug(ToolCategory.IMAGE)}`} onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Image Tools</a>
            <a href={`#${toSlug(ToolCategory.TEXT)}`} onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Text Tools</a>
            <a href={`#${toSlug(ToolCategory.UTILITY)}`} onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Utilities</a>
          </nav>
      </div>
    </>
  );
};

export default Header;
