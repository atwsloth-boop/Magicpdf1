
import React from 'react';
import { LogoIcon, MenuIcon } from './icons/UIIcons';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white sticky top-0 z-30 border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-3 group">
              <LogoIcon className="h-10 w-10 text-blue-500 transition-transform duration-300 group-hover:rotate-6" />
              <span className="text-xl font-bold text-slate-800 tracking-wider">
                Magic PDF
              </span>
            </a>
          </div>
          <div className="hidden md:block">
            <nav className="flex items-center space-x-8">
              {['Home', 'Tools', 'About', 'Contact'].map((item) => (
                <a key={item} href="#" className="relative text-slate-600 hover:text-blue-500 transition-colors duration-300 group">
                  {item}
                </a>
              ))}
            </nav>
          </div>
          <div className="md:hidden">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Open main menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;