import React from 'react';

interface AdBannerProps {
  placement: 'header' | 'footer' | 'left' | 'right';
}

const AdBanner: React.FC<AdBannerProps> = ({ placement }) => {
  const getPlacementStyles = () => {
    switch (placement) {
      case 'header':
        return 'w-full flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8';
      case 'footer':
        return 'w-full flex items-center justify-center pt-4 px-4 sm:px-6 lg:px-8';
      case 'left':
        return 'hidden lg:flex w-40 flex-shrink-0 p-4';
      case 'right':
        return 'hidden lg:flex w-40 flex-shrink-0 p-4';
      default:
        return '';
    }
  };

  const getAdContentStyles = () => {
     switch (placement) {
      case 'header':
        return 'w-full max-w-4xl h-24';
      case 'footer':
        return 'w-full max-w-4xl h-24';
      case 'left':
      case 'right':
        return 'w-full h-[600px]'; // A common vertical ad height
      default:
        return 'w-full h-full';
    }
  }

  return (
    <aside className={getPlacementStyles()} aria-label={`Advertisement space: ${placement}`}>
        <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 font-semibold ${getAdContentStyles()}`}>
            <span>Advertisement</span>
        </div>
    </aside>
  );
};

export default AdBanner;
