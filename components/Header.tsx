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
  
  const navLinkClasses = "relative text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors duration-300 uppercase tracking-wider group";
  const mobileNavLinkClasses = "text-xl font-semibold text-slate-300 hover:text-cyan-400 transition-colors font-orbitron tracking-widest";
  
  const navLinkUnderline = <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>;

  return (
    <>
      <header className="glass-panel sticky top-0 z-30 border-b border-slate-700/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <a href="/#" className="flex items-center space-x-3 group">
                <LogoIcon className="h-10 w-10 text-cyan-500 transition-transform duration-500 group-hover:rotate-180 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-orbitron tracking-wider neon-glow">
                  PROMPT MINDS
                </span>
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/#" className={navLinkClasses}>Home{navLinkUnderline}</a>
              <a href="#/tool/merge-pdf" className={navLinkClasses}>Merge{navLinkUnderline}</a>
              <a href={`#${toSlug(ToolCategory.PDF)}`} className={navLinkClasses}>PDF{navLinkUnderline}</a>
              <a href={`#${toSlug(ToolCategory.IMAGE)}`} className={navLinkClasses}>Image{navLinkUnderline}</a>
              <a href={`#${toSlug(ToolCategory.TEXT)}`} className={navLinkClasses}>Text{navLinkUnderline}</a>
              <a href={`#${toSlug(ToolCategory.UTILITY)}`} className={navLinkClasses}>Utils{navLinkUnderline}</a>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={handleMobileMenuToggle} aria-label="Open menu" className="p-2 text-slate-400 hover:text-cyan-400 transition-colors">
                <MenuIcon className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
          <div className="absolute top-5 right-5">
              <button onClick={handleMobileMenuToggle} aria-label="Close menu" className="p-2 text-slate-400 hover:text-cyan-400">
                  <CloseIcon className="h-10 w-10" />
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