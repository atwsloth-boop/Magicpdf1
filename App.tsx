
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
      
      // Reset title by default
      document.title = "MagicPDF - Online PDF Tools";

      // Check for Privacy Policy route
      if (hash === '#/privacy') {
        setIsPrivacyView(true);
        setActiveToolId(null);
        document.title = "Privacy Policy - MagicPDF";
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
            // Update page title for SEO
            document.title = `${tool.title} - MagicPDF`;
            window.scrollTo(0, 0);
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Header />
      <AdBanner placement="header" />
      <div className="flex-1 flex w-full overflow-hidden relative z-10 max-w-7xl mx-auto">
        <AdBanner placement="left" />
        <main className="flex-1 overflow-y-auto custom-scrollbar w-full">
          {renderContent()}
        </main>
        <AdBanner placement="right" />
      </div>
      <AdBanner placement="footer" />
      <Footer />
    </div>
  );
};

export default App;
