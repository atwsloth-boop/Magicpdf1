import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
             <span className="text-lg font-bold font-orbitron text-slate-300 tracking-wide">PROMPT MINDS</span>
             <p className="text-xs text-slate-500 mt-1">
              © 2025 Prompt Minds. All Rights Reserved.
            </p>
        </div>
        <div className="flex space-x-8">
          <a href="#/privacy" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;