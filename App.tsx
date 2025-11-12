import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import ToolPage from './components/ToolPage';
import AdBanner from './components/AdBanner';
import { TOOLS } from './constants';

const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      // Get tool id from hash, e.g. #/tool/merge-pdf
      const hash = window.location.hash;
      const match = hash.match(/^#\/tool\/(.+)/);
      if (match && match[1]) {
        const tool = TOOLS.find(t => t.id === match[1]);
        if (tool) {
            setActiveToolId(match[1]);
        } else {
            // If tool doesn't exist, go back to home
            window.location.hash = '#';
            setActiveToolId(null);
        }
      } else {
        setActiveToolId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange, false);
    // Initial check on load
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    };
  }, []);

  const activeTool = activeToolId ? TOOLS.find(t => t.id === activeToolId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header />
      <AdBanner placement="header" />
      <div className="flex-1 flex w-full overflow-hidden">
        <AdBanner placement="left" />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTool ? (
            <ToolPage tool={activeTool} />
          ) : (
            <MainContent />
          )}
        </main>
        <AdBanner placement="right" />
      </div>
      <AdBanner placement="footer" />
      <Footer />
    </div>
  );
};

export default App;
