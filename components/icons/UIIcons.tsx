import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} /> {/* Cyan 400 */}
          <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} /> {/* Purple 500 */}
        </linearGradient>
      </defs>
      <path stroke="url(#logo-gradient)" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline stroke="url(#logo-gradient)" points="14 2 14 8 20 8" />
      <path stroke="url(#logo-gradient)" strokeLinecap="round" strokeLinejoin="round" d="M12 12v6" />
      <path stroke="url(#logo-gradient)" strokeLinecap="round" strokeLinejoin="round" d="M9 15h6" />
      <circle cx="12" cy="12" r="1" fill="url(#logo-gradient)" stroke="none" />
    </svg>
);

export const MenuIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);