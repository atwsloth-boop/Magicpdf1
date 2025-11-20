
import React from 'react';

interface AdBannerProps {
  placement: 'header' | 'footer' | 'left' | 'right';
}

const AdBanner: React.FC<AdBannerProps> = ({ placement }) => {
  const getPlacementStyles = () => {
    switch (placement) {
      case 'header':
        return 'w-full flex items-center justify-center py-4 px-4 bg-white border-b border-gray-100 relative z-20';
      case 'footer':
        return 'w-full flex items-center justify-center py-8 px-4 bg-gray-50 border-t border-gray-200 relative z-20';
      case 'left':
        return 'hidden xl:flex w-[180px] flex-shrink-0 p-4 relative z-20 items-start';
      case 'right':
        return 'hidden xl:flex w-[180px] flex-shrink-0 p-4 relative z-20 items-start';
      default:
        return '';
    }
  };

  const getAdContentStyles = () => {
     switch (placement) {
      case 'header':
      case 'footer':
        return 'w-full max-w-[728px] h-[90px]';
      case 'left':
      case 'right':
        return 'w-[160px] h-[600px] sticky top-24';
      default:
        return 'w-full h-full';
    }
  }

  return (
    <aside className={getPlacementStyles()} aria-label={`Advertisement space: ${placement}`}>
        <div className={`bg-gray-100 border border-gray-200 rounded text-gray-400 flex flex-col items-center justify-center text-xs uppercase tracking-wide ${getAdContentStyles()}`}>
            <span className="font-bold mb-1">Advertisement</span>
            <span>Ad Space</span>
        </div>
    </aside>
  );
};

export default AdBanner;
