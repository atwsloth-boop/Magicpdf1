import React from 'react';

interface AdBannerProps {
  placement: 'header' | 'footer' | 'left' | 'right';
}

const AdBanner: React.FC<AdBannerProps> = ({ placement }) => {
  const getPlacementStyles = () => {
    switch (placement) {
      case 'header':
        return 'w-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative z-20';
      case 'footer':
        return 'w-full flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 relative z-20';
      case 'left':
        return 'hidden lg:flex w-40 flex-shrink-0 p-4 relative z-20';
      case 'right':
        return 'hidden lg:flex w-40 flex-shrink-0 p-4 relative z-20';
      default:
        return '';
    }
  };

  const getAdContentStyles = () => {
     switch (placement) {
      case 'header':
      case 'footer':
        return 'w-full max-w-4xl h-24';
      case 'left':
      case 'right':
        return 'w-full h-[600px]';
      default:
        return 'w-full h-full';
    }
  }

  return (
    <aside className={getPlacementStyles()} aria-label={`Advertisement space: ${placement}`}>
        <div className={`bg-slate-800/40 border border-slate-700/50 rounded-lg flex items-center justify-center text-slate-600 font-orbitron text-xs tracking-widest uppercase ${getAdContentStyles()}`}>
            <span>Ad Space</span>
        </div>
    </aside>
  );
};

export default AdBanner;