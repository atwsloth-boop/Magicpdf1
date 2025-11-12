
import React from 'react';
import { LogoIcon, MenuIcon } from './icons/UIIcons';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-30 border-b border-cyan-500/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-3 group">
              <LogoIcon className="h-10 w-10 text-cyan-400 transition-transform duration-500 group-hover:rotate-12" />
              <span className="text-xl font-bold text-gray-100 tracking-wider">
                Magic PDF
              </span>
            </a>
          </div>
          <div className="hidden md:block">
            <nav className="flex items-center space-x-8">
              {['Home', 'Tools', 'About', 'Contact'].map((item) => (
                <a key={item} href="#" className="relative text-gray-400 hover:text-cyan-400 transition-colors duration-300 group">
                  {item}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
                </a>
              ))}
            </nav>
          </div>
          <div className="md:hidden">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
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