
import React, { useState } from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import ToolModal from './components/ToolModal';
import { Tool } from './types';
import { TOOLS } from './constants';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const handleSelectTool = (toolId: string) => {
    const tool = TOOLS.find(t => t.id === toolId);
    if (tool) {
      setActiveTool(tool);
    }
  };

  const closeModal = () => {
    setActiveTool(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header onSelectTool={handleSelectTool} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <MainContent onSelectTool={handleSelectTool}/>
        <Footer />
      </div>
      {activeTool && <ToolModal tool={activeTool} onClose={closeModal} />}
    </div>
  );
};

export default App;