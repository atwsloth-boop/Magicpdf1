
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-center text-sm text-gray-400">
          © 2025 Magic PDF. All Rights Reserved.
        </p>
        <div className="flex space-x-6">
          <a href="#/privacy" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            Politique de Confidentialité
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
