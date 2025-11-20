import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import ToolPage from './components/ToolPage';
import AdBanner from './components/AdBanner';
import PrivacyPolicy from './components/PrivacyPolicy';
import { TOOLS } from './constants';

const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isPrivacyView, setIsPrivacyView] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // Check for Privacy Policy route
      if (hash === '#/privacy') {
        setIsPrivacyView(true);
        setActiveToolId(null);
        window.scrollTo(0, 0);
        return;
      }

      setIsPrivacyView(false);

      // Get tool id from hash, e.g. #/tool/merge-pdf
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

  const renderContent = () => {
    if (isPrivacyView) {
      return <PrivacyPolicy />;
    }
    if (activeTool) {
      return <ToolPage tool={activeTool} />;
    }
    return <MainContent />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-200 selection:bg-cyan-500 selection:text-white">
      <Header />
      <AdBanner placement="header" />
      <div className="flex-1 flex w-full overflow-hidden relative z-10">
        <AdBanner placement="left" />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>
        <AdBanner placement="right" />
      </div>
      <AdBanner placement="footer" />
      <Footer />
      
      {/* Background Ambient Glow */}
      <div className="fixed top-20 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-30">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600 blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600 blur-[120px]"></div>
      </div>
    </div>
  );
};

export default App;