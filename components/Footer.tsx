
import React from 'react';
import { GithubIcon, TwitterIcon, LinkedInIcon } from './icons/UIIcons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-auto border-t border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Magic PDF</h3>
            <p className="text-sm text-slate-500">Empowering your workflow with professional, easy-to-use digital tools.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Connect With Us</h3>
            <div className="flex justify-center md:justify-start space-x-6">
              <a href="#" className="text-slate-400 hover:text-blue-500 transition-transform hover:scale-110" aria-label="Github">
                <GithubIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-500 transition-transform hover:scale-110" aria-label="Twitter">
                <TwitterIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-500 transition-transform hover:scale-110" aria-label="LinkedIn">
                <LinkedInIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
          <p>© 2025 Magic PDF. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;