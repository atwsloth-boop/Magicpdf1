
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
  
  const navLinkClasses = "relative text-gray-600 hover:text-blue-600 transition-colors duration-300 group text-sm font-medium";
  const mobileNavLinkClasses = "text-2xl font-semibold text-gray-700 hover:text-blue-600 transition-colors";
  
  const navLinkUnderline = <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>;

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <a href="/#" className="flex items-center space-x-3 group">
                <LogoIcon className="h-10 w-10 text-blue-600 transition-transform duration-500 group-hover:rotate-12" />
                <span className="text-xl font-bold text-gray-800 tracking-wider">Magic PDF</span>
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="/#" className={navLinkClasses}>Home{navLinkUnderline}</a>
              <a href="#/tool/merge-pdf" className={navLinkClasses}>Merge PDF{navLinkUnderline}</a>
              <a href={`#${toSlug(ToolCategory.PDF)}`} className={navLinkClasses}>PDF Tools{navLinkUnderline}</a>
              <a href={`#${toSlug(ToolCategory.IMAGE)}`} className={navLinkClasses}>Image Tools{navLinkUnderline}</a>
              <a href={`#${toSlug(ToolCategory.TEXT)}`} className={navLinkClasses}>Text Tools{navLinkUnderline}</a>
              <a href={`#${toSlug(ToolCategory.UTILITY)}`} className={navLinkClasses}>Utility Tools{navLinkUnderline}</a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={handleMobileMenuToggle} aria-label="Open menu" className="p-2 text-gray-600 hover:text-blue-600">
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
          <div className="absolute top-0 right-0 p-4">
              <button onClick={handleMobileMenuToggle} aria-label="Close menu" className="p-2 text-gray-600 hover:text-blue-600">
                  <CloseIcon className="h-8 w-8" />
              </button>
          </div>
          <nav className="flex flex-col items-center space-y-8">
            <a href="/#" onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Home</a>
            <a href="#/tool/merge-pdf" onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Merge PDF</a>
            <a href={`#${toSlug(ToolCategory.PDF)}`} onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>PDF Tools</a>
            <a href={`#${toSlug(ToolCategory.IMAGE)}`} onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Image Tools</a>
            <a href={`#${toSlug(ToolCategory.TEXT)}`} onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Text Tools</a>
            <a href={`#${toSlug(ToolCategory.UTILITY)}`} onClick={handleMobileLinkClick} className={mobileNavLinkClasses}>Utility Tools</a>
          </nav>
      </div>
    </>
  );
};

export default Header;
