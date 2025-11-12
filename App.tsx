
import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import ToolModal from './components/ToolModal';
import { Tool } from './types';
import { TOOLS } from './constants';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleSelectTool = (toolId: string) => {
    const tool = TOOLS.find(t => t.id === toolId);
    if (tool) {
      setActiveTool(tool);
    }
     if (window.innerWidth < 768) {
        setSidebarOpen(false);
    }
  };

  const closeModal = () => {
    setActiveTool(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-300">
      <Header onMenuClick={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onSelectTool={handleSelectTool} />
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <MainContent onSelectTool={handleSelectTool}/>
          <Footer />
        </div>
      </div>
      {activeTool && <ToolModal tool={activeTool} onClose={closeModal} />}
    </div>
  );
};

export default App;
